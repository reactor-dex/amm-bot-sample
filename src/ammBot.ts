import * as dotenv from 'dotenv';
import { Account, BigNumberish, BN, Provider, Wallet } from 'fuels';
import { FeeAmount, getPoolState, swapExactIn, TICK_SPACINGS } from 'reactor-sdk-ts';
import Decimal from 'decimal.js';
import { getTokenDecimals, tokensMap } from './tokens';
import { fetchMarketPrice } from './priceOracle';
import { priceToSqrtPriceX96, sqrtPriceX96ToPrice } from './priceUtils';

dotenv.config();

const {
    AMM_PRIVATE_KEY,
    AMM_PROVIDER_URL,
    REACTOR_CONTRACT_ADDRESS,
    AMM_POOLS_LIST_API,
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
    let priceDeltaPerc = priceDelta.div(poolPrice).mul(100).toNumber()
    console.log(`price delta %: ${priceDeltaPerc.toFixed(2)}`);
    let sqrtPriceLimit = priceToSqrtPriceX96(marketPrice.mul(10 ** decimalsDiff));
    let swapRes;

    if (priceDeltaPerc < 1) {
        console.log(`price delta too small`);
        return 0;
    }

    if (poolPrice.gt(marketPrice)) {
        // console.log(`moving price down from ${sqrtPriceX96} to ${sqrtPriceLimit}`);
        let maxAmountInToken0 = '100000000000';
        swapRes = await swapExactIn(
            REACTOR_CONTRACT_ADDRESS!!,
            wallet,
            poolId,
            token0Id,
            token1Id,
            maxAmountInToken0,
            '0',
            sqrtPriceLimit,
        );
        return swapRes.isStatusSuccess ? 1 : -1;
    } else if (poolPrice.lt(marketPrice)) {
        let maxAmountInToken1 = '1000000000';
        swapRes = await swapExactIn(
            REACTOR_CONTRACT_ADDRESS!!,
            wallet,
            poolId,
            token1Id,
            token0Id,
            maxAmountInToken1,
            '0',
            sqrtPriceLimit,
        );
        // console.log(`swap ok? ${JSON.stringify(swapRes.isStatusSuccess)}`);
        return swapRes.isStatusSuccess ? 1 : -1;
    } else {
        return 0;
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
    const data:[PoolDto] = await response.json();
    while (true) {
        for (let i = 0; i < data.length; i++) {
            const pool = data[i]
            try {
                let result = await arbitrageToMarketPrice(pool.baseAssetId, pool.quoteAssetId, pool.fee);
                console.log(`result = ${result} for ${tokensMap[pool.baseAssetId].name},${tokensMap[pool.quoteAssetId].name},${pool.fee}`)
            } catch (err) {
                console.error(`Error in rebalance: ${tokensMap[pool.baseAssetId].name},${tokensMap[pool.quoteAssetId].name},${pool.fee}`, err);
            }
            await new Promise((r) => setTimeout(r, 10000));
        }
    }
}

runBot();