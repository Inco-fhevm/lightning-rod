import React, { useState, useEffect } from "react";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useWalletClient,
  useWriteContract,
} from "wagmi";
import { parseEther, getContract } from "viem";
import { ENCRYPTEDERC20ABI } from "@/utils/contract";
import { useChainBalance } from "@/provider/balance-provider";
import { useTokenDeploy } from "@/provider/token-deploy-provider";
import { Lock, Unlock, RefreshCw, CreditCard } from "lucide-react";

const EncryptedTokenInterface = () => {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();

  // Use the token deploy context instead of hardcoded contract address
  const { 
    deployedAddress,
    isDeploying
  } = useTokenDeploy();

  const { fetchEncryptedBalance, encryptedBalance, isEncryptedLoading } =
    useChainBalance();

  // Refresh balance when deployedAddress changes
  useEffect(() => {
    if (deployedAddress && walletClient) {
      fetchEncryptedBalance({ wc: walletClient });
    }
  }, [deployedAddress, walletClient]);

  const reEncrypt = async () => {
    try {
      await fetchEncryptedBalance({ wc: walletClient });
    } catch (error) {
      console.error("Error in reEncrypt function:", error);
      setError("Failed to refresh balance");
    }
  };

  const mintcUSDC = async () => {
    if (!deployedAddress) {
      throw new Error("No deployed token contract available");
    }

    try {
      console.log("Minting on chainId", chainId);
      const mintTxHash = await writeContractAsync({
        address: deployedAddress,
        abi: ENCRYPTEDERC20ABI,
        functionName: "mint",
        args: [parseEther(amount.toString())],
      });

      const tx = await publicClient.waitForTransactionReceipt({
        hash: mintTxHash,
      });

      if (tx.status !== "success") {
        throw new Error("Transaction failed");
      }

      await fetchEncryptedBalance({ wc: walletClient });
    } catch (err) {
      console.error("Error minting tokens:", err);
      throw new Error("Failed to mint tokens");
    }
  };

  const handleMint = async () => {
    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (!deployedAddress) {
      setError("No deployed token contract available. Please deploy a token first.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      await mintcUSDC();

      // Reset form
      setAmount("");
    } catch (err) {
      console.error("Minting error:", err);
      setError("Failed to mint tokens");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full">
      <div className="w-full">
        <div className="w-full bg-gray-700/40 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <CreditCard className="mr-3 text-blue-400" />
                Your Tokens
              </h2>
              <button
                onClick={reEncrypt}
                className="text-gray-400 hover:text-white transition-colors"
                disabled={isEncryptedLoading || !deployedAddress}
              >
                <RefreshCw
                  className={`${isEncryptedLoading ? "animate-spin" : ""}`}
                />
              </button>
            </div>

            {!deployedAddress ? (
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <p className="text-gray-300">
                  No token contract deployed yet.
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Deploy a token contract to mint and manage tokens.
                </p>
              </div>
            ) : (
              <>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Encrypted Balance</span>
                    <div className="flex items-center">
                      {isEncryptedLoading ? (
                        <span className="text-gray-500 animate-pulse">
                          Loading...
                        </span>
                      ) : (
                        <span className="text-white font-semibold">
                          {encryptedBalance || "0.00"} Tokens
                        </span>
                      )}
                      {encryptedBalance ? (
                        <Lock className="ml-2 text-blue-400 w-4 h-4" />
                      ) : (
                        <Unlock className="ml-2 text-red-400 w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-400 px-1">
                  Contract: {deployedAddress.substring(0, 10)}...{deployedAddress.substring(deployedAddress.length - 8)}
                </div>

                <div className="space-y-4">
                  <input
                    type="number"
                    placeholder="Enter Amount to Mint"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    disabled={isLoading}
                  />

                  {error && (
                    <div className="bg-red-900/20 border border-red-500 text-red-400 p-3 rounded-lg text-center">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleMint}
                    className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!amount || Number(amount) <= 0 || isLoading || isDeploying}
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      "Mint Tokens"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EncryptedTokenInterface;