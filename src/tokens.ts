export const ETH_TOKEN = '0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07';
export const USDC_TOKEN = '0x286c479da40dc953bddc3bb4c453b608bba2e0ac483b077bd475174115395e6b';
export const FUEL_TOKEN = '0x1d5d97005e41cae2187a895fd8eab0506111e0e2f3331cd3912c15c24e3c1d82';

export const ST_FUEL_TOKEN = '0x5505d0f58bea82a052bc51d2f67ab82e9735f0a98ca5d064ecb964b8fd30c474';
export const tokensMap: Map<string, { name: string; symbol: string; decimals: number }> = new Map<string, {
    name: string;
    symbol: string;
    decimals: number
}>(
    [[ETH_TOKEN, {
        name: 'ethereum',
        symbol: 'eth',
        decimals: 9,
    }],
        [USDC_TOKEN, {
            name: 'usd-coin',
            symbol: 'usd',
            decimals: 6,
        }], [FUEL_TOKEN, {
        name: 'fuel-network',
        symbol: 'fuel',
        decimals: 9,
    }],
        [ST_FUEL_TOKEN, {
            name: 'stfuel',
            symbol: 'stfuel',
            decimals: 9,
        }],
    ]);

export function getTokenDecimals(assetId: string) {
    return tokensMap.get(assetId)!!.decimals;
}

