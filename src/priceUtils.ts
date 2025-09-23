import { BigNumberish } from 'fuels';
import Decimal from 'decimal.js';

export function sqrtPriceX96ToPrice(sqrtPriceX96: BigNumberish): Decimal {
    return new Decimal(sqrtPriceX96.toString()).div(new Decimal(2).pow(96)).pow(2);
}

export function priceToSqrtPriceX96(price: Decimal): BigNumberish {
    return price.sqrt().mul(new Decimal(2).pow(96)).toFixed(0).toString();
}

