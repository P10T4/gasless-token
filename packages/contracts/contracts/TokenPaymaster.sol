// SPDX-License-Identifier:MIT
pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

import '@opengsn/gsn/contracts/forwarder/IForwarder.sol';
import '@opengsn/gsn/contracts/BasePaymaster.sol';

import './interfaces/IUniswap.sol';

/**
 * A Token-based paymaster.
 * - each request is paid for by the caller.
 * - acceptRelayedCall - verify the caller can pay for the request in tokens.
 * - preRelayedCall - pre-pay the maximum possible price for the tx
 * - postRelayedCall - refund the caller for the unused gas
 */
contract TokenPaymaster is BasePaymaster {
  using SafeMath for uint256;

  function versionPaymaster() external view virtual override returns (string memory) {
    return '2.2.0+opengsn.token.ipaymaster';
  }

  IUniswap[] public uniswaps;
  IERC20[] public tokens;

  mapping(IUniswap => bool) private _supportedUniswaps;

  uint256 public gasUsedByPost;

  constructor(
    IUniswap[] memory _uniswaps,
    IForwarder forwarder,
    IRelayHub relayHub
  ) public {
    uniswaps = _uniswaps;

    for (uint256 i = 0; i < _uniswaps.length; i++) {
      _supportedUniswaps[_uniswaps[i]] = true;
      tokens.push(IERC20(_uniswaps[i].tokenAddress()));
      tokens[i].approve(address(_uniswaps[i]), uint256(-1));
    }

    setRelayHub(relayHub);
    setTrustedForwarder(forwarder);
  }

  /**
   * set gas used by postRelayedCall, for proper gas calculation.
   * You can use TokenGasCalculator to calculate these values (they depend on actual code of postRelayedCall,
   * but also the gas usage of the token and of Uniswap)
   */
  function setPostGasUsage(uint256 _gasUsedByPost) external onlyOwner {
    gasUsedByPost = _gasUsedByPost;
  }

  // return the payer of this request.
  // for account-based target, this is the target account.
  function getPayer(GsnTypes.RelayRequest calldata relayRequest)
    public
    view
    virtual
    returns (address)
  {
    (this);
    return relayRequest.request.from;
  }

  event Received(uint256 eth);

  receive() external payable override {
    relayHub.depositFor{value: msg.value}(address(this));
    emit Received(msg.value);
  }

  function _getToken(bytes memory paymasterData)
    internal
    view
    returns (IERC20 token, IUniswap uniswap)
  {
    //if no specific token specified, assume the first in the list.
    if (paymasterData.length == 0) {
      return (tokens[0], uniswaps[0]);
    }

    require(paymasterData.length == 32, 'invalid uniswap address in paymasterData');
    uniswap = abi.decode(paymasterData, (IUniswap));
    require(_supportedUniswaps[uniswap], 'unsupported token uniswap');
    token = IERC20(uniswap.tokenAddress());
  }

  function _calculatePreCharge(
    IERC20 token,
    IUniswap uniswap,
    GsnTypes.RelayRequest calldata relayRequest,
    uint256 maxPossibleGas
  ) internal view returns (address payer, uint256 tokenPreCharge) {
    (token);
    payer = this.getPayer(relayRequest);
    uint256 ethMaxCharge = relayHub.calculateCharge(maxPossibleGas, relayRequest.relayData);
    ethMaxCharge += relayRequest.request.value;
    tokenPreCharge = uniswap.getTokenToEthOutputPrice(ethMaxCharge);
    return (payer, tokenPreCharge);
  }

  function preRelayedCall(
    GsnTypes.RelayRequest calldata relayRequest,
    bytes calldata signature,
    bytes calldata approvalData,
    uint256 maxPossibleGas
  )
    external
    virtual
    override
    relayHubOnly
    returns (bytes memory context, bool revertOnRecipientRevert)
  {
    (relayRequest, signature, approvalData, maxPossibleGas);
    (IERC20 token, IUniswap uniswap) = _getToken(relayRequest.relayData.paymasterData);
    (address payer, uint256 tokenPrecharge) = _calculatePreCharge(
      token,
      uniswap,
      relayRequest,
      maxPossibleGas
    );
    token.transferFrom(payer, address(this), tokenPrecharge);
    return (abi.encode(payer, tokenPrecharge, token, uniswap), false);
  }

  function postRelayedCall(
    bytes calldata context,
    bool,
    uint256 gasUseWithoutPost,
    GsnTypes.RelayData calldata relayData
  ) external virtual override relayHubOnly {
    (address payer, uint256 tokenPrecharge, IERC20 token, IUniswap uniswap) = abi.decode(
      context,
      (address, uint256, IERC20, IUniswap)
    );
    _postRelayedCallInternal(
      payer,
      tokenPrecharge,
      0,
      gasUseWithoutPost,
      relayData,
      token,
      uniswap
    );
  }

  function _postRelayedCallInternal(
    address payer,
    uint256 tokenPrecharge,
    uint256 valueRequested,
    uint256 gasUseWithoutPost,
    GsnTypes.RelayData calldata relayData,
    IERC20 token,
    IUniswap uniswap
  ) internal {
    uint256 ethActualCharge = relayHub.calculateCharge(
      gasUseWithoutPost.add(gasUsedByPost),
      relayData
    );
    uint256 tokenActualCharge = uniswap.getTokenToEthOutputPrice(
      valueRequested.add(ethActualCharge)
    );
    uint256 tokenRefund = tokenPrecharge.sub(tokenActualCharge);
    _refundPayer(payer, token, tokenRefund);
    _depositProceedsToHub(ethActualCharge, uniswap);
  }

  function _refundPayer(
    address payer,
    IERC20 token,
    uint256 tokenRefund
  ) private {
    require(token.transfer(payer, tokenRefund), 'failed refund');
  }

  function _depositProceedsToHub(uint256 ethActualCharge, IUniswap uniswap) private {
    //solhint-disable-next-line
    uniswap.tokenToEthSwapOutput(ethActualCharge, uint256(-1), block.timestamp + 60 * 15);
    // relayHub.depositFor{value: ethActualCharge}(address(this));
  }

  event TokensCharged(
    uint256 gasUseWithoutPost,
    uint256 gasJustPost,
    uint256 ethActualCharge,
    uint256 tokenActualCharge
  );
}
