// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '../interfaces/IUniswap.sol';
import './UnupgradableToken.sol';

contract UnupgradableTokenUniswap is IUniswap {
  IERC20 public token;
  uint256 public rateMult;
  uint256 public rateDiv;

  constructor(uint256 _rateMult, uint256 _rateDiv) public payable {
    token = new UnupgradableToken(1000);
    rateMult = _rateMult;
    rateDiv = _rateDiv;
    require(msg.value > 0, 'Must specify liquidity');
    require(rateDiv != 0 && rateDiv != 0, 'Bad mult, div');
  }

  // solhint-disable-next-line no-empty-blocks
  receive() external payable {}

  function tokenAddress() external view override returns (address out) {
    return address(token);
  }

  function tokenToEthSwapOutput(
    uint256 ethBought,
    uint256 maxTokens,
    uint256 deadline
  ) public override returns (uint256 out) {
    (maxTokens, deadline);
    uint256 tokensToSell = getTokenToEthOutputPrice(ethBought);
    require(address(this).balance > ethBought, 'Not enough liquidity');

    token.transferFrom(msg.sender, address(this), tokensToSell);
    msg.sender.transfer(ethBought);
    return tokensToSell;
  }

  function getTokenToEthInputPrice(uint256 tokensSold)
    external
    view
    override
    returns (uint256 out)
  {
    return tokensSold * (rateDiv / rateMult);
  }

  function tokenToEthTransferOutput(
    uint256 ethBought,
    uint256 maxTokens,
    uint256 deadline,
    address payable recipient
  ) external override returns (uint256 out) {
    (maxTokens, deadline, recipient);
    require(address(this).balance > ethBought, 'Not enough liquidity');

    uint256 tokensToSell = getTokenToEthOutputPrice(ethBought);

    token.transferFrom(msg.sender, address(this), tokensToSell);
    recipient.transfer(ethBought);
    return tokensToSell;
  }

  function getTokenToEthOutputPrice(uint256 ethBought) public view override returns (uint256 out) {
    return (ethBought * rateMult) / rateDiv;
  }
}
