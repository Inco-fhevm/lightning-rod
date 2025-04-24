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
import { ENCRYPTED_ERC20_CONTRACT_ADDRESS } from "@/utils/contract";

const EncryptedSend = () => {
  const { address } = useAccount();
  const [amount, setAmount] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const chainId = useChainId();

  const send = async () => {
    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (!receiverAddress || !receiverAddress.startsWith("0x")) {
      setError("Please enter a valid receiver address");
      return;
    }

    setError("");
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
        contractAddress: ENCRYPTED_ERC20_CONTRACT_ADDRESS,
      });

      const hash = await writeContractAsync({
        address: ENCRYPTED_ERC20_CONTRACT_ADDRESS,
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

          <div className="space-y-5">
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

            <button
              onClick={send}
              className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!amount || Number(amount) <= 0 || isLoading}
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
        </div>
      </div>
    </div>
  );
};

export default EncryptedSend;
