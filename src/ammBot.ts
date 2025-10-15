import * as dotenv from 'dotenv';
import { Account, Provider, Wallet } from 'fuels';
import { FeeAmount, getPoolState, swapExactIn } from 'reactor-sdk-ts';
import { ETH_TOKEN, FUEL_TOKEN, getTokenDecimals, ST_FUEL_TOKEN, tokensMap, USDC_TOKEN } from './tokens';
import { fetchMarketPrice } from './priceOracle';
import { priceToSqrtPriceX96, sqrtPriceX96ToPrice } from './priceUtils';

dotenv.config();

export const {
    AMM_PRIVATE_KEY,
    AMM_PROVIDER_URL,
    REACTOR_CONTRACT_ADDRESS,
    AMM_POOLS_LIST_API,
    USDC_MAX_SWAP,
    ETH_MAX_SWAP,
    FUEL_MAX_SWAP,
    ST_FUEL_MAX_SWAP,
    FUEL_ST_FUEL_PRICE,
    POLL_PERIOD_MS,
} = process.env;

const provider = new Provider(AMM_PROVIDER_URL!!);
const wallet: Account = Wallet.fromPrivateKey(AMM_PRIVATE_KEY!!, provider);

async function arbitrageToMarketPrice(token0Id: string, token1Id: string, feeAmount: FeeAmount) {
    let poolId: [string, string, FeeAmount] = [token0Id, token1Id, feeAmount];

    const poolState = await getPoolState(REACTOR_CONTRACT_ADDRESS!!, wallet, poolId);
    let sqrtPriceX96 = poolState!!.sqrtPriceX96;

    let decimalsDiff = getTokenDecimals(token1Id) - getTokenDecimals(token0Id);
    const poolPrice = sqrtPriceX96ToPrice(sqrtPriceX96).div(10 ** decimalsDiff);

    let marketPrice = await fetchMarketPrice(token0Id, token1Id);
    console.log(`pool price: ${poolPrice.toString()}`);
    console.log(`market price: ${marketPrice.toString()}`);
    let priceDelta = poolPrice.minus(marketPrice).abs();
    let priceDeltaPerc = priceDelta.div(poolPrice).mul(100).toNumber();
    console.log(`price delta %: ${priceDeltaPerc.toFixed(2)}`);
    let sqrtPriceLimit = priceToSqrtPriceX96(marketPrice.mul(10 ** decimalsDiff));
    let swapRes;

    if (priceDeltaPerc < 1) {
        console.log(`price delta too small`);
        return 0;
    }

    if (poolPrice.gt(marketPrice)) {
        swapRes = await swapExactIn(
            REACTOR_CONTRACT_ADDRESS!!,
            wallet,
            poolId,
            token0Id,
            token1Id,
            getSwapAmount(token0Id)!!,
            '0',
            sqrtPriceLimit,
        );
        return swapRes.isStatusSuccess ? 1 : -1;
    } else if (poolPrice.lt(marketPrice)) {
        swapRes = await swapExactIn(
            REACTOR_CONTRACT_ADDRESS!!,
            wallet,
            poolId,
            token1Id,
            token0Id,
            getSwapAmount(token1Id)!!,
            '0',
            sqrtPriceLimit,
        );
        return swapRes.isStatusSuccess ? 1 : -1;
    } else {
        return 0;
    }
}

function getSwapAmount(tokenId: string) {
    if (tokenId == ETH_TOKEN) {
        return ETH_MAX_SWAP;
    } else if (tokenId == USDC_TOKEN) {
        return USDC_MAX_SWAP;
    } else if (tokenId == FUEL_TOKEN) {
        return FUEL_MAX_SWAP;
    } else if (tokenId == ST_FUEL_TOKEN) {
        return ST_FUEL_MAX_SWAP;
    } else {
        throw Error(`unsupported tokenId=${tokenId}`);
    }
}

type PoolDto = {
    baseAssetId: string,
    quoteAssetId: string,
    fee: FeeAmount,
}

async function runBot() {
    console.log('Starting Reactor V1 AMM Bot...');
    const response = await fetch(AMM_POOLS_LIST_API!!);
    const data: [PoolDto] = await response.json(); // fetching all pools
    const targetPools = data.filter(p => p.fee == FeeAmount.LOW); // filter required pools

    while (true) {
        for (let i = 0; i < targetPools.length; i++) {
            const pool = data[i];
            console.log(`base ${pool.baseAssetId}`);
            console.log(`quote ${pool.quoteAssetId}`);
            try {
                let result = await arbitrageToMarketPrice(pool.baseAssetId, pool.quoteAssetId, pool.fee);
                console.log(`result = ${result} for ${tokensMap.get(pool.baseAssetId)!!.name},${tokensMap.get(pool.quoteAssetId)!!.name},${pool.fee}`);
            } catch (err) {
                console.error(`error in rebalance: ${tokensMap.get(pool.baseAssetId)!!.name},${tokensMap.get(pool.quoteAssetId)!!.name},${pool.fee}`, err);
            }
            await new Promise((r) => setTimeout(r, Number(POLL_PERIOD_MS!!)));
        }
    }
}

runBot();