"use client";

import React, { useState } from "react";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useWriteContract,
} from "wagmi";
import { Send, ArrowRight } from "lucide-react";
import { getConfig, encryptValue } from "@/utils/inco-lite";
import { parseEther } from "viem";
import { useTokenDeploy } from "@/provider/token-deploy-provider";

const EncryptedSend = () => {
  const { address } = useAccount();
  const [amount, setAmount] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const chainId = useChainId();
  
  // Get deployedAddress from TokenDeployProvider
  const { deployedAddress, isDeploying } = useTokenDeploy();

  const send = async () => {
    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (!receiverAddress || !receiverAddress.startsWith("0x")) {
      setError("Please enter a valid receiver address");
      return;
    }
    
    if (!deployedAddress) {
      setError("No token contract deployed yet");
      return;
    }

    setError("");
    setSuccess(false);
    setIsLoading(true);

    try {
      let parsedAmount = parseEther(amount);
      // config
      const config = getConfig();

      // Encrypt the value
      const { inputCt } = await encryptValue({
        value: parsedAmount,
        address: address,
        config: config,
        contractAddress: deployedAddress,
      });

      const hash = await writeContractAsync({
        address: deployedAddress,
        abi: [
          {
            inputs: [
              {
                internalType: "address",
                name: "to",
                type: "address",
              },
              {
                internalType: "bytes",
                name: "encryptedAmount",
                type: "bytes",
              },
            ],
            name: "transfer",
            outputs: [
              {
                internalType: "bool",
                name: "",
                type: "bool",
              },
            ],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
        functionName: "transfer",
        args: [receiverAddress, inputCt],
      });

      const transaction = await publicClient.waitForTransactionReceipt({
        hash: hash,
      });

      if (transaction.status !== "success") {
        throw new Error("Transaction failed");
      }

      console.log("Transaction successful:", transaction);
      setAmount("");
      setReceiverAddress("");
      setSuccess(true);
      
      // Hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error("Transaction failed:", error);
      setError(error.message || "Transaction failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full">
      <div className="w-full bg-gray-700/40 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Send className="mr-3 text-blue-400" />
              Send Encrypted
            </h2>
          </div>

          {!deployedAddress ? (
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <p className="text-gray-300">
                No token contract deployed yet.
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Deploy a token contract to send encrypted tokens.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="text-xs text-gray-400 mb-2">
                Contract: {deployedAddress.substring(0, 10)}...{deployedAddress.substring(deployedAddress.length - 8)}
              </div>
              
              <input
                type="text"
                placeholder="Receiver Address (0x...)"
                value={receiverAddress}
                onChange={(e) => setReceiverAddress(e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                disabled={isLoading}
              />

              <input
                type="number"
                placeholder="Enter Amount to Send"
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
              
              {success && (
                <div className="bg-green-900/20 border border-green-500 text-green-400 p-3 rounded-lg text-center">
                  Tokens sent successfully!
                </div>
              )}

              <button
                onClick={send}
                className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!amount || Number(amount) <= 0 || isLoading || isDeploying}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <div className="flex items-center">
                    Send Encrypted <ArrowRight className="ml-2" />
                  </div>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EncryptedSend;