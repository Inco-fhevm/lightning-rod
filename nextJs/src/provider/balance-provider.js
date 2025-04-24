"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  useAccount,
  usePublicClient,
  useWalletClient,
  useChainId,
} from "wagmi";
import { getContract } from "viem";

import {
  ENCRYPTED_ERC20_CONTRACT_ADDRESS,
  ENCRYPTEDERC20ABI,
} from "@/utils/contract";

import { getConfig, reEncryptValue } from "@/utils/inco-lite";

const ChainBalanceContext = createContext();

export const ChainBalanceProvider = ({ children }) => {
  const { address } = useAccount();
  const [encryptedBalance, setEncryptedBalance] = useState(null);
  const [isEncryptedLoading, setIsEncryptedLoading] = useState(false);
  const [encryptedError, setEncryptedError] = useState(null);

  const publicClient = usePublicClient();
  const walletClient = useWalletClient();
  const chainId = useChainId();

  // Encrypted balance fetch function
  const fetchEncryptedBalance = useCallback(
    /**
     * @dev
     * `wc` refers to the wallet client. Pass this wallet client only if the
     * wallet client of this component is not accessible.
     *
     * This serves as a workaround, primarily needed when calling decryption
     * immediately after `writeContractAsync`.
     */

    async ({ wc: walletClient }) => {
      if (!address || !publicClient || !walletClient) return;

      setIsEncryptedLoading(true);
      setEncryptedError(null);

      try {
        const encryptedERC20Contract = getContract({
          abi: ENCRYPTEDERC20ABI,
          address: ENCRYPTED_ERC20_CONTRACT_ADDRESS,
          client: { public: publicClient, wallet: walletClient },
        });

        console.log("Fetching encrypted balance for address:", address);

        const balanceHandle = await encryptedERC20Contract.read.balanceOf([
          address,
        ]);
        console.log("Balance handle:", balanceHandle);

        if (
          // indicates balance is not generated yet
          balanceHandle.toString() ===
          "0x0000000000000000000000000000000000000000000000000000000000000000"
        ) {
          setEncryptedBalance(0);
          return;
        }

        // Get the config as per selected chain
        const cfg = await getConfig();

        console.log(cfg)
        let decrypted;

        /**
         * @dev
         * `reEncryptValue` is a function that takes a handle as input and
         * returns the decrypted value.
         */

        decrypted = await reEncryptValue({
          chainId: cfg.chainId,
          walletClient: walletClient,
          handle: balanceHandle,
        });

        setEncryptedBalance(decrypted);
      } catch (err) {
        console.error("Error fetching encrypted balance:", err);
        setEncryptedError(err.message || "Failed to fetch encrypted balance");
      } finally {
        setIsEncryptedLoading(false);
      }
    },
    [address, chainId, publicClient, walletClient]
  );

  const contextValue = useMemo(
    () => ({
      encryptedBalance,
      isEncryptedLoading,
      encryptedError,
      fetchEncryptedBalance,
    }),
    [
      encryptedBalance,
      isEncryptedLoading,
      encryptedError,
      fetchEncryptedBalance,
    ]
  );

  return (
    <ChainBalanceContext.Provider value={contextValue}>
      {children}
    </ChainBalanceContext.Provider>
  );
};

export const useChainBalance = () => {
  const context = useContext(ChainBalanceContext);
  if (context === undefined) {
    throw new Error(
      "useChainBalance must be used within a ChainBalanceProvider"
    );
  }
  return context;
};
