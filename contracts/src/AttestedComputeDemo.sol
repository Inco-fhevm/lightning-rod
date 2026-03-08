// SPDX-License-Identifier: No License
pragma solidity ^0.8;

import {euint256, ebool, e, inco} from "@inco/lightning/src/Lib.sol";
import {Fee} from "@inco/lightning/src/lightning-parts/Fee.sol";
import {DecryptionAttestation} from "@inco/lightning/src/lightning-parts/DecryptionAttester.types.sol";
import {asBool} from "@inco/lightning/src/shared/TypeUtils.sol";

/// @title AttestedComputeDemo
/// @notice Comprehensive attested compute demo covering all 6 supported operations:
///         Eq, Ne, Ge, Gt, Le, Lt. Store an encrypted value, then verify off-chain
///         comparisons on-chain via covalidator attestations.
/// @dev Each operation re-derives the expected handle on-chain and checks the
///      attestation. Results are stored per user per operation per scalar.
contract AttestedComputeDemo is Fee {
    using e for euint256;
    using e for ebool;
    using e for uint256;
    using e for bytes;

    /// @notice Operation identifiers matching AttestedComputeSupportedOps
    uint8 public constant OP_EQ = 0;
    uint8 public constant OP_NE = 1;
    uint8 public constant OP_GE = 2;
    uint8 public constant OP_GT = 3;
    uint8 public constant OP_LE = 4;
    uint8 public constant OP_LT = 5;

    /// @notice Encrypted value per user
    mapping(address => euint256) internal encryptedValues;

    /// @notice Attestation result per user per operation per scalar: results[user][op][scalar]
    mapping(address => mapping(uint8 => mapping(uint256 => bool))) public results;

    /// @notice Whether a result has been submitted: hasResult[user][op][scalar]
    mapping(address => mapping(uint8 => mapping(uint256 => bool))) public hasResult;

    event ValueSet(address indexed user);
    event AttestationVerified(address indexed user, uint8 op, uint256 scalar, bool result);

    error InvalidOperation(uint8 op);

    /// @notice Store an encrypted value for the caller.
    /// @param ct Encrypted value bytes (from JS SDK encrypt)
    function setEncryptedValue(bytes memory ct) external payable refundUnspent {
        euint256 val = ct.newEuint256(msg.sender);
        encryptedValues[msg.sender] = val;
        e.allow(val, address(this));
        e.allow(val, msg.sender);
        emit ValueSet(msg.sender);
    }

    /// @notice Read the encrypted value handle for a user.
    /// @param user The address whose handle to read
    /// @return The encrypted value handle (for off-chain attestedCompute)
    function getHandle(address user) external view returns (euint256) {
        return encryptedValues[user];
    }

    /// @notice Submit a covalidator-attested comparison result.
    ///         Verifies: (1) valid signatures, (2) re-derived handle matches,
    ///         (3) stores the boolean result.
    /// @param op Operation index (0=Eq, 1=Ne, 2=Ge, 3=Gt, 4=Le, 5=Lt)
    /// @param scalar The plaintext value used in the comparison
    /// @param decryption The attestation containing the computed handle and boolean value
    /// @param signatures Covalidator signatures proving the attestation is authentic
    function submitAttestation(
        uint8 op,
        uint256 scalar,
        DecryptionAttestation memory decryption,
        bytes[] memory signatures
    ) external {
        // 1. Verify covalidator signatures
        require(
            inco.incoVerifier().isValidDecryptionAttestation(decryption, signatures),
            "AttestedComputeDemo: invalid attestation signatures"
        );

        // 2. Load user's encrypted value
        euint256 val = encryptedValues[msg.sender];
        require(
            euint256.unwrap(val) != bytes32(0),
            "AttestedComputeDemo: no value set"
        );

        // 3. Re-derive the expected handle based on the operation
        bytes32 expectedHandle = _computeHandle(val, op, scalar);
        require(
            expectedHandle == decryption.handle,
            "AttestedComputeDemo: computed handle mismatch"
        );

        // 4. Read and store the boolean result
        bool result = asBool(decryption.value);
        results[msg.sender][op][scalar] = result;
        hasResult[msg.sender][op][scalar] = true;

        emit AttestationVerified(msg.sender, op, scalar, result);
    }

    /// @dev Re-derive the comparison handle for the given operation
    function _computeHandle(
        euint256 val,
        uint8 op,
        uint256 scalar
    ) internal returns (bytes32) {
        if (op == OP_EQ) return ebool.unwrap(val.eq(scalar));
        if (op == OP_NE) return ebool.unwrap(val.ne(scalar));
        if (op == OP_GE) return ebool.unwrap(val.ge(scalar));
        if (op == OP_GT) return ebool.unwrap(val.gt(scalar));
        if (op == OP_LE) return ebool.unwrap(val.le(scalar));
        if (op == OP_LT) return ebool.unwrap(val.lt(scalar));
        revert InvalidOperation(op);
    }
}
