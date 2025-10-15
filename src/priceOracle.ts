import { FUEL_TOKEN, ST_FUEL_TOKEN, tokensMap } from './tokens';
import Decimal from 'decimal.js';
import { FUEL_ST_FUEL_PRICE } from './ammBot';

export async function fetchMarketPrice(token0Id: string, token1Id: string) {
    if (token0Id == FUEL_TOKEN && token1Id == ST_FUEL_TOKEN) {
        // todo price discovery
        return Decimal(FUEL_ST_FUEL_PRICE!!);
    }
    let token0 = tokensMap.get(token0Id)!!;
    let token1 = tokensMap.get(token1Id)!!;

    if ((token0.name == 'tether' && token1.name == 'circle') || (token0.name == 'circle' && token1.name == 'tether')) {
        return new Decimal(1); // USDT:USDC 1:1
    }

    let url = `https://api.coingecko.com/api/v3/simple/price?ids=${token0.name}&vs_currencies=${token1.symbol}`;
    const response = await fetch(url);

    const data = await response.json();
    const price = data[token0.name]?.[token1.symbol];

    return new Decimal(price);
}
