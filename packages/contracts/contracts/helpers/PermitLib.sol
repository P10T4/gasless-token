pragma solidity ^0.7.6;

library PermitLib {
    struct PermitInfo {
        address tokenAddress;
        uint256 permitAmount;
        uint256 transferAmount;
        address destinationAddress;
        address owner;
        address spender;
        uint256 deadline;
        uint256 nonce;
        bool allowed;
        uint8 v;
        bytes32 r;
        bytes32 s;
    }
}
