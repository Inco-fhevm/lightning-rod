// SPDX-License-Identifier: No License
pragma solidity ^0.8;

import {euint256, ebool, e} from "@inco/lightning/src/Lib.sol";

contract AddTwo {
    using e for euint256;
    using e for uint256;
    using e for bytes;

    // Stores the result of the last callback.
    uint256 public lastResult;

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
    function addTwoEOA(
        bytes memory uint256EInput
    ) external returns (euint256 result) {
        euint256 value = uint256EInput.newEuint256(msg.sender);
        euint256 result = this.addTwo(value);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
    }
}
