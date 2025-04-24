import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount, mnemonicToAccount } from "viem/accounts";
import { anvil } from "viem/chains";
import * as dotenv from "dotenv";
import path from "path";
import fs from "fs";
// @ts-ignore
import { HexString } from "@inco-fhevm/js/dist/binary";
// @ts-ignore
import { parseLocalEnv } from "@inco/js/local";

dotenv.config();

// Synchronously read and parse SENDER_PRIVATE_KEY from dump file
function getMainWalletSync(): HexString {
  
  const SENDER_PRIVATE_KEY = process.env.ANVIL_PRIVATE_KEY as string; 
  const key = SENDER_PRIVATE_KEY.startsWith("0x")
    ? (SENDER_PRIVATE_KEY as HexString)
    : (`0x${SENDER_PRIVATE_KEY}` as HexString);
  if (key.length !== 66) {
    throw new Error("Invalid SENDER_PRIVATE_KEY in dump file");
  }
  return key;
}

// Create account from the sync private key
const mainWalletPrivateKey = getMainWalletSync();
const account = privateKeyToAccount(mainWalletPrivateKey);

// Public client (read-only)
export const publicClient = createPublicClient({
  chain: anvil,
  transport: http(
    process.env.LOCAL_RPC_URL || "http://127.0.0.1:8545/"
  ),
});

// Wallet client (signing)
export const wallet = createWalletClient({
  account,
  chain: anvil,
  transport: http(
    process.env.LOCAL_RPC_URL || "http://127.0.0.1:8545/"
  ),
});

console.log(`✅ Wallet created: ${account.address}`);

// Generate multiple named wallets from mnemonic
const MNEMONIC = process.env.SEED_PHRASE;
if (!MNEMONIC) {
  throw new Error("Missing SEED_PHRASE in .env file");
}

export const namedWallets = {
  alice: createWalletClient({
    account: mnemonicToAccount(MNEMONIC, { path: "m/44'/60'/0'/0/0" }),
    chain: anvil,
    transport: http(
      process.env.LOCAL_RPC_URL || "http://127.0.0.1:8545/"
    ),
  }),
  bob: createWalletClient({
    account: mnemonicToAccount(MNEMONIC, { path: "m/44'/60'/0'/0/1" }),
    chain: anvil,
    transport: http(
      process.env.LOCAL_RPC_URL || "http://127.0.0.1:8545/"
    ),
  }),
  dave: createWalletClient({
    account: mnemonicToAccount(MNEMONIC, { path: "m/44'/60'/0'/0/2" }),
    chain: anvil,
    transport: http(
      process.env.LOCAL_RPC_URL || "http://127.0.0.1:8545/"
    ),
  }),
  carol: createWalletClient({
    account: mnemonicToAccount(MNEMONIC, { path: "m/44'/60'/0'/0/3" }),
    chain: anvil,
    transport: http(
      process.env.LOCAL_RPC_URL || "http://127.0.0.1:8545/"
    ),
  }),
  john: createWalletClient({
    account: mnemonicToAccount(MNEMONIC, { path: "m/44'/60'/0'/0/4" }),
    chain: anvil,
    transport: http(
      process.env.LOCAL_RPC_URL || "http://127.0.0.1:8545/"
    ),
  }),
};

console.log("✅ Named wallets created:");
Object.entries(namedWallets).forEach(([name, client]) => {
  console.log(`   - ${name}: ${client.account.address}`);
});
