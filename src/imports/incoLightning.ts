import { Lightning } from "@inco/js";
import { PlaintextWithContext } from "@inco/js/dist/encryption";
import { hexToBytes } from "viem";
import { getAddress, formatUnits } from "viem";

const { generateSecp256k1Keypair, decodeSecp256k1PublicKey, getEciesEncryptor, incoLiteReencryptor } = Lightning;
/**
 * @dev Network configuration constants for Inco FHE operations
 * Base Sepolia testnet identifier for the network
 *
 * NOTE: Currently only operating on Base Sepolia network
 * If supporting additional networks in the future, this would need to be parameterized
 */
export const NETWORK_ID = "baseSepolia";

/**
 * @dev KMS service endpoint for reencryption operations
 * This endpoint is used to communicate with the Inco's Key Management Service
 * for secure key handling and reencryption operations
 *
 * NOTE: This endpoint is specific to Base Sepolia network
 * Currently only operating on Base Sepolia
 */
export const KMS_SERVICE_ENDPOINT = "http://localhost:50055";

/**
 * @dev Encryption scheme constants
 *
 * ENCRYPTION_SCHEME_ECIES = 1: Represents the ECIES (Elliptic Curve Integrated Encryption Scheme)
 * This value comes from the encryptionSchemes enum where:
 * - tfhe: 0
 * - ecies: 1 (used here)
 * - cryptobox: 2
 *
 * DATA_TYPE_UINT256 = 8: Specifies the data type as UINT256 (euint256) for FHE operations
 * This value comes from the handleTypes enum where euint256 = 8
 * The complete handleTypes enum includes:
 * - ebool: 0
 * - euint4: 1
 * - euint8: 2
 * - euint16: 3
 * - euint32: 4
 * - euint64: 5
 * - euint128: 6
 * - euint160: 7
 * - euint256: 8 (used here)
 * - ebytes64: 9
 * - ebytes128: 10
 * - ebytes256: 11
 */
const ENCRYPTION_SCHEME_ECIES = 1;
const DATA_TYPE_UINT256 = 8;

/**
 * Encrypts a uint
 *
 * @example
 * const encryptedValue = await encryptValue({
 *   value: 100,
 *   address: "0x123...",
 *   config: { chainId: 84532, deployedAtAddress: "0xabc...", eciesPublicKey: "0xdef..." },
 *   contractAddress: "0x456..."
 * });
 *
 * @param {Object} params - The encryption parameters
 * @param {number|string|bigint} params.value - The value to encrypt
 * @param {string} params.address - The user's wallet address
 * @param {Object} params.config - Configuration object containing chain and key info
 * @param {number|bigint} params.config.chainId - The blockchain chain ID
 * @param {string} params.config.deployedAtAddress - The address of the deployed ACL contract
 * @param {string} params.config.eciesPublicKey - The ECIES public key for encryption
 * @param {string} params.contractAddress - The address of the contract that will use the encrypted value
 *
 * @returns {Promise<Object>} Object containing inputCt (the encrypted ciphertext with handle)
 */
export const encryptValue = async ({
  value,
  address,
  config,
  contractAddress,
}: {
  value: bigint;
  address: string;
  config: any;
  contractAddress: string;
}) => {
  // Convert the input value to BigInt for proper encryption
  const valueBigInt = BigInt(value);

  // Format the contract address to checksum format for standardization
  const checksummedAddress = getAddress(contractAddress);

  // This context includes chain ID, ACL address, user address, and contract address
  const plaintextWithContext = {
    plaintext: {
      scheme: ENCRYPTION_SCHEME_ECIES,
      value: valueBigInt,
      type: DATA_TYPE_UINT256,
    },
    context: {
      hostChainId: BigInt(config.chainId),
      aclAddress: config.deployedAtAddress,
      userAddress: address,
      contractAddress: checksummedAddress,
    },
  };

  // Generate an ephemeral keypair for this encryption session
  const ephemeralKeypair = await generateSecp256k1Keypair();

  // Decode the ECIES public key from hex format to the required format for encryption
  const eciesPubKey = decodeSecp256k1PublicKey(hexToBytes(config.eciesPublicKey));

  // Get an ECIES encryptor using the public key and the generated ephemeral keypair
  const encryptor = getEciesEncryptor({
    scheme: ENCRYPTION_SCHEME_ECIES,
    pubKeyA: eciesPubKey,
    privKeyB: ephemeralKeypair,
  });

  // Encrypt the data with the context information
  const encryptedData = await encryptor(plaintextWithContext as any);

  // Return the encrypted data as inputCt (ciphertext)
  return { inputCt: encryptedData };
};

/**
 * Re-encrypts and decrypts a ciphertext handle to retrieve the original uint
 *
 * This function takes an encrypted value handle and performs reencryption
 * through the KMS service, then decrypts it to obtain the original value.
 *
 * @param {Object} params - The reencryption parameters
 * @param {number|bigint} params.chainId - The ID of the chain
 * @param {Object} params.walletClient - The wallet client for authentication
 * @param {string} params.handle - The handle of the encrypted value to decrypt
 *
 * @returns {Promise<string>} The decrypted value formatted as a string
 *
 * @throws {Error} If any required parameters are missing or if reencryption fails
 *
 * @example
 * const decryptedValue = await reEncryptValue({
 *   chainId: 84532,
 *   walletClient: yourWalletClient,
 *   handle: encryptionHandle
 * });
 */
export const reEncryptValue = async ({
  chainId,
  walletClient,
  handle,
}: {
  chainId: any;
  walletClient: any;
  handle: any;
}) => {
  // Validate that all required parameters are provided
  if (!chainId || !walletClient || !handle) {
    throw new Error("Missing required parameters for creating reencryptor");
  }

  try {
    // Create a reencryptor using the KMS service
    const reencryptor = await incoLiteReencryptor({
      chainId: chainId,
      walletClient: walletClient.data,
      kmsConnectRpcEndpointOrClient: KMS_SERVICE_ENDPOINT,
    });

    // This sends the encrypted handle to the KMS service which reencrypts it
    const decryptedResult = await reencryptor({
      handle,
    });

    // Optional formatting of the decrypted value
    const decryptedEther = formatUnits(BigInt(decryptedResult.value), 18);
    const formattedValue = parseFloat(decryptedEther).toFixed(0);

    return formattedValue;
  } catch (error) {
    throw new Error(`Failed to create reencryptor: ${(error as any).message}`);
  }
};
