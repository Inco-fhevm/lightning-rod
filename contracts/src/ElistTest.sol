// SPDX-License-Identifier: No License
pragma solidity ^0.8;

import {ePreview,elist,ETypes} from "@inco/lightning-preview/src/Preview.Lib.sol";
import {euint256, ebool, eaddress, e, inco} from "@inco/lightning/src/Lib.sol";

contract ElistTest {

    elist public list;
    elist public newRangeList;
    elist public boolList;

    function newEList(bytes[] memory inputs, ETypes listType, address user)
        public
        payable
        returns (elist)
    {
        require(msg.value >= inco.getFee() * inputs.length, "Fee not paid");
        list = ePreview.newEList(inputs, listType, user);
        inco.allow(elist.unwrap(list), address(this));
        inco.allow(elist.unwrap(list), address(msg.sender));
        return list;
    }

    function listAppend(bytes memory ctValue) public payable returns (elist) {
        require(msg.value >= inco.getFee(), "Fee not paid");
        euint256 handle = e.newEuint256(ctValue, msg.sender);
        inco.allow(euint256.unwrap(handle), address(this));
        inco.allow(euint256.unwrap(handle), address(msg.sender));
        list = ePreview.append(list, handle);
        inco.allow(elist.unwrap(list), address(this));
        inco.allow(elist.unwrap(list), address(msg.sender));
        return list;
    }

    function listGet(uint16 index) public returns (euint256) {
        euint256 res = ePreview.getEuint256(list, index);
        inco.allow(euint256.unwrap(res), msg.sender);
        return res;
    }

    function newEList(bytes32[] memory handles, ETypes listType) public returns (elist) {
        list = ePreview.newEList(handles, listType);
        inco.allow(elist.unwrap(list), address(this));
        inco.allow(elist.unwrap(list), address(msg.sender));
        return list;
    }

    function listGetOr(bytes memory ctIndex, bytes memory ctDefaultValue)
        public
        payable
        returns (euint256)
    {
        require(msg.value >= inco.getFee() * 2, "Fee not paid");
        euint256 index = e.newEuint256(ctIndex, msg.sender);
        euint256 defaultValue = e.newEuint256(ctDefaultValue, msg.sender);
        euint256 res = ePreview.getOr(list, index, defaultValue);
        inco.allow(euint256.unwrap(res), msg.sender);
        return res;
    }

    function listSet(bytes memory ctIndex, bytes memory ctValue) public payable returns (elist) {
        require(msg.value >= inco.getFee() * 2, "Fee not paid");
        euint256 index = e.newEuint256(ctIndex, msg.sender);
        euint256 value = e.newEuint256(ctValue, msg.sender);
        list = ePreview.set(list, index, value);
        inco.allow(elist.unwrap(list), address(this));
        inco.allow(elist.unwrap(list), address(msg.sender));
        return list;
    }

    function listInsert(bytes memory ctIndex, bytes memory ctValue) public payable returns (elist) {
        require(msg.value >= inco.getFee() * 2, "Fee not paid");
        euint256 index = e.newEuint256(ctIndex, msg.sender);
        euint256 value = e.newEuint256(ctValue, msg.sender);
        list = ePreview.insert(list, index, value);
        inco.allow(elist.unwrap(list), address(this));
        inco.allow(elist.unwrap(list), address(msg.sender));
        return list;
    }

    function listConcat(bytes[] memory cts, ETypes listType, address user)
        public
        payable
        returns (elist)
    {
        require(msg.value >= inco.getFee() * cts.length, "Fee not paid");
        elist rhs = ePreview.newEList(cts, listType, user);
        inco.allow(elist.unwrap(rhs), address(this));
        inco.allow(elist.unwrap(rhs), address(msg.sender));
        list = ePreview.concat(list, rhs);
        inco.allow(elist.unwrap(list), address(this));
        inco.allow(elist.unwrap(list), address(msg.sender));
        return list;
    }

    function listSlice(bytes memory ctStart, uint16 len, bytes memory ctDefaultValue)
        public
        payable
        returns (elist)
    {
        require(msg.value >= inco.getFee() * 2, "Fee not paid");
        euint256 start = e.newEuint256(ctStart, msg.sender);
        euint256 defaultValue = e.newEuint256(ctDefaultValue, msg.sender);
        list = ePreview.sliceLen(list, start, len, defaultValue);
        inco.allow(elist.unwrap(list), address(this));
        inco.allow(elist.unwrap(list), address(msg.sender));
        return list;
    }

    function listRange(uint16 start, uint16 end) public returns (elist) {
        newRangeList = ePreview.range(start, end);
        inco.allow(elist.unwrap(newRangeList), address(this));
        inco.allow(elist.unwrap(newRangeList), address(msg.sender));
        return newRangeList;
    }

    function listGetRange(uint16 index) public returns (euint256) {
        euint256 res = ePreview.getEuint256(newRangeList, index);
        inco.allow(euint256.unwrap(res), msg.sender);
        return res;
    }

    function listShuffle() public payable returns (elist) {
        require(msg.value >= inco.getFee(), "Fee not paid");
        list = ePreview.shuffle(list);
        inco.allow(elist.unwrap(list), address(this));
        inco.allow(elist.unwrap(list), address(msg.sender));
        return list;
    }

    function listReverse() public returns (elist) {
        list = ePreview.reverse(list);
        inco.allow(elist.unwrap(list), address(this));
        inco.allow(elist.unwrap(list), address(msg.sender));
        return list;
    }

    function newEmptyEList(ETypes listType) public returns (elist) {
        list = ePreview.newEList(listType);
        inco.allow(elist.unwrap(list), address(this));
        inco.allow(elist.unwrap(list), address(msg.sender));
        return list;
    }

    function listTypeOf() public view returns (ETypes) {
        return ePreview.listTypeOf(list);
    }

    function listLength() public view returns (uint16) {
        return ePreview.length(list);
    }

    function listSetUint16Index(uint16 index, bytes memory ctValue) public payable returns (elist) {
        require(msg.value >= inco.getFee(), "Fee not paid");
        euint256 value = e.newEuint256(ctValue, msg.sender);
        list = ePreview.set(list, index, value);
        inco.allow(elist.unwrap(list), address(this));
        inco.allow(elist.unwrap(list), address(msg.sender));
        return list;
    }

    function listInsertUint16Index(uint16 index, bytes memory ctValue) public payable returns (elist) {
        require(msg.value >= inco.getFee(), "Fee not paid");
        euint256 value = e.newEuint256(ctValue, msg.sender);
        list = ePreview.insert(list, index, value);
        inco.allow(elist.unwrap(list), address(this));
        inco.allow(elist.unwrap(list), address(msg.sender));
        return list;
    }

    function listSlice(uint16 start, uint16 end) public returns (elist) {
        list = ePreview.slice(list, start, end);
        inco.allow(elist.unwrap(list), address(this));
        inco.allow(elist.unwrap(list), address(msg.sender));
        return list;
    }

    function newBoolList(bytes[] memory inputs, address user) public payable returns (elist) {
        require(msg.value >= inco.getFee() * inputs.length, "Fee not paid");
        boolList = ePreview.newEList(inputs, ETypes.Bool, user);
        inco.allow(elist.unwrap(boolList), address(this));
        inco.allow(elist.unwrap(boolList), address(msg.sender));
        return boolList;
    }

    function boolListAppend(bytes memory ctValue) public payable returns (elist) {
        require(msg.value >= inco.getFee(), "Fee not paid");
        ebool handle = e.newEbool(ctValue, msg.sender);
        inco.allow(ebool.unwrap(handle), address(this));
        inco.allow(ebool.unwrap(handle), address(msg.sender));
        boolList = ePreview.append(boolList, handle);
        inco.allow(elist.unwrap(boolList), address(this));
        inco.allow(elist.unwrap(boolList), address(msg.sender));
        return boolList;
    }

    function boolListGet(uint16 index) public returns (ebool) {
        ebool res = ePreview.getEbool(boolList, index);
        inco.allow(ebool.unwrap(res), msg.sender);
        return res;
    }

    function boolListSet(uint16 index, bytes memory ctValue) public payable returns (elist) {
        require(msg.value >= inco.getFee(), "Fee not paid");
        ebool value = e.newEbool(ctValue, msg.sender);
        boolList = ePreview.set(boolList, index, value);
        inco.allow(elist.unwrap(boolList), address(this));
        inco.allow(elist.unwrap(boolList), address(msg.sender));
        return boolList;
    }

    function boolListSetEncryptedIndex(bytes memory ctIndex, bytes memory ctValue)
        public
        payable
        returns (elist)
    {
        require(msg.value >= inco.getFee() * 2, "Fee not paid");
        euint256 index = e.newEuint256(ctIndex, msg.sender);
        ebool value = e.newEbool(ctValue, msg.sender);
        boolList = ePreview.set(boolList, index, value);
        inco.allow(elist.unwrap(boolList), address(this));
        inco.allow(elist.unwrap(boolList), address(msg.sender));
        return boolList;
    }

    function boolListGetOr(bytes memory ctIndex, bytes memory ctDefaultValue)
        public
        payable
        returns (ebool)
    {
        require(msg.value >= inco.getFee() * 2, "Fee not paid");
        euint256 index = e.newEuint256(ctIndex, msg.sender);
        ebool defaultValue = e.newEbool(ctDefaultValue, msg.sender);
        ebool res = ePreview.getOr(boolList, index, defaultValue);
        inco.allow(ebool.unwrap(res), msg.sender);
        return res;
    }

    function boolListInsert(uint16 index, bytes memory ctValue) public payable returns (elist) {
        require(msg.value >= inco.getFee(), "Fee not paid");
        ebool value = e.newEbool(ctValue, msg.sender);
        boolList = ePreview.insert(boolList, index, value);
        inco.allow(elist.unwrap(boolList), address(this));
        inco.allow(elist.unwrap(boolList), address(msg.sender));
        return boolList;
    }

    function boolListInsertEncryptedIndex(bytes memory ctIndex, bytes memory ctValue)
        public
        payable
        returns (elist)
    {
        require(msg.value >= inco.getFee() * 2, "Fee not paid");
        euint256 index = e.newEuint256(ctIndex, msg.sender);
        ebool value = e.newEbool(ctValue, msg.sender);
        boolList = ePreview.insert(boolList, index, value);
        inco.allow(elist.unwrap(boolList), address(this));
        inco.allow(elist.unwrap(boolList), address(msg.sender));
        return boolList;
    }

    function boolListSliceLen(bytes memory ctStart, uint16 len, bytes memory ctDefaultValue)
        public
        payable
        returns (elist)
    {
        require(msg.value >= inco.getFee() * 2, "Fee not paid");
        euint256 start = e.newEuint256(ctStart, msg.sender);
        ebool defaultValue = e.newEbool(ctDefaultValue, msg.sender);
        boolList = ePreview.sliceLen(boolList, start, len, defaultValue);
        inco.allow(elist.unwrap(boolList), address(this));
        inco.allow(elist.unwrap(boolList), address(msg.sender));
        return boolList;
    }

    function listShuffledRange(uint16 start, uint16 end) public payable returns (elist) {
        require(msg.value >= inco.getFee(), "Fee not paid");
        newRangeList = ePreview.shuffledRange(start, end);
        inco.allow(elist.unwrap(newRangeList), address(this));
        inco.allow(elist.unwrap(newRangeList), address(msg.sender));
        return newRangeList;
    }

    receive() external payable {
        // Allow contract to receive ETH
    }

}
