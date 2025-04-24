import { expect } from "chai";
import { namedWallets, wallet, publicClient } from "../utils/wallet";
import {
  Address,
  getContract,
  parseEther,
  formatEther,
  getAddress,
  parseAbiItem,
} from "viem";
import contractAbi from "../artifacts/contracts/ConfidentialERC20.sol/ConfidentialERC20.json";
import { HexString } from "@inco/js/dist/binary";
// @ts-ignore
import { Lightning } from '@inco/js/lite';

describe("ConfidentialToken Tests", function () {
  let confidentialToken: any;
  let contractAddress: Address;
  let incoConfig: any;

  beforeEach(async function () {
    incoConfig = await Lightning.localNode();
    console.log("wallet address is ", wallet.account.address);
    const txHash = await wallet.deployContract({
      abi: contractAbi.abi,
      bytecode: contractAbi.bytecode as HexString,
      args: [],
    });

    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
    });
    contractAddress = receipt.contractAddress as Address;
    console.log(`✅ Contract deployed at: ${contractAddress}`);

    confidentialToken = getContract({
      address: contractAddress as HexString,
      abi: contractAbi.abi,
      client: wallet,
    });

    for (const [name, userWallet] of Object.entries(namedWallets)) {
      const balance = await publicClient.getBalance({
        address: userWallet.account.address,
      });
      const balanceEth = Number(formatEther(balance));

      if (balanceEth < 0.001) {
        const neededEth = 0.001 - balanceEth;
        console.log(`💰 Funding ${name} with ${neededEth.toFixed(6)} ETH...`);
        const tx = await wallet.sendTransaction({
          to: userWallet.account.address,
          value: parseEther(neededEth.toFixed(6)),
        });

        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log(`✅ ${name} funded: ${userWallet.account.address}`);
      }
    }
  });

  describe("Encrypted Transfer Tests", function () {
    it("It should send 1000 cUSDC from owner to alice", async function () {
      // Minting 5000 cUSDC
      console.log("\n------ 💰 Minting 5000 cUSDC for Owner ------");
      const plainTextAmountToMint = parseEther("5000");

      const txHashForMint = await wallet.writeContract({
        address: contractAddress,
        abi: contractAbi.abi,
        functionName: "mint",
        args: [plainTextAmountToMint],
      });
      await publicClient.waitForTransactionReceipt({ hash: txHashForMint });
      console.log("✅ Mint successful: 5000 cUSDC added to Owner's balance.");

      // Fetch Owner's Balance
      console.log("\n------ 🔍 Fetching Balance Handle for Owner ------");
      const eBalanceHandleForOwnerAfterMint = (await publicClient.readContract({
        address: getAddress(contractAddress),
        abi: contractAbi.abi,
        functionName: "balanceOf",
        args: [wallet.account.address],
      })) as HexString;
      console.log("balance handle for owner after mint", eBalanceHandleForOwnerAfterMint);
      const reencryptorForMainWallet = await incoConfig.getReencryptor(wallet);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for the transfer to be processed
      const decryptedBalanceForOwnerAfterMint = await reencryptorForMainWallet({ handle: eBalanceHandleForOwnerAfterMint.toString() });

      console.log(
        `🎯 Decrypted Owner Balance: ${decryptedBalanceForOwnerAfterMint.value} cUSDC`
      );
      expect(decryptedBalanceForOwnerAfterMint.value).to.equal(
        plainTextAmountToMint
      ); // ✅ Assertion

      // Encrypt 1000 cUSDC for Transfer
      const plainTextAmountToBeSent = parseEther("1000");
      console.log("\n------ 🔄 Encrypting Transfer Amount (1000 cUSDC) ------");
      const encryptedCipherText = await incoConfig.encrypt(plainTextAmountToBeSent, {
        accountAddress: wallet.account.address,
        dappAddress: contractAddress
      });

      // Transfer 1000 cUSDC from Owner to Alice
      console.log(
        `\n------ 📤 Transferring 1000 cUSDC from Owner to Alice ------`
      );
      const transferFunctionAbi = contractAbi.abi.find(
        (item) =>
          item.name === "transfer" &&
          item.inputs.length === 2 &&
          item.inputs[1].type === "bytes"
      );
      const txHashForTransfer = await wallet.writeContract({
        address: contractAddress,
        abi: [transferFunctionAbi],
        functionName: "transfer",
        args: [
          namedWallets.alice.account.address,
          encryptedCipherText
        ],
      });
      await publicClient.waitForTransactionReceipt({ hash: txHashForTransfer });
      console.log("✅ Transfer successful: 1000 cUSDC sent to Alice.");

      // Fetch Owner's Balance After Transfer
      console.log("\n------ 🔍 Fetching Updated Balance for Owner ------");
      const eBalanceHandleForOwnerAfterTransfer =
        (await publicClient.readContract({
          address: getAddress(contractAddress),
          abi: contractAbi.abi,
          functionName: "balanceOf",
          args: [wallet.account.address],
        })) as HexString;

        await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for the transfer to be processed

      console.log("balance handle for owner after transfer", eBalanceHandleForOwnerAfterTransfer);
      const decryptedBalanceForOwnerAfterTransfer = await reencryptorForMainWallet({ handle: eBalanceHandleForOwnerAfterTransfer.toString() });

      console.log(
        `🎯 Decrypted Owner Balance After Transfer: ${decryptedBalanceForOwnerAfterTransfer.value} cUSDC`
      );
      expect(decryptedBalanceForOwnerAfterTransfer.value).to.equal(
        parseEther("4000")
      );
    });
  });
});
