// SPDX-License-Identifier: No License
pragma solidity ^0.8;

import {euint256, e, inco} from "@inco/lightning/src/Lib.sol";
import {IncoUtils} from "@inco/lightning/src/periphery/IncoUtils.sol";
import {DecryptionAttestation} from "@inco/lightning/src/lightning-parts/DecryptionAttester.types.sol";

contract AddTwo is IncoUtils {
    using e for euint256;
    using e for uint256;
    using e for bytes;

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
        result = this.addTwo(value);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
    }

    function isValidDecryptionAttestation(DecryptionAttestation memory decryption, bytes[] memory signatures) external view returns (bool) {
        return inco.incoVerifier().isValidDecryptionAttestation(decryption, signatures);
    }
}
