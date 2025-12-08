// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

import {SimpleConfidentialToken} from "../SimpleConfidentialToken.sol";
import {IncoTest} from "@inco/lightning/src/test/IncoTest.sol";
import {GWEI} from "@inco/lightning/src/shared/TypeUtils.sol"; // 1 GWEI = 1e9
import {console} from "forge-std/console.sol";
import {inco, euint256, e} from "@inco/lightning/src/Lib.sol";

// IncoTest extends forge-std's Test
contract TestSimpleConfidentialToken is IncoTest {
    SimpleConfidentialToken token;

    function setUp() public override {
        // always call the parent setUp() function, which deploys the mocked Inco infrastructure
        super.setUp();
        token = new SimpleConfidentialToken();
        vm.deal(address(this), inco.getFee());

        // Transfer 10 GWEI from the test contract (which received the initial mint) to Alice
        // The test contract can use the euint256 version of transfer since it's a contract
        euint256 transferAmount = e.asEuint256(10 * GWEI);
        // Allow the test contract (sender) to use this value for the authorization check
        // and allow the token contract to use this value in computations
        e.allow(transferAmount, address(this));
        e.allow(transferAmount, address(token));
        token.transfer(alice, transferAmount);
        processAllOperations();

        // Verify Alice's balance
        vm.prank(alice);
        uint256 decryptedAliceBalance = getUint256Value(token.balanceOf(alice));
        assertEq(decryptedAliceBalance, 10 * GWEI);
    }

    function testTransfer() public {
        vm.deal(address(alice), inco.getFee());
        bytes memory ciphertext = fakePrepareEuint256Ciphertext(1 * GWEI, alice, address(token));
        vm.startPrank(alice);
        token.transfer{value: inco.getFee()}(bob, ciphertext);
        vm.stopPrank();
        processAllOperations();
        // Inco processes the operations over encrypted variables asynchronously offchain.
        // call processAllOperations() to simulate this offchain processing, which will assign to each e-variable
        // its encrypted value. if you don't call this function and try to simulate a decrypt on a handle
        // resulting from an operation, it will revert.
        // `getUint256Value` is a cheatcode returning the decrypted value of an euint256, without checking
        // any access rights, it is useful in tests and doesn't exist in prod.
        uint256 decryptedBobBalance = getUint256Value(token.balanceOf(bob));
        uint256 decryptedAliceBalance = getUint256Value(token.balanceOf(alice));
        assertEq(decryptedBobBalance, 1 * GWEI);
        assertEq(decryptedAliceBalance, 9 * GWEI);
    }
}
