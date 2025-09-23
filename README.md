# Reactor Pool AMM Bot sample
## Configuration
Create `.env` :
```
AMM_PRIVATE_KEY=
AMM_PROVIDER_URL=https://testnet.fuel.network/v1/graphql
REACTOR_CONTRACT_ADDRESS=0xebb4551879ecd41eeb720f50ca05344843acc4e05128537deb41bc92e254717d
AMM_POOLS_LIST_API=https://reactor-backend-75i7f.ondigitalocean.app/pools
```
## Run
```shell
npx tsx ./src/ammBot.ts
```
## Important code parts
Getting pool state and price:
```typescript
const poolState = await getPoolState(REACTOR_CONTRACT_ADDRESS!!, wallet, poolId);
let sqrtPriceX96 = poolState!!.sqrtPriceX96;
```

Price Conversion between X96 and decimal:
```typescript
let decimalsDiff = getTokenDecimals(token1Id) - getTokenDecimals(token0Id);
const poolPrice = sqrtPriceX96ToPrice(sqrtPriceX96).div(10 ** decimalsDiff);
```
```typescript
let marketPrice = await fetchMarketPrice(token0Id, token1Id);
let sqrtPriceLimit = priceToSqrtPriceX96(marketPrice.mul(10 ** decimalsDiff));
```

Performing swap
```typescript
await swapExactIn(
    REACTOR_CONTRACT_ADDRESS!!,
    wallet,
    poolId,
    token0Id,
    token1Id,
    maxAmountInToken0,
    '0',
    sqrtPriceLimit,
);
```