// SPDX-License-Identifier: No License
pragma solidity ^0.8;

import {euint256, ebool, e, inco} from "@inco/lightning/src/Lib.devnet.sol";
import {Fee} from "@inco/lightning/src/lightning-parts/Fee.sol";
import {DecryptionAttestation} from "@inco/lightning/src/lightning-parts/DecryptionAttester.types.sol";
import {asBool} from "@inco/lightning/src/shared/TypeUtils.sol";
import "forge-std/console.sol";

contract AddTwo is Fee {
    using e for euint256;
    using e for uint256;
    using e for bytes;

    euint256 public resultHandle;

    function addTwo(euint256 a) external returns (euint256) {
        uint256 two = 2;
        return a.add(two.asEuint256());
    }

    function addTwoScalar(euint256 a) external returns (euint256) {
        uint256 two = 2;
        return a.add(two);
    }

    // addTwoEOA is the equivalent of addTwo, but it allows an EOA to call it
    // with an encrypted input.
    function addTwoEOA(bytes memory uint256EInput) external payable refundUnspent returns (euint256 result) {
        // require(msg.value == inco.getFee(), "Fee not paid");
        euint256 value = e.newEuint256(uint256EInput, msg.sender);
        euint256 result = this.addTwo(value);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        resultHandle = result;
        return result;
    }

    function checkAttestedCompute(
        bytes memory ciphertext,
        DecryptionAttestation memory decryption,
        uint256 p
    ) public payable returns (bool) {
        euint256 ct = e.newEuint256(ciphertext);
        console.logBytes32(ebool.unwrap(e.eq(resultHandle, ct)));
        return decryption.handle == ebool.unwrap(e.eq(resultHandle, ct));
    }

    function isValidDecryptionAttestation(
        DecryptionAttestation memory decryption,
        bytes[] memory signatures
    ) external returns (bool) {
        return inco.incoVerifier().isValidDecryptionAttestation(decryption, signatures);
    }
}
