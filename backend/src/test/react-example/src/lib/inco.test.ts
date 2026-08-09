import { anvil, base, baseSepolia } from 'viem/chains';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const lightningFactories = vi.hoisted(() => ({
  baseMainnet: vi.fn(),
  baseSepoliaTestnet: vi.fn(),
  localNode: vi.fn(),
}));

vi.mock('@inco/lightning-js/lite', () => ({
  Lightning: lightningFactories,
}));

import { createIncoLite } from './inco.ts';

describe('createIncoLite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('recognizes an equivalent local chain object by chain ID', async () => {
    const equivalentAnvilChain = { ...anvil };

    await createIncoLite(equivalentAnvilChain, 'mainnet');

    expect(lightningFactories.localNode).toHaveBeenCalledOnce();
    expect(lightningFactories.localNode).toHaveBeenCalledWith('mainnet');
    expect(lightningFactories.baseMainnet).not.toHaveBeenCalled();
    expect(lightningFactories.baseSepoliaTestnet).not.toHaveBeenCalled();
  });

  it('selects the Base mainnet factory by chain ID', async () => {
    await createIncoLite({ ...base }, 'mainnet');

    expect(lightningFactories.baseMainnet).toHaveBeenCalledOnce();
    expect(lightningFactories.localNode).not.toHaveBeenCalled();
    expect(lightningFactories.baseSepoliaTestnet).not.toHaveBeenCalled();
  });

  it('selects Base Sepolia for the supported non-local testnet', async () => {
    await createIncoLite({ ...baseSepolia }, 'mainnet');

    expect(lightningFactories.baseSepoliaTestnet).toHaveBeenCalledOnce();
    expect(lightningFactories.localNode).not.toHaveBeenCalled();
    expect(lightningFactories.baseMainnet).not.toHaveBeenCalled();
  });
});
