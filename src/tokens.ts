export const tokensMap: { [key in string]: { name: string; symbol: string; decimals: number } } = {
    '0x410722449f15d387bbce10a0989bf349aee17090e97785d23da524997c0bc6c0': {
        name: 'bitcoin',
        symbol: 'btc',
        decimals: 8,
    },
    '0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07': {
        name: 'ethereum',
        symbol: 'eth',
        decimals: 9,
    },
    '0x0e992cf93b0608b91810c8019b1efec87581e27c26f85a356ffe7b307c5a8611': {
        name: 'usd-coin',
        symbol: 'usd',
        decimals: 6,
    },
    '0x0cfca15662bf7cd948c681a32d6c639b01a79c1ad2428a65cc09a9417bb29b88': {
        name: 'tether',
        symbol: 'usd',
        decimals: 6,
    },
    '0x20e155534c6351321855c44ef045a11cee96616c507278ed407b0946dbd68995': {
        name: 'fuel-network',
        symbol: 'fuel',
        decimals: 9,
    },
};

export function getTokenDecimals(assetId: string) {
    return tokensMap[assetId].decimals;
}

