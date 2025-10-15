# Reactor Pool AMM Bot sample
## Configuration
Create `.env` :
```
AMM_PRIVATE_KEY=
AMM_PROVIDER_URL=https://mainnet.fuel.network/v1/graphql
REACTOR_CONTRACT_ADDRESS=0xbf42e11139c671af25030d291d9cf7fd1f8dbe01b6af69f5a8eda097544e3b7e
AMM_POOLS_LIST_API=https://prod-reactor-backend-hoxwn.ondigitalocean.app/pools
POLL_PERIOD_MS=1000

# single swap limit (with all decimals) 
# samples below are ~10usd
USDC_MAX_SWAP=10000000
ETH_MAX_SWAP=250000
FUEL_MAX_SWAP=3100000000000
ST_FUEL_MAX_SWAP=3000000000000

# hardcode for FUEL/stFUEL price
FUEL_ST_FUEL_PRICE=0.953918390
```
Notes on configuration:
- `*_MAX_SWAP` - max token amount used per single swap to arbitrage pool to market price;
- `FUEL_ST_FUEL_PRICE` - hardcoded price, since discovery not yet implemented for FUEL/stFUEL pair
- `POLL_PERIOD_MS` - delay in ms between two pools processing

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