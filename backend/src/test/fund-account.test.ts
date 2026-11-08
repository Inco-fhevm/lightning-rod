import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as Viem from 'viem';
import { anvil } from 'viem/chains';
import { fundAccount } from './react-example/src/test-helpers.js';

const { sendTransaction, waitForTransactionReceipt, createPublicClient } = vi.hoisted(() => ({
  sendTransaction: vi.fn(),
  waitForTransactionReceipt: vi.fn(),
  createPublicClient: vi.fn(),
}));

vi.mock('viem', async (importOriginal) => {
  const original = await importOriginal<typeof Viem>();
  return {
    ...original,
    createWalletClient: () => ({ sendTransaction }),
    createPublicClient,
  };
});

const hash = `0x${'12'.repeat(32)}`;
// Public Anvil fixture key, not a funded production account.
const senderPrivKey = '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';

beforeEach(() => {
  vi.clearAllMocks();
  sendTransaction.mockResolvedValue(hash);
  createPublicClient.mockReturnValue({ waitForTransactionReceipt });
});

describe('fundAccount', () => {
  it('stays pending until the funding receipt is available on the same chain and transport', async () => {
    const { promise, resolve: confirm } = Promise.withResolvers<void>();
    waitForTransactionReceipt.mockReturnValue(promise);
    let funded = false;
    const funding = fundAccount(senderPrivKey, anvil, 'http://localhost:8545').then(() => {
      funded = true;
    });

    await vi.waitFor(() => expect(waitForTransactionReceipt).toHaveBeenCalledWith({ hash }));
    expect(funded).toBe(false);
    expect(createPublicClient).toHaveBeenCalledWith({ chain: anvil, transport: expect.any(Function) });
    confirm();
    await funding;
    expect(funded).toBe(true);
  });

  it('propagates receipt lookup failures instead of allowing deployment to proceed', async () => {
    const error = new Error('receipt unavailable');
    waitForTransactionReceipt.mockRejectedValue(error);
    await expect(fundAccount(senderPrivKey, anvil, 'http://localhost:8545')).rejects.toBe(error);
  });
});
