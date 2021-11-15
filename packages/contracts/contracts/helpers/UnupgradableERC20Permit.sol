// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma abicoder v2;

import {ERC20, ERC20Permit} from './ERC20Permit.sol';
import './UnupgradableToken.sol';
import '../helpers/PermitLib.sol';
import 'hardhat/console.sol';

contract UnupgradableERC20Permit is ERC20Permit {
  UnupgradableToken token;

  constructor(address tokenAddress) ERC20('Unupgradable Token', 'UTOK') {
    token = UnupgradableToken(tokenAddress);
  }

  function mintUnupgradableToken(address account, uint256 amount) public {
    token.mint(account, amount);
    console.log('permit', token.balanceOf(account));
  }

  function burnUnupgradableToken(address account, uint256 amount) public {
    token.burn(account, amount);
  }



  function permitUnupgradableToken(PermitLib.PermitInfo memory permitInfo) public {
    require(permit(
      permitInfo.owner,
      permitInfo.spender,
      permitInfo.permitAmount,
      permitInfo.deadline,
      permitInfo.v,
      permitInfo.r,
      permitInfo.s
    ), 'UnupgradableERC20Permit: permit failed');
    token.approve(permitInfo.spender, permitInfo.permitAmount);
//    approve(permitInfo.spender, permitInfo.permitAmount * 10**18);
  }

  function transferUnupgradableToken(
    address sender,
    address receiver,
    uint256 amount
  ) public {
    console.log('transferUnupgradableToken allowance', token.allowance(sender, receiver));
    require(
      token.transferFrom(sender, receiver, amount),
      'UnupgradableERC20Permit: Transfer Failed'
    );
  }
}
