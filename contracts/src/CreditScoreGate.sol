// SPDX-License-Identifier: No License
pragma solidity ^0.8;

import {euint256, ebool, e, inco} from "@inco/lightning/src/Lib.sol";
import {Fee} from "@inco/lightning/src/lightning-parts/Fee.sol";
import {DecryptionAttestation} from "@inco/lightning/src/lightning-parts/DecryptionAttester.types.sol";
import {asBool} from "@inco/lightning/src/shared/TypeUtils.sol";

/// @title CreditScoreGate
/// @notice Demonstrates attested compute: store an encrypted credit score, then verify
///         off-chain whether score >= threshold without revealing the actual score.
///         The covalidator attestation is submitted back on-chain to gate access.
/// @dev Mirrors the Inco documentation's attested compute example.
///      Flow: setCreditScore → getHandle → off-chain attestedCompute(handle, Ge, threshold)
///            → submitCreditCheck (verify attestation on-chain) → isApproved
contract CreditScoreGate is Fee {
    using e for euint256;
    using e for ebool;
    using e for uint256;
    using e for bytes;

    /// @notice The minimum credit score required to pass the gate
    uint256 public immutable threshold;

    /// @notice Encrypted credit score per user
    mapping(address => euint256) internal creditScores;

    /// @notice Whether a user has passed the credit check
    mapping(address => bool) public isApproved;

    /// @notice Emitted when a user sets their encrypted credit score
    event CreditScoreSet(address indexed user);

    /// @notice Emitted when a user passes the credit check
    event CreditCheckPassed(address indexed user);

    /// @notice Emitted when a user fails the credit check
    event CreditCheckFailed(address indexed user);

    constructor(uint256 _threshold) {
        threshold = _threshold;
    }

    /// @notice Store an encrypted credit score for the caller.
    /// @param ctScore Encrypted credit score bytes (from JS SDK encrypt)
    function setCreditScore(bytes memory ctScore) external payable refundUnspent {
        euint256 score = ctScore.newEuint256(msg.sender);
        creditScores[msg.sender] = score;

        // Grant access so the contract can re-derive the handle on-chain,
        // and the user can request attested compute off-chain
        e.allow(score, address(this));
        e.allow(score, msg.sender);

        emit CreditScoreSet(msg.sender);
    }

    /// @notice Read the encrypted credit score handle for a user.
    ///         The caller uses this handle with the JS SDK's attestedCompute.
    /// @param user The address whose handle to read
    /// @return The encrypted credit score handle
    function getHandle(address user) external view returns (euint256) {
        return creditScores[user];
    }

    /// @notice Submit a covalidator-attested credit check result.
    ///         The attestation proves: creditScore >= threshold, computed off-chain.
    ///         On-chain we verify: (1) valid signatures, (2) handle matches the
    ///         expected ge(creditScore, threshold), (3) result is true.
    /// @param decryption The attestation containing the computed handle and boolean value
    /// @param signatures Covalidator signatures proving the attestation is authentic
    function submitCreditCheck(
        DecryptionAttestation memory decryption,
        bytes[] memory signatures
    ) external {
        // 1. Verify covalidator signatures
        require(
            inco.incoVerifier().isValidDecryptionAttestation(decryption, signatures),
            "CreditScoreGate: invalid attestation signatures"
        );

        // 2. Re-derive the expected handle on-chain: creditScore >= threshold
        euint256 score = creditScores[msg.sender];
        require(
            euint256.unwrap(score) != bytes32(0),
            "CreditScoreGate: no credit score set"
        );
        require(
            ebool.unwrap(score.ge(threshold)) == decryption.handle,
            "CreditScoreGate: computed handle mismatch"
        );

        // 3. Read the boolean result from the attestation
        bool passed = asBool(decryption.value);

        if (passed) {
            isApproved[msg.sender] = true;
            emit CreditCheckPassed(msg.sender);
        } else {
            emit CreditCheckFailed(msg.sender);
        }
    }
}
