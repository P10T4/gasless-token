// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import '@opengsn/contracts/src/BaseRelayRecipient.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

import './helpers/TestToken.sol';
import './helpers/ERC20Permit.sol';

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

  function mintFreeCoin(address tokenAddress, uint256 value) public {
    //    IFreeCoin token = IFreeCoin(tokenAddress);
    TestToken token = TestToken(tokenAddress);
    token.mint(_msgSender(), value);
  }

  //  function mintTestToken(address tokenAddress, uint256 value) public {
  //    TestToken token = new TestToken();
  //    token.mint(value);
  //  }

  function transferToken(
    address tokenAddress,
    address destinationAddress,
    uint256 value
  ) public {
    //    IERC20 token = IERC20(tokenAddress);
    TestToken token = TestToken(tokenAddress);
    //    require(token.allowance(tokenAddress, destinationAddress) >= value, 'Insufficient allowance');
    require(token.transferFrom(_msgSender(), destinationAddress, value), 'Transfer failed');

    //        token.transferFrom(_msgSender(), destinationAddress, value);
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
    //    IFreeCoin token = IFreeCoin(tokenAddress);
    TestToken token = TestToken(tokenAddress);
    token.permit(owner, spender, amount, deadline, v, r, s);
    //    token.permit(owner, spender, amount, nonce, deadline, allowed, v, r, s);
  }
}
