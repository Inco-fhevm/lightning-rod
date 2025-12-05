// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

// This line of import is all you need to get started with Inco
import {euint256, ebool, e, inco} from "@inco/lightning/src/Lib.sol";

/// @notice a fungible token whose balances and transfer values are confidential
contract SimpleConfidentialToken {
    using e for euint256;
    using e for ebool;
    using e for uint256;
    using e for bytes;
    using e for address;

    // since balances are represented by handles, just calling balanceOf() without having the decryption access
    // on the corresponding handle won't allow to know the actual balance
    mapping(address => euint256) public balanceOf;

    constructor() {
        // mint 1000 tokens to the deployer
        // we consider this token to have 9 decimals, which is standard for confidential fungible tokens
        // units are GWEI instead of WADs (WADs being 18 decimals, used in ERC20)
        // `uint256(1000 * 1e9).asEuint256()` is a trivial encrypt, i.e it converts a known value into
        // an e-type. We can also write `e.asEuint256(1000 * 1e9);`
        balanceOf[msg.sender] = uint256(1000 * 1e9).asEuint256();
    }

    // this function is meant to be called by EOAs or smart wallets as valueInput is an encrypted amount that should
    // be generated using @inco/js sdk
    function transfer(address to, bytes memory valueInput) external payable returns (ebool) {
        require(msg.value == inco.getFee(),"Fee not paid");
        // `newInput` returns an euint256 from an encrypted input, if the encrypted input is malformed, it will return
        // an euint256 with a value of 0. Depending on how malformed the input is, an external observer may know
        // that the fallback 0 value has been returned. Just use the js sdk to avoid that.
        // The second parameter of newInput will receive decryption rights on the euint256, and should be the account
        // that created the encrypted input.
        euint256 value = valueInput.newEuint256(msg.sender);
        return _transfer(to, value);
    }

    // this function is meant to be called by smart contracts, as it is using an existing euint256.
    // caller has to use `value.allow(tokenAddress)` before calling this function or it will revert.
    function transfer(address to, euint256 value) public returns (ebool success) {
        // always perform this check on encrypted parameters. In this case, a malicious caller could try to pass
        // the handle corresponding of a victim's balance to deduce its value, it wouldn't revert without this check
        // as this token contract holds allowance on the balances of all holders.
        require(msg.sender.isAllowed(value), "SimpleConfidentialToken: unauthorized value handle access");

        return _transfer(to, value);
    }

    function _transfer(address to, euint256 value) internal returns (ebool success) {
        // check if the sender has enough balance to transfer the value
        success = balanceOf[msg.sender].ge(value);
        // Solidity can't revert on an insufficient balance as it has no way of knowing the actual value of the ebool.
        // Instead, we use the multiplexer pattern, replacing the actual transferred value for a 0 (trivial encrypt)
        // if the balance is insufficient, which is equivalent to doing nothing.
        euint256 transferredValue = success.select(value, uint256(0).asEuint256());

        // saving handles used multiple times in memory variables to save some gas
        euint256 senderNewBalance = balanceOf[msg.sender].sub(transferredValue);
        euint256 receiverNewBalance = balanceOf[to].add(transferredValue);

        balanceOf[msg.sender] = senderNewBalance;
        balanceOf[to] = receiverNewBalance;

        // allow the sender to see its new balance
        senderNewBalance.allow(msg.sender);
        // allow the receiver to see its new balance
        receiverNewBalance.allow(to);
        // allow this contract to be able to compute over the new balances in future transfers
        senderNewBalance.allowThis();
        receiverNewBalance.allowThis();
        // let the caller know if the transfer was successful
        success.allow(msg.sender);
    }
}
