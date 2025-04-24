import { getActiveLightningDeployment, getEciesEncryptor, incoLiteReencryptor } from "@inco/js/lite";
import { formatUnits, getAddress } from "viem";
// @ts-ignore
import { Lightning } from '@inco/js/lite';
import { anvil } from 'viem/chains';

export const getConfig = () => {
  return  Lightning.localNode()
};


export const encryptValue = async ({ value, address, contractAddress }) => {
  // Convert the input value to BigInt for proper encryption
  const valueBigInt = BigInt(value);

  // Format the contract address to checksum format for standardization
  const checksummedAddress = getAddress(contractAddress);


  const incoConfig = await getConfig();


  // Encrypt the data with the context information
  
  const encryptedData = await incoConfig.encrypt(valueBigInt, {
    accountAddress: address,
    dappAddress: checksummedAddress
  });
  console.log("Encrypted data:", encryptedData);

  // Return the encrypted data as inputCt (ciphertext)
  return { inputCt: encryptedData };
};

export const reEncryptValue = async ({ chainId, walletClient, handle }) => {
  // Validate that all required parameters are provided

  console.log('walletClient', walletClient);
  if (!chainId || !walletClient || !handle) {
    throw new Error("Missing required parameters for creating reencryptor");
  }

  try {
    // Create a reencryptor using the KMS service
    const incoConfig = await getConfig();
    console.log("walletClient", walletClient);
    const reencryptorForMainWallet = await incoConfig.getReencryptor(walletClient);
    const decryptedResult = await reencryptorForMainWallet({ handle: handle.toString() });

    console.log("Decrypted result:", decryptedResult);
    // Optional formatting of the decrypted value
    const decryptedEther = formatUnits(BigInt(decryptedResult.value), 18);
    const formattedValue = parseFloat(decryptedEther).toFixed(0);

    return formattedValue;
  } catch (error) {
    throw new Error(`Failed to create reencryptor: ${error.message}`);
  }
};
