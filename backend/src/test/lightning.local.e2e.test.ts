import { Lightning } from '@inco/js/lite';
import { anvil } from 'viem/chains';
import { describe } from 'vitest';
import { runE2ETest } from './lightning-test.ts';

const anvilDefaultPrivateKey2 = '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';

describe(`Lightning Local Node E2E`, { timeout: 50_000 }, async () => {
  const zap = Lightning.localNode();
  runE2ETest(Math.floor(Math.random() * 100), zap, {
    chain: anvil,
    senderPrivKey: anvilDefaultPrivateKey2,
    hostChainRpcUrl: 'http://127.0.0.1:8545',
  });
});
