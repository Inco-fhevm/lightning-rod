import { HexString, parse } from '@inco/js';
import { Lightning } from '@inco/js/lite';
import { baseSepolia } from 'viem/chains';
import { describe } from 'vitest';
import { loadDotEnv } from '../repo.ts';
import { runE2ETest } from './lightning-test.ts';

describe(`Lightning Base Sepolia E2E`, { timeout: 50_000 }, async () => {
  loadDotEnv();
  loadDotEnv('secrets.env');
  const senderPrivKey = parse(HexString, getEnv('SENDER_PRIVATE_KEY'));
  const hostChainRpcUrls = getEnv('BASE_SEPOLIA_RPC_URL').split(',').map((url) => url.trim());
  const chain = baseSepolia;
  const zap = await Lightning.baseSepoliaTestnet({ hostChainRpcUrls });
  runE2ETest(zap, {
    chain,
    senderPrivKey,
    hostChainRpcUrls,
  });
});

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}
