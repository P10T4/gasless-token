// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import '@opengsn/contracts/src/BaseRelayRecipient.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

import './helpers/TestToken.sol';
import './helpers/ERC20Permit.sol';

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

  function permitAndTransfer(
    address tokenAddress,
    uint256 permitAmount,
    uint256 transferAmount,
    address destinationAddress,
    address owner,
    address spender,
    uint256 deadline,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) public {
    ERC20Permit token = ERC20Permit(tokenAddress);
    token.permit(owner, spender, permitAmount, deadline, v, r, s);
    require(token.transferFrom(_msgSender(), destinationAddress, transferAmount), 'Transfer failed');
  }
}
