// SPDX-License-Identifier: No License
pragma solidity ^0.8;

import {CreditScoreGate} from "../CreditScoreGate.sol";
import {IncoTest} from "@inco/lightning/src/test/IncoTest.sol";
import {console} from "forge-std/console.sol";
import {inco, euint256, ebool, e} from "@inco/lightning/src/Lib.sol";

contract TestCreditScoreGate is IncoTest {
    using e for euint256;
    using e for ebool;
    using e for uint256;
    using e for address;

    CreditScoreGate gate;
    uint256 constant THRESHOLD = 700;

    function setUp() public override {
        super.setUp();
        gate = new CreditScoreGate(THRESHOLD);
        vm.deal(address(this), 10 ether);
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
    }

    // ============ CONSTRUCTOR ============

    function testThresholdSetCorrectly() public view {
        assertEq(gate.threshold(), THRESHOLD);
    }

    // ============ setCreditScore ============

    function testSetCreditScore() public {
        bytes memory ct = fakePrepareEuint256Ciphertext(800, alice, address(gate));
        vm.startPrank(alice);
        gate.setCreditScore{value: inco.getFee()}(ct);
        vm.stopPrank();
        processAllOperations();

        euint256 handle = gate.getHandle(alice);
        assertTrue(euint256.unwrap(handle) != bytes32(0));
    }

    function testSetCreditScoreUpdatesExisting() public {
        bytes memory ct1 = fakePrepareEuint256Ciphertext(500, alice, address(gate));
        vm.startPrank(alice);
        gate.setCreditScore{value: inco.getFee()}(ct1);
        vm.stopPrank();
        processAllOperations();

        euint256 handle1 = gate.getHandle(alice);

        bytes memory ct2 = fakePrepareEuint256Ciphertext(800, alice, address(gate));
        vm.startPrank(alice);
        gate.setCreditScore{value: inco.getFee()}(ct2);
        vm.stopPrank();
        processAllOperations();

        euint256 handle2 = gate.getHandle(alice);
        assertTrue(euint256.unwrap(handle1) != euint256.unwrap(handle2));
    }

    function testSetCreditScoreEmitsEvent() public {
        bytes memory ct = fakePrepareEuint256Ciphertext(800, alice, address(gate));
        vm.startPrank(alice);
        vm.expectEmit(true, false, false, false);
        emit CreditScoreGate.CreditScoreSet(alice);
        gate.setCreditScore{value: inco.getFee()}(ct);
        vm.stopPrank();
    }

    function testSetCreditScoreMultipleUsers() public {
        bytes memory ctAlice = fakePrepareEuint256Ciphertext(800, alice, address(gate));
        vm.startPrank(alice);
        gate.setCreditScore{value: inco.getFee()}(ctAlice);
        vm.stopPrank();

        bytes memory ctBob = fakePrepareEuint256Ciphertext(600, bob, address(gate));
        vm.startPrank(bob);
        gate.setCreditScore{value: inco.getFee()}(ctBob);
        vm.stopPrank();
        processAllOperations();

        assertTrue(euint256.unwrap(gate.getHandle(alice)) != bytes32(0));
        assertTrue(euint256.unwrap(gate.getHandle(bob)) != bytes32(0));
        assertTrue(euint256.unwrap(gate.getHandle(alice)) != euint256.unwrap(gate.getHandle(bob)));
    }

    // ============ getHandle ============

    function testGetHandleReturnsZeroForUnsetUser() public view {
        euint256 handle = gate.getHandle(alice);
        assertEq(euint256.unwrap(handle), bytes32(0));
    }

    function testGetHandleReturnsNonZeroAfterSet() public {
        bytes memory ct = fakePrepareEuint256Ciphertext(750, alice, address(gate));
        vm.startPrank(alice);
        gate.setCreditScore{value: inco.getFee()}(ct);
        vm.stopPrank();
        processAllOperations();

        euint256 handle = gate.getHandle(alice);
        assertTrue(euint256.unwrap(handle) != bytes32(0));
    }

    // ============ Attested Compute Verification (on-chain re-derivation) ============

    function testGeHandleConsistency() public {
        euint256 score = e.asEuint256(800);
        score.allow(address(this));
        score.allow(address(gate));
        processAllOperations();

        ebool result1 = score.ge(THRESHOLD);
        ebool result2 = score.ge(THRESHOLD);
        processAllOperations();

        assertEq(ebool.unwrap(result1), ebool.unwrap(result2));
    }

    function testGeHandleAboveThreshold() public {
        euint256 score = e.asEuint256(800);
        score.allow(address(this));
        processAllOperations();

        ebool result = score.ge(THRESHOLD);
        processAllOperations();
        assertTrue(getBoolValue(result));
    }

    function testGeHandleBelowThreshold() public {
        euint256 score = e.asEuint256(500);
        score.allow(address(this));
        processAllOperations();

        ebool result = score.ge(THRESHOLD);
        processAllOperations();
        assertFalse(getBoolValue(result));
    }

    function testGeHandleAtThreshold() public {
        euint256 score = e.asEuint256(700);
        score.allow(address(this));
        processAllOperations();

        ebool result = score.ge(THRESHOLD);
        processAllOperations();
        assertTrue(getBoolValue(result));
    }

    function testGeHandleJustBelowThreshold() public {
        euint256 score = e.asEuint256(699);
        score.allow(address(this));
        processAllOperations();

        ebool result = score.ge(THRESHOLD);
        processAllOperations();
        assertFalse(getBoolValue(result));
    }

    // ============ isApproved ============

    function testIsApprovedDefaultsFalse() public view {
        assertFalse(gate.isApproved(alice));
    }

    // ============ setCreditScore via EOA with Fee ============

    function testSetCreditScoreWithFee() public {
        bytes memory ct = fakePrepareEuint256Ciphertext(800, alice, address(gate));
        vm.startPrank(alice);
        gate.setCreditScore{value: inco.getFee()}(ct);
        vm.stopPrank();
    }

    // ============ Full Flow Integration (handle-based) ============

    function testFullFlowScoreAboveThreshold() public {
        bytes memory ct = fakePrepareEuint256Ciphertext(800, alice, address(gate));
        vm.startPrank(alice);
        gate.setCreditScore{value: inco.getFee()}(ct);
        vm.stopPrank();
        processAllOperations();

        euint256 handle = gate.getHandle(alice);
        assertTrue(euint256.unwrap(handle) != bytes32(0));

        vm.startPrank(alice);
        ebool result = handle.ge(THRESHOLD);
        vm.stopPrank();
        processAllOperations();
        assertTrue(getBoolValue(result));
    }

    function testFullFlowScoreBelowThreshold() public {
        bytes memory ct = fakePrepareEuint256Ciphertext(500, alice, address(gate));
        vm.startPrank(alice);
        gate.setCreditScore{value: inco.getFee()}(ct);
        vm.stopPrank();
        processAllOperations();

        euint256 handle = gate.getHandle(alice);
        assertTrue(euint256.unwrap(handle) != bytes32(0));

        vm.startPrank(alice);
        ebool result = handle.ge(THRESHOLD);
        vm.stopPrank();
        processAllOperations();
        assertFalse(getBoolValue(result));
    }

    function testFullFlowScoreAtThreshold() public {
        bytes memory ct = fakePrepareEuint256Ciphertext(700, alice, address(gate));
        vm.startPrank(alice);
        gate.setCreditScore{value: inco.getFee()}(ct);
        vm.stopPrank();
        processAllOperations();

        euint256 handle = gate.getHandle(alice);
        vm.startPrank(alice);
        ebool result = handle.ge(THRESHOLD);
        vm.stopPrank();
        processAllOperations();
        assertTrue(getBoolValue(result));
    }

    // ============ Access Control ============

    function testHandleAllowedForUser() public {
        bytes memory ct = fakePrepareEuint256Ciphertext(800, alice, address(gate));
        vm.startPrank(alice);
        gate.setCreditScore{value: inco.getFee()}(ct);
        vm.stopPrank();
        processAllOperations();

        euint256 handle = gate.getHandle(alice);
        assertTrue(alice.isAllowed(handle));
    }

    function testHandleAllowedForContract() public {
        bytes memory ct = fakePrepareEuint256Ciphertext(800, alice, address(gate));
        vm.startPrank(alice);
        gate.setCreditScore{value: inco.getFee()}(ct);
        vm.stopPrank();
        processAllOperations();

        euint256 handle = gate.getHandle(alice);
        assertTrue(address(gate).isAllowed(handle));
    }

    // ============ No Score Set ============

    function testGetHandleZeroForUnsetUser() public view {
        euint256 handle = gate.getHandle(carol);
        assertEq(euint256.unwrap(handle), bytes32(0));
    }

    // ============ Fuzz Tests ============

    function testFuzz_GeComparison(uint256 score) public {
        score = bound(score, 0, 10000);

        euint256 encScore = e.asEuint256(score);
        encScore.allow(address(this));
        processAllOperations();

        ebool result = encScore.ge(THRESHOLD);
        processAllOperations();

        assertEq(getBoolValue(result), score >= THRESHOLD);
    }

    function testFuzz_SetAndReadHandle(uint256 score) public {
        score = bound(score, 0, type(uint128).max);

        euint256 encScore = e.asEuint256(score);
        encScore.allow(address(this));
        processAllOperations();

        uint256 readBack = getUint256Value(encScore);
        assertEq(readBack, score);
    }

    // ============ Table-Driven Tests ============

    function testTableDrivenCreditScores() public {
        uint256[5] memory scores = [uint256(0), 699, 700, 701, 10000];
        bool[5] memory expected = [false, false, true, true, true];

        for (uint256 i = 0; i < scores.length; i++) {
            euint256 encScore = e.asEuint256(scores[i]);
            encScore.allow(address(this));
            processAllOperations();

            ebool result = encScore.ge(THRESHOLD);
            processAllOperations();

            assertEq(
                getBoolValue(result),
                expected[i],
                string.concat("Failed for score: ", vm.toString(scores[i]))
            );
        }
    }
}
