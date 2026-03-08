// SPDX-License-Identifier: No License
pragma solidity ^0.8;

import {AttestedComputeDemo} from "../AttestedComputeDemo.sol";
import {IncoTest} from "@inco/lightning/src/test/IncoTest.sol";
import {console} from "forge-std/console.sol";
import {inco, euint256, ebool, e} from "@inco/lightning/src/Lib.sol";

contract TestAttestedComputeDemo is IncoTest {
    using e for euint256;
    using e for ebool;
    using e for uint256;
    using e for address;

    AttestedComputeDemo demo;

    function setUp() public override {
        super.setUp();
        demo = new AttestedComputeDemo();
        vm.deal(address(this), 10 ether);
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
    }

    // ============ CONSTANTS ============

    function testOpConstants() public view {
        assertEq(demo.OP_EQ(), 0);
        assertEq(demo.OP_NE(), 1);
        assertEq(demo.OP_GE(), 2);
        assertEq(demo.OP_GT(), 3);
        assertEq(demo.OP_LE(), 4);
        assertEq(demo.OP_LT(), 5);
    }

    // ============ setEncryptedValue ============

    function testSetEncryptedValue() public {
        bytes memory ct = fakePrepareEuint256Ciphertext(42, alice, address(demo));
        vm.startPrank(alice);
        demo.setEncryptedValue{value: inco.getFee()}(ct);
        vm.stopPrank();
        processAllOperations();

        euint256 handle = demo.getHandle(alice);
        assertTrue(euint256.unwrap(handle) != bytes32(0));
    }

    function testSetEncryptedValueEmitsEvent() public {
        bytes memory ct = fakePrepareEuint256Ciphertext(42, alice, address(demo));
        vm.startPrank(alice);
        vm.expectEmit(true, false, false, false);
        emit AttestedComputeDemo.ValueSet(alice);
        demo.setEncryptedValue{value: inco.getFee()}(ct);
        vm.stopPrank();
    }

    function testSetEncryptedValueUpdates() public {
        bytes memory ct1 = fakePrepareEuint256Ciphertext(10, alice, address(demo));
        vm.startPrank(alice);
        demo.setEncryptedValue{value: inco.getFee()}(ct1);
        vm.stopPrank();
        processAllOperations();

        euint256 h1 = demo.getHandle(alice);

        bytes memory ct2 = fakePrepareEuint256Ciphertext(20, alice, address(demo));
        vm.startPrank(alice);
        demo.setEncryptedValue{value: inco.getFee()}(ct2);
        vm.stopPrank();
        processAllOperations();

        euint256 h2 = demo.getHandle(alice);
        assertTrue(euint256.unwrap(h1) != euint256.unwrap(h2));
    }

    function testSetEncryptedValueMultipleUsers() public {
        bytes memory ctA = fakePrepareEuint256Ciphertext(100, alice, address(demo));
        vm.startPrank(alice);
        demo.setEncryptedValue{value: inco.getFee()}(ctA);
        vm.stopPrank();

        bytes memory ctB = fakePrepareEuint256Ciphertext(200, bob, address(demo));
        vm.startPrank(bob);
        demo.setEncryptedValue{value: inco.getFee()}(ctB);
        vm.stopPrank();
        processAllOperations();

        assertTrue(euint256.unwrap(demo.getHandle(alice)) != euint256.unwrap(demo.getHandle(bob)));
    }

    // ============ getHandle ============

    function testGetHandleReturnsZeroIfUnset() public view {
        euint256 handle = demo.getHandle(alice);
        assertEq(euint256.unwrap(handle), bytes32(0));
    }

    function testGetHandleNonZeroAfterSet() public {
        bytes memory ct = fakePrepareEuint256Ciphertext(50, alice, address(demo));
        vm.startPrank(alice);
        demo.setEncryptedValue{value: inco.getFee()}(ct);
        vm.stopPrank();
        processAllOperations();

        assertTrue(euint256.unwrap(demo.getHandle(alice)) != bytes32(0));
    }

    // ============ Access control ============

    function testHandleAllowedForUser() public {
        bytes memory ct = fakePrepareEuint256Ciphertext(50, alice, address(demo));
        vm.startPrank(alice);
        demo.setEncryptedValue{value: inco.getFee()}(ct);
        vm.stopPrank();
        processAllOperations();

        euint256 handle = demo.getHandle(alice);
        assertTrue(alice.isAllowed(handle));
    }

    function testHandleAllowedForContract() public {
        bytes memory ct = fakePrepareEuint256Ciphertext(50, alice, address(demo));
        vm.startPrank(alice);
        demo.setEncryptedValue{value: inco.getFee()}(ct);
        vm.stopPrank();
        processAllOperations();

        euint256 handle = demo.getHandle(alice);
        assertTrue(address(demo).isAllowed(handle));
    }

    // ============ hasResult defaults ============

    function testHasResultDefaultsFalse() public view {
        assertFalse(demo.hasResult(alice, 0, 10));
        assertFalse(demo.hasResult(alice, 1, 10));
        assertFalse(demo.hasResult(alice, 2, 10));
        assertFalse(demo.hasResult(alice, 3, 10));
        assertFalse(demo.hasResult(alice, 4, 10));
        assertFalse(demo.hasResult(alice, 5, 10));
    }

    // ============ EQ operation ============

    function testEqTrue() public {
        euint256 val = e.asEuint256(42);
        val.allow(address(this));
        processAllOperations();

        ebool result = val.eq(42);
        processAllOperations();
        assertTrue(getBoolValue(result));
    }

    function testEqFalse() public {
        euint256 val = e.asEuint256(42);
        val.allow(address(this));
        processAllOperations();

        ebool result = val.eq(99);
        processAllOperations();
        assertFalse(getBoolValue(result));
    }

    // ============ NE operation ============

    function testNeTrue() public {
        euint256 val = e.asEuint256(42);
        val.allow(address(this));
        processAllOperations();

        ebool result = val.ne(99);
        processAllOperations();
        assertTrue(getBoolValue(result));
    }

    function testNeFalse() public {
        euint256 val = e.asEuint256(42);
        val.allow(address(this));
        processAllOperations();

        ebool result = val.ne(42);
        processAllOperations();
        assertFalse(getBoolValue(result));
    }

    // ============ GE operation ============

    function testGeTrue() public {
        euint256 val = e.asEuint256(50);
        val.allow(address(this));
        processAllOperations();

        ebool result = val.ge(50);
        processAllOperations();
        assertTrue(getBoolValue(result));
    }

    function testGeFalse() public {
        euint256 val = e.asEuint256(49);
        val.allow(address(this));
        processAllOperations();

        ebool result = val.ge(50);
        processAllOperations();
        assertFalse(getBoolValue(result));
    }

    // ============ GT operation ============

    function testGtTrue() public {
        euint256 val = e.asEuint256(51);
        val.allow(address(this));
        processAllOperations();

        ebool result = val.gt(50);
        processAllOperations();
        assertTrue(getBoolValue(result));
    }

    function testGtFalseEqual() public {
        euint256 val = e.asEuint256(50);
        val.allow(address(this));
        processAllOperations();

        ebool result = val.gt(50);
        processAllOperations();
        assertFalse(getBoolValue(result));
    }

    function testGtFalseLess() public {
        euint256 val = e.asEuint256(49);
        val.allow(address(this));
        processAllOperations();

        ebool result = val.gt(50);
        processAllOperations();
        assertFalse(getBoolValue(result));
    }

    // ============ LE operation ============

    function testLeTrue() public {
        euint256 val = e.asEuint256(50);
        val.allow(address(this));
        processAllOperations();

        ebool result = val.le(50);
        processAllOperations();
        assertTrue(getBoolValue(result));
    }

    function testLeFalse() public {
        euint256 val = e.asEuint256(51);
        val.allow(address(this));
        processAllOperations();

        ebool result = val.le(50);
        processAllOperations();
        assertFalse(getBoolValue(result));
    }

    // ============ LT operation ============

    function testLtTrue() public {
        euint256 val = e.asEuint256(49);
        val.allow(address(this));
        processAllOperations();

        ebool result = val.lt(50);
        processAllOperations();
        assertTrue(getBoolValue(result));
    }

    function testLtFalseEqual() public {
        euint256 val = e.asEuint256(50);
        val.allow(address(this));
        processAllOperations();

        ebool result = val.lt(50);
        processAllOperations();
        assertFalse(getBoolValue(result));
    }

    function testLtFalseGreater() public {
        euint256 val = e.asEuint256(51);
        val.allow(address(this));
        processAllOperations();

        ebool result = val.lt(50);
        processAllOperations();
        assertFalse(getBoolValue(result));
    }

    // ============ Full flow with stored value ============

    function testFullFlowEq() public {
        bytes memory ct = fakePrepareEuint256Ciphertext(42, alice, address(demo));
        vm.startPrank(alice);
        demo.setEncryptedValue{value: inco.getFee()}(ct);
        vm.stopPrank();
        processAllOperations();

        euint256 handle = demo.getHandle(alice);
        vm.startPrank(alice);
        ebool result = handle.eq(42);
        vm.stopPrank();
        processAllOperations();
        assertTrue(getBoolValue(result));
    }

    function testFullFlowNe() public {
        bytes memory ct = fakePrepareEuint256Ciphertext(42, alice, address(demo));
        vm.startPrank(alice);
        demo.setEncryptedValue{value: inco.getFee()}(ct);
        vm.stopPrank();
        processAllOperations();

        euint256 handle = demo.getHandle(alice);
        vm.startPrank(alice);
        ebool result = handle.ne(99);
        vm.stopPrank();
        processAllOperations();
        assertTrue(getBoolValue(result));
    }

    function testFullFlowGe() public {
        bytes memory ct = fakePrepareEuint256Ciphertext(100, alice, address(demo));
        vm.startPrank(alice);
        demo.setEncryptedValue{value: inco.getFee()}(ct);
        vm.stopPrank();
        processAllOperations();

        euint256 handle = demo.getHandle(alice);
        vm.startPrank(alice);
        ebool result = handle.ge(50);
        vm.stopPrank();
        processAllOperations();
        assertTrue(getBoolValue(result));
    }

    function testFullFlowGt() public {
        bytes memory ct = fakePrepareEuint256Ciphertext(100, alice, address(demo));
        vm.startPrank(alice);
        demo.setEncryptedValue{value: inco.getFee()}(ct);
        vm.stopPrank();
        processAllOperations();

        euint256 handle = demo.getHandle(alice);
        vm.startPrank(alice);
        ebool result = handle.gt(50);
        vm.stopPrank();
        processAllOperations();
        assertTrue(getBoolValue(result));
    }

    function testFullFlowLe() public {
        bytes memory ct = fakePrepareEuint256Ciphertext(30, alice, address(demo));
        vm.startPrank(alice);
        demo.setEncryptedValue{value: inco.getFee()}(ct);
        vm.stopPrank();
        processAllOperations();

        euint256 handle = demo.getHandle(alice);
        vm.startPrank(alice);
        ebool result = handle.le(50);
        vm.stopPrank();
        processAllOperations();
        assertTrue(getBoolValue(result));
    }

    function testFullFlowLt() public {
        bytes memory ct = fakePrepareEuint256Ciphertext(30, alice, address(demo));
        vm.startPrank(alice);
        demo.setEncryptedValue{value: inco.getFee()}(ct);
        vm.stopPrank();
        processAllOperations();

        euint256 handle = demo.getHandle(alice);
        vm.startPrank(alice);
        ebool result = handle.lt(50);
        vm.stopPrank();
        processAllOperations();
        assertTrue(getBoolValue(result));
    }

    // ============ Handle consistency (same op+scalar = same handle) ============

    function testHandleConsistencyAllOps() public {
        euint256 val = e.asEuint256(42);
        val.allow(address(this));
        processAllOperations();

        ebool r1 = val.eq(10);
        ebool r2 = val.eq(10);
        processAllOperations();
        assertEq(ebool.unwrap(r1), ebool.unwrap(r2));

        r1 = val.ne(10);
        r2 = val.ne(10);
        processAllOperations();
        assertEq(ebool.unwrap(r1), ebool.unwrap(r2));

        r1 = val.ge(10);
        r2 = val.ge(10);
        processAllOperations();
        assertEq(ebool.unwrap(r1), ebool.unwrap(r2));

        r1 = val.gt(10);
        r2 = val.gt(10);
        processAllOperations();
        assertEq(ebool.unwrap(r1), ebool.unwrap(r2));

        r1 = val.le(10);
        r2 = val.le(10);
        processAllOperations();
        assertEq(ebool.unwrap(r1), ebool.unwrap(r2));

        r1 = val.lt(10);
        r2 = val.lt(10);
        processAllOperations();
        assertEq(ebool.unwrap(r1), ebool.unwrap(r2));
    }

    // ============ Fuzz tests ============

    function testFuzz_AllOps(uint256 value, uint256 scalar) public {
        value = bound(value, 0, 10000);
        scalar = bound(scalar, 0, 10000);

        euint256 enc = e.asEuint256(value);
        enc.allow(address(this));
        processAllOperations();

        ebool rEq = enc.eq(scalar);
        ebool rNe = enc.ne(scalar);
        ebool rGe = enc.ge(scalar);
        ebool rGt = enc.gt(scalar);
        ebool rLe = enc.le(scalar);
        ebool rLt = enc.lt(scalar);
        processAllOperations();

        assertEq(getBoolValue(rEq), value == scalar, "eq");
        assertEq(getBoolValue(rNe), value != scalar, "ne");
        assertEq(getBoolValue(rGe), value >= scalar, "ge");
        assertEq(getBoolValue(rGt), value > scalar, "gt");
        assertEq(getBoolValue(rLe), value <= scalar, "le");
        assertEq(getBoolValue(rLt), value < scalar, "lt");
    }

    // ============ Table-driven: all ops at boundary ============

    function testTableDrivenBoundary() public {
        uint256 val = 50;
        euint256 enc = e.asEuint256(val);
        enc.allow(address(this));
        processAllOperations();

        // scalar = 49: ne=T, ge=T, gt=T, eq=F, le=F, lt=F
        _assertEqNe(enc, 49, false, true);
        _assertGeGt(enc, 49, true, true);
        _assertLeLt(enc, 49, false, false);

        // scalar = 50: ne=F, ge=T, gt=F, eq=T, le=T, lt=F
        _assertEqNe(enc, 50, true, false);
        _assertGeGt(enc, 50, true, false);
        _assertLeLt(enc, 50, true, false);

        // scalar = 51: ne=T, ge=F, gt=F, eq=F, le=T, lt=T
        _assertEqNe(enc, 51, false, true);
        _assertGeGt(enc, 51, false, false);
        _assertLeLt(enc, 51, true, true);
    }

    function _assertEqNe(euint256 enc, uint256 scalar, bool expEq, bool expNe) internal {
        string memory label = vm.toString(scalar);
        ebool rEq = enc.eq(scalar);
        ebool rNe = enc.ne(scalar);
        processAllOperations();
        assertEq(getBoolValue(rEq), expEq, string.concat("eq@", label));
        assertEq(getBoolValue(rNe), expNe, string.concat("ne@", label));
    }

    function _assertGeGt(euint256 enc, uint256 scalar, bool expGe, bool expGt) internal {
        string memory label = vm.toString(scalar);
        ebool rGe = enc.ge(scalar);
        ebool rGt = enc.gt(scalar);
        processAllOperations();
        assertEq(getBoolValue(rGe), expGe, string.concat("ge@", label));
        assertEq(getBoolValue(rGt), expGt, string.concat("gt@", label));
    }

    function _assertLeLt(euint256 enc, uint256 scalar, bool expLe, bool expLt) internal {
        string memory label = vm.toString(scalar);
        ebool rLe = enc.le(scalar);
        ebool rLt = enc.lt(scalar);
        processAllOperations();
        assertEq(getBoolValue(rLe), expLe, string.concat("le@", label));
        assertEq(getBoolValue(rLt), expLt, string.concat("lt@", label));
    }

    // ============ Edge cases ============

    function testZeroValue() public {
        euint256 val = e.asEuint256(0);
        val.allow(address(this));
        processAllOperations();

        ebool rEq = val.eq(0);
        ebool rNe = val.ne(0);
        processAllOperations();
        assertTrue(getBoolValue(rEq));
        assertFalse(getBoolValue(rNe));

        ebool rGe = val.ge(0);
        ebool rGt = val.gt(0);
        processAllOperations();
        assertTrue(getBoolValue(rGe));
        assertFalse(getBoolValue(rGt));

        ebool rLe = val.le(0);
        ebool rLt = val.lt(0);
        processAllOperations();
        assertTrue(getBoolValue(rLe));
        assertFalse(getBoolValue(rLt));
    }
}
