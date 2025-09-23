"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const jsbi_1 = __importDefault(require("jsbi"));
const fuels_1 = require("fuels");
const reactor_ts_sdk_1 = require("reactor-ts-sdk");
dotenv.config();
// Env vars
const { PRIVATE_KEY, PROVIDER_RPC_URL, REACTOR_CONTRACT_ADDRESS, TOKEN0, TOKEN1, FEE_AMOUNT, } = process.env;
const provider = new fuels_1.Provider(PROVIDER_RPC_URL);
const wallet = fuels_1.Wallet.fromPrivateKey(PRIVATE_KEY, provider);
const FEE_AMOUNT_ENUM = Number(FEE_AMOUNT);
const TICK_SPACING = reactor_ts_sdk_1.TICK_SPACINGS[FEE_AMOUNT_ENUM];
function sqrtPriceX96ToPrice(sqrtPriceX96) {
    const sqrt = sqrtPriceX96.toString();
    return (new fuels_1.BN(sqrt).div(2 ** 96).pow(2));
}
function getCenteredTicks(price, ticksRadius) {
    const closestTick = reactor_ts_sdk_1.TickMath.getTickAtSqrtRatio(jsbi_1.default.BigInt(price.toString()));
    const baseTick = (0, reactor_ts_sdk_1.getUsableTick)(closestTick, TICK_SPACING);
    return {
        lowerTick: baseTick - TICK_SPACING * ticksRadius,
        upperTick: baseTick + TICK_SPACING * ticksRadius,
    };
}
// ====== Main Bot Loop ======
async function rebalance() {
    const token0Id = { bits: TOKEN0 };
    const token1Id = { bits: TOKEN1 };
    const poolState = await (0, reactor_ts_sdk_1.getPoolState)(REACTOR_CONTRACT_ADDRESS, wallet, [token0Id, token1Id, FEE_AMOUNT_ENUM]);
    const price = sqrtPriceX96ToPrice(poolState.sqrtPriceX96);
    console.log(`Current price: ${price.toString()}`);
    const { lowerTick, upperTick } = getCenteredTicks(price, 10);
    console.log(`New tick range: ${lowerTick} to ${upperTick}`);
}
async function runBot() {
    console.log('Starting Reactor V1 AMM Bot...');
    while (true) {
        try {
            await rebalance();
        }
        catch (err) {
            console.error('Error in rebalance:', err);
        }
        await new Promise((r) => setTimeout(r, 5000)); // wait 5 mins
    }
}
runBot();
//# sourceMappingURL=ammBot.js.map