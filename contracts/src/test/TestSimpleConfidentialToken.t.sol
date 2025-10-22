// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8;

// import {SimpleConfidentialToken} from "../SimpleConfidentialToken.sol";
// import {IncoTest} from "@inco/lightning/src/test/IncoTest.sol";
// import {GWEI} from "@inco/shared/src/TypeUtils.sol"; // 1 GWEI = 1e9

// // IncoTest extends forge-std's Test
// contract TestSimpleConfidentialToken is IncoTest {
//     SimpleConfidentialToken token;

//     function setUp() public override {
//         // always call the parent setUp() function, which deploys the mocked Inco infrastructure
//         super.setUp();
//         token = new SimpleConfidentialToken();
//         // use `fakePrepareEuint256Ciphertext` to simulate producing a ciphertext using the @inco/js sdk
//         token.transfer(alice, fakePrepareEuint256Ciphertext(10 * GWEI));
//     }

//     function testTransfer() public {
//         vm.prank(alice);
//         token.transfer(bob, fakePrepareEuint256Ciphertext(1 * GWEI));
//         // Inco processes the operations over encrypted variables asynchronously offchain.
//         // call processAllOperations() to simulate this offchain processing, which will assign to each e-variable
//         // its encrypted value. if you don't call this function and try to simulate a decrypt on a handle
//         // resulting from an operation, it will revert.
//         processAllOperations();
//         // `getUint256Value` is a cheatcode returning the decrypted value of an euint256, without checking
//         // any access rights, it is useful in tests and doesn't exist in prod.
//         uint256 decryptedBobBalance = getUint256Value(token.balanceOf(bob));
//         uint256 decryptedAliceBalance = getUint256Value(token.balanceOf(alice));
//         assertEq(decryptedBobBalance, 1 * GWEI);
//         assertEq(decryptedAliceBalance, 9 * GWEI);
//     }
// }
