import React, { useState } from "react";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useWalletClient,
  useWriteContract,
} from "wagmi";
import { parseEther } from "viem";
import {
  ENCRYPTED_ERC20_CONTRACT_ADDRESS,
  ENCRYPTEDERC20ABI,
} from "@/utils/contract";
import { useChainBalance } from "@/provider/balance-provider";
import { Lock, Unlock, RefreshCw, CreditCard } from "lucide-react";

const EncryptedTokenInterface = () => {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const walletClient = useWalletClient();

  const { fetchEncryptedBalance, encryptedBalance, isEncryptedLoading } =
    useChainBalance();

  const reEncrypt = async () => {
    try {
      await fetchEncryptedBalance({ wc: walletClient });
    } catch (error) {
      console.error("Error in reEncrypt function:", error);
      setError("Failed to refresh balance");
    }
  };
const chainId = useChainId();
  const mintcUSDC = async () => {
    try {
      console.log("chainId", chainId);
      const cUSDCMintTxHash = await writeContractAsync({
        address: ENCRYPTED_ERC20_CONTRACT_ADDRESS,
        abi: ENCRYPTEDERC20ABI,
        functionName: "mint",
        args: [parseEther(amount.toString())],
      });

      const tx = await publicClient.waitForTransactionReceipt({
        hash: cUSDCMintTxHash,
      });

      if (tx.status !== "success") {
        throw new Error("Transaction failed");
      }

      await fetchEncryptedBalance({ wc: walletClient });
    } catch (err) {
      console.error("Error minting cUSDC:", err);
      throw new Error("Failed to mint cUSDC");
    }
  };

  const handleMint = async () => {
    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount");
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
      setError("Failed to mint cUSDC");
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
                Encrypted Tokens
              </h2>
              <button
                onClick={reEncrypt}
                className="text-gray-400 hover:text-white transition-colors"
                disabled={isEncryptedLoading}
              >
                <RefreshCw
                  className={`${isEncryptedLoading ? "animate-spin" : ""}`}
                />
              </button>
            </div>

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
                      {encryptedBalance || "0.00"} cUSDC
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
                disabled={!amount || Number(amount) <= 0 || isLoading}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  "Mint cUSDC"
                )}
              </button>
            </div>
          </div>
        </div>
        {/* <p className="font-mono text-sm text-gray-400 mt-4">
          Only owner of contract can mint the token.
        </p> */}
      </div>
    </div>
  );
};

export default EncryptedTokenInterface;
