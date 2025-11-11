// SPDX-License-Identifier: No License
pragma solidity ^0.8;

import {euint256, ebool, eaddress, e, inco} from "@inco/lightning/src/Lib.sol";

contract LibTest {
    using e for euint256;
    using e for uint256;
    using e for bytes;
    using e for ebool;
    using e for bool;
    using e for eaddress;
    using e for address;

    // bytes public encryptedBytes;
    // uint256 public encryptedUint256Scalar;
    // bool public encryptedBoolScalar;
    // address public encryptedAddressScalar;
    // bytes public encryptedBytesScalar;

    // ============ ARITHMETIC OPERATIONS ============

    function testAdd(euint256 a, euint256 b) external returns (euint256) {
        euint256 result = a.add(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testAddScalar(euint256 a, uint256 b) external returns (euint256) {
        euint256 result = a.add(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testSub(euint256 a, euint256 b) external returns (euint256) {
        euint256 result = a.sub(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testSubScalar(euint256 a, uint256 b) external returns (euint256) {
        euint256 result = a.sub(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testMul(euint256 a, euint256 b) external returns (euint256) {
        euint256 result = a.mul(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testMulScalar(euint256 a, uint256 b) external returns (euint256) {
        euint256 result = a.mul(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testDiv(euint256 a, euint256 b) external returns (euint256) {
        euint256 result = a.div(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testDivScalar(euint256 a, uint256 b) external returns (euint256) {
        euint256 result = a.div(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testRem(euint256 a, euint256 b) external returns (euint256) {
        euint256 result = a.rem(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testRemScalar(euint256 a, uint256 b) external returns (euint256) {
        euint256 result = a.rem(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    // ============ BITWISE OPERATIONS ============

    function testAnd(euint256 a, euint256 b) external returns (euint256) {
        euint256 result = a.and(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testAndScalar(euint256 a, uint256 b) external returns (euint256) {
        euint256 result = a.and(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testAndBool(ebool a, ebool b) external returns (ebool) {
        ebool result = a.and(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testAndBoolScalar(ebool a, bool b) external returns (ebool) {
        ebool result = a.and(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testOr(euint256 a, euint256 b) external returns (euint256) {
        euint256 result = a.or(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testOrScalar(euint256 a, uint256 b) external returns (euint256) {
        euint256 result = a.or(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testOrBool(ebool a, ebool b) external returns (ebool) {
        ebool result = a.or(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testOrBoolScalar(ebool a, bool b) external returns (ebool) {
        ebool result = a.or(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testXor(euint256 a, euint256 b) external returns (euint256) {
        euint256 result = a.xor(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testXorScalar(euint256 a, uint256 b) external returns (euint256) {
        euint256 result = a.xor(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testXorBool(ebool a, ebool b) external returns (ebool) {
        ebool result = a.xor(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testXorBoolScalar(ebool a, bool b) external returns (ebool) {
        ebool result = a.xor(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testShl(euint256 a, euint256 b) external returns (euint256) {
        euint256 result = a.shl(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testShlScalar(euint256 a, uint256 b) external returns (euint256) {
        euint256 result = a.shl(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testShr(euint256 a, euint256 b) external returns (euint256) {
        euint256 result = a.shr(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testShrScalar(euint256 a, uint256 b) external returns (euint256) {
        euint256 result = a.shr(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testRotl(euint256 a, euint256 b) external returns (euint256) {
        euint256 result = a.rotl(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testRotlScalar(euint256 a, uint256 b) external returns (euint256) {
        euint256 result = a.rotl(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testRotr(euint256 a, euint256 b) external returns (euint256) {
        euint256 result = a.rotr(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testRotrScalar(euint256 a, uint256 b) external returns (euint256) {
        euint256 result = a.rotr(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    // ============ COMPARISON OPERATIONS ============

    function testEq(euint256 a, euint256 b) external returns (ebool) {
        ebool result = a.eq(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testEqScalar(euint256 a, uint256 b) external returns (ebool) {
        ebool result = a.eq(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testEqAddress(eaddress a, eaddress b) external returns (ebool) {
        ebool result = a.eq(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testEqAddressScalar(eaddress a, address b) external returns (ebool) {
        ebool result = a.eq(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testNe(euint256 a, euint256 b) external returns (ebool) {
        ebool result = a.ne(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testNeScalar(euint256 a, uint256 b) external returns (ebool) {
        ebool result = a.ne(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testNeAddress(eaddress a, eaddress b) external returns (ebool) {
        ebool result = a.ne(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testNeAddressScalar(eaddress a, address b) external returns (ebool) {
        ebool result = a.ne(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testGe(euint256 a, euint256 b) external returns (ebool) {
        ebool result = a.ge(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testGeScalar(euint256 a, uint256 b) external returns (ebool) {
        ebool result = a.ge(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testGt(euint256 a, euint256 b) external returns (ebool) {
        ebool result = a.gt(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testGtScalar(euint256 a, uint256 b) external returns (ebool) {
        ebool result = a.gt(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testLe(euint256 a, euint256 b) external returns (ebool) {
        ebool result = a.le(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testLeScalar(euint256 a, uint256 b) external returns (ebool) {
        ebool result = a.le(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testLt(euint256 a, euint256 b) external returns (ebool) {
        ebool result = a.lt(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testLtScalar(euint256 a, uint256 b) external returns (ebool) {
        ebool result = a.lt(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testMin(euint256 a, euint256 b) external returns (euint256) {
        euint256 result = a.min(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testMinScalar(euint256 a, uint256 b) external returns (euint256) {
        euint256 result = a.min(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testMax(euint256 a, euint256 b) external returns (euint256) {
        euint256 result = a.max(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testMaxScalar(euint256 a, uint256 b) external returns (euint256) {
        euint256 result = a.max(b);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    // ============ LOGICAL OPERATIONS ============

    function testNot(ebool a) external returns (ebool) {
        ebool result = a.not();
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    // ============ RANDOM NUMBER GENERATION ============

    function testRand() external payable returns (euint256) {
        euint256 result = e.rand();
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testRandBounded(uint256 upperBound) external payable returns (euint256) {
        euint256 result = e.randBounded(upperBound);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    function testRandBoundedEncrypted(euint256 upperBound) external payable returns (euint256) {
        euint256 result = e.randBounded(upperBound);
        e.allow(result, address(this));
        e.allow(result, msg.sender);
        return result;
    }

    // ============ ENCRYPTED INPUT CREATION ============

    function testNewEuint256(bytes memory ciphertext, address user) external payable returns (euint256) {
        require(msg.value == inco.getFee(),"Fee not paid");
        euint256 encryptedUint256 = e.newEuint256(ciphertext, user);
        e.allow(encryptedUint256, address(this));
        e.allow(encryptedUint256, user);
        return encryptedUint256;
    }

    function testNewEbool(bytes memory ciphertext, address user) external payable returns (ebool) {
        require(msg.value == inco.getFee(),"Fee not paid");
        ebool encryptedBool = e.newEbool(ciphertext, user);
        e.allow(encryptedBool, address(this));
        e.allow(encryptedBool, user);
        return encryptedBool;
    }

    function testNewEaddress(bytes memory ciphertext, address user) external payable returns (eaddress) {
        require(msg.value == inco.getFee(),"Fee not paid");
        eaddress encryptedAddress = e.newEaddress(ciphertext, user);
        e.allow(encryptedAddress, address(this));
        e.allow(encryptedAddress, user);
        return encryptedAddress;
    }

    // ============ REVEAL OPERATIONS ============

    function testRevealEUint(euint256 a) external {
        e.reveal(a);
    }

    function testRevealEBool(ebool a) external {
        e.reveal(a);
    }

    function testRevealEAddress(eaddress a) external {
        e.reveal(a);
    }
}
