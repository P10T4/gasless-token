// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "@opengsn/contracts/src/BaseRelayRecipient.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IFreeCoin {
    function mint(uint amount, address receiver) external;

    function permit(address holder, address spender, uint256 nonce, uint256 expiry,
                    bool allowed, uint8 v, bytes32 r, bytes32 s) external;
}

contract RelayReceipient is BaseRelayRecipient {

	constructor(address forwarder) public {
        trustedForwarder = forwarder;
    }

    function versionRecipient() external override view returns (string memory) {
        return "2.2.2";
    }

    function mint(address tokenAddress, uint amount) public {
        IFreeCoin token = IFreeCoin(tokenAddress);
        token.mint(amount, _msgSender());
    }

    function transferToken(address tokenAddress, address destinationAddress, uint amount) public {
        IERC20 token = IERC20(tokenAddress);
        token.transferFrom(_msgSender(), destinationAddress, amount);
    }

    function approveTransfer(address tokenAddress, uint amount) public returns (bool result) {
        IERC20 token = IERC20(tokenAddress);
        bool result = token.approve(address(this), amount);
        return result;
    }

    function permit(address tokenAddress,address holder, address spender, uint256 nonce, uint256 expiry,
                    bool allowed, uint8 v, bytes32 r, bytes32 s) public {
        IFreeCoin token = IFreeCoin(tokenAddress);
        token.permit(holder, spender, nonce, expiry, allowed, v, r, s);
    }
}
