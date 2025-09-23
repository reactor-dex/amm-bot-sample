import { tokensMap } from './tokens';
import Decimal from 'decimal.js';

export async function fetchMarketPrice(token0Id: string, token1Id: string) {
    let token0 = tokensMap[token0Id];
    let token1 = tokensMap[token1Id];
    if ((token0.name == 'tether' && token1.name == 'circle') || (token0.name == 'circle' && token1.name == 'tether')) {
        return new Decimal(1);
    }

    if (token0.symbol == 'usd' && token1.symbol == 'fuel') {
        let url = `https://api.coingecko.com/api/v3/simple/price?ids=fuel-network&vs_currencies=usd`;
        const response = await fetch(url);

        const data = await response.json();
        const price = data["fuel-network"]?.["usd"];

        return new Decimal(1).div(new Decimal(price));
    } else {
        let url = `https://api.coingecko.com/api/v3/simple/price?ids=${token0.name}&vs_currencies=${token1.symbol}`;
        const response = await fetch(url);

        const data = await response.json();
        const price = data[token0.name]?.[token1.symbol];

        return new Decimal(price);
    }
}
