"use client";

import React from "react";
import { ChainBalanceProvider } from "@/provider/balance-provider";
import { TokenDeployProvider } from "@/provider/token-deploy-provider";

export default function AppWrapper({ children }) {
  return (
    <TokenDeployProvider>
      <ChainBalanceProvider>
        {children}
      </ChainBalanceProvider>
    </TokenDeployProvider>
  );
}