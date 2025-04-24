"use client";

import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useDisconnect } from "wagmi";
import { useEffect, useState } from "react";
import { Wallet, LogOut, User } from "lucide-react";
import EncryptedTokenInterface from "@/components/encrypted-token-ineterface";
import EncryptedSend from "@/components/encrypted-send";
import contractArtifact from "@/utils/artifact";

export default function Home() {
  const { isConnected, address } = useAccount();
  const { open } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [mounted, setMounted] = useState(false);
  // Deployment state
  const [deploying, setDeploying] = useState(false);
  const [deployedAddress, setDeployedAddress] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDisconnect = () => {
    try {
      disconnect();
      setTimeout(() => window.location.reload(), 100);
    } catch (err) {
      console.error("Disconnect error:", err);
    }
  };

  const handleConnect = () => {
    try {
      open();
    } catch (err) {
      console.error("Connect error:", err);
    }
  };

  const handleDeploy = async () => {
    if (!walletClient) {
      console.error("No wallet client available");
      return;
    }
    setDeploying(true);
    try {
      const { abi, bytecode } = contractArtifact;
      const txHash = await walletClient.deployContract({ abi, bytecode, args: [] });
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      setDeployedAddress(receipt.contractAddress);
      console.log("Contract deployed at", receipt.contractAddress);
    } catch (err) {
      console.error("Deployment failed:", err);
    } finally {
      setDeploying(false);
    }
  };

  if (!mounted) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-white animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto p-6">
        {/* Deploy ERC20 Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleDeploy}
            disabled={deploying || !walletClient}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {deploying
              ? "Deploying..."
              : deployedAddress
              ? "Deployed"
              : "Deploy ERC20"}
          </button>
        </div>
        {deployedAddress && (
          <div className="text-sm text-gray-300 mb-4">
            Deployed at: <span className="text-green-400">{deployedAddress}</span>
          </div>
        )}

        {/* Header + Wallet UI */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Wallet className="text-blue-400" />
            Encrypted Tokens
          </h1>
          <div>
            {isConnected ? (
              <div className="flex items-center gap-4 bg-gray-800 p-2 rounded-lg border border-gray-700">
                <div className="flex items-center gap-2">
                  <User className="text-blue-400 w-5 h-5" />
                  <span className="text-sm text-white truncate max-w-[150px]">
                    {address.substring(0, 6)}...{address.substring(address.length - 4)}
                  </span>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2"
              >
                <Wallet className="w-5 h-5" />
                Connect Wallet
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        {isConnected ? (
          <div className="grid md:grid-cols-2 place-items-start gap-6 mt-32">
            <EncryptedTokenInterface />
            <EncryptedSend />
          </div>
        ) : (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-10 text-center shadow-2xl">
            <Wallet className="mx-auto mb-4 w-12 h-12 text-blue-400" />
            <p className="text-white text-lg mb-4">
              Connect your wallet to access encrypted tokens
            </p>
            <button
              onClick={handleConnect}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-colors"
            >
              Connect Wallet
            </button>
          </div>
        )}
      </div>
    </div>
  );
}