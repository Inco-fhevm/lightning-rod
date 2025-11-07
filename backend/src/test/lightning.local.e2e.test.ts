import { Lightning } from '@inco/js/lite';
import { Hex } from 'viem';
import { anvil } from 'viem/chains';
import { describe } from 'vitest';
import { runE2ETest, runLibTestE2ETest } from './lightning-test.ts';

describe(`Lightning Local Node E2E`, { timeout: 50_000 }, async () => {
  const zap = await Lightning.localNode('alphanet');
  runE2ETest(Math.floor(Math.random() * 100), zap, {
    chain: anvil,
    senderPrivKey: zap.deployment.senderPrivateKey as Hex,
    hostChainRpcUrl: 'http://127.0.0.1:8545',
  });
  runLibTestE2ETest(zap, {
    chain: anvil,
    senderPrivKey: zap.deployment.senderPrivateKey as Hex,
    hostChainRpcUrl: 'http://127.0.0.1:8545',
  });
});
