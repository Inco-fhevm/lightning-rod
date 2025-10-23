import { defineConfig } from "@wagmi/cli";
import { foundry } from "@wagmi/cli/plugins";

export default defineConfig([
  {
    out: "src/generated/abis.ts",
    plugins: [
      foundry({
        project: "../contracts/",
        include: ["AddTwo.sol/**", "SimpleConfidentialToken.sol/**", "LibTest.sol/**"],
      }),
    ],
  },
]);
