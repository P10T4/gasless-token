// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import '@opengsn/contracts/src/BaseRelayRecipient.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

import './helpers/TestToken.sol';
import './helpers/ERC20Permit.sol';
import './helpers/UnupgradableToken.sol';
import "./helpers/UnupgradableERC20Permit.sol";

interface IFreeCoin {
  function mint(uint256 value, address receiver) external;

  function permit(
    address holder,
    address spender,
    uint256 nonce,
    uint256 deadline,
    bool allowed,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) external;
}

contract RelayRecipient is BaseRelayRecipient {
  constructor(address forwarder) public {
    trustedForwarder = forwarder;
  }

  function versionRecipient() external view override returns (string memory) {
    return '2.2.2';
  }

  function mintToken(address tokenAddress, uint256 value) public {
    TestToken token = TestToken(tokenAddress);
    token.mint(_msgSender(), value);
  }

  function mintUnupgradableToken(address tokenAddress, uint256 value) public {
    UnupgradableToken token = UnupgradableToken(tokenAddress);
    token.mint(_msgSender(), value);
  }

  function transferToken(
    address tokenAddress,
    address destinationAddress,
    uint256 value
  ) public {
    UnupgradableERC20Permit t = UnupgradableERC20Permit(tokenAddress);
    require(t.transferFrom(_msgSender(), destinationAddress, value), 'Transfer failed');
//    ERC20Permit token = ERC20Permit(tokenAddress);
//    require(token.transferFrom(_msgSender(), destinationAddress, value), 'Transfer failed');
  }

  function approveTransfer(address tokenAddress, uint256 value) public returns (bool result) {
    IERC20 token = IERC20(tokenAddress);
    bool result = token.approve(address(this), value);
    return result;
  }

  function permit(
    address tokenAddress,
    address owner,
    address spender,
    uint256 amount,
    uint256 deadline,
    uint256 nonce,
    bool allowed,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) public {
    ERC20Permit t = UnupgradableERC20Permit(tokenAddress);
    t.permit(owner, spender, amount, deadline, v, r, s);
//    ERC20Permit token = ERC20Permit(tokenAddress);
//    token.permit(owner, spender, amount, deadline, v, r, s);
  }
}
