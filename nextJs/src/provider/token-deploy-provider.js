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
import contractArtifact from "@/utils/artifact";

const TokenDeployContext = createContext();

export const TokenDeployProvider = ({ children }) => {
  const { address } = useAccount();
  const [deployedAddress, setDeployedAddress] = useState(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployError, setDeployError] = useState(null);
  const [deployTxHash, setDeployTxHash] = useState(null);

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();

  // Deploy token function
  const deployToken = useCallback(
    async ({ customWalletClient, tokenName, tokenSymbol, initialSupply }) => {
      // Use provided wallet client or the hook's client
      const client = customWalletClient || walletClient;
      
      if (!address || !publicClient || !client) {
        setDeployError("Wallet not connected");
        return null;
      }

      setIsDeploying(true);
      setDeployError(null);

      try {
        const { abi, bytecode } = contractArtifact;
        
   
        // Deploy the contract
        const txHash = await client.deployContract({
          abi,
          bytecode,
        //   args: [name, symbol, supply]
        });
        
        setDeployTxHash(txHash);
        console.log("Deployment transaction hash:", txHash);
        
        // Wait for the transaction receipt
        const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
        const contractAddress = receipt.contractAddress;
        
        setDeployedAddress(contractAddress);
        console.log("Contract deployed at:", contractAddress);
        
        return contractAddress;
      } catch (err) {
        console.error("Token deployment failed:", err);
        setDeployError(err.message || "Failed to deploy token");
        return null;
      } finally {
        setIsDeploying(false);
      }
    },
    [address, publicClient, walletClient, chainId]
  );

  // Get the deployed contract instance
  const getDeployedContract = useCallback(
    (contractAddress) => {
      if (!publicClient || !walletClient || !contractAddress) return null;
      
      const address = contractAddress || deployedAddress;
      if (!address) return null;
      
      try {
        return getContract({
          abi: contractArtifact.abi,
          address,
          client: { public: publicClient, wallet: walletClient },
        });
      } catch (err) {
        console.error("Error getting contract instance:", err);
        return null;
      }
    },
    [publicClient, walletClient, deployedAddress]
  );

  // Reset deployment state
  const resetDeployment = useCallback(() => {
    setDeployedAddress(null);
    setDeployTxHash(null);
    setDeployError(null);
  }, []);

  const contextValue = useMemo(
    () => ({
      deployedAddress,
      isDeploying,
      deployError,
      deployTxHash,
      deployToken,
      getDeployedContract,
      resetDeployment,
    }),
    [
      deployedAddress,
      isDeploying,
      deployError,
      deployTxHash,
      deployToken,
      getDeployedContract,
      resetDeployment,
    ]
  );

  return (
    <TokenDeployContext.Provider value={contextValue}>
      {children}
    </TokenDeployContext.Provider>
  );
};

export const useTokenDeploy = () => {
  const context = useContext(TokenDeployContext);
  if (context === undefined) {
    throw new Error(
      "useTokenDeploy must be used within a TokenDeployProvider"
    );
  }
  return context;
};