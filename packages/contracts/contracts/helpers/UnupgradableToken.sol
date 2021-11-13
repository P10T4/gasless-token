// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract UnupgradableToken is ERC20('Unupgradable Token', 'UTOK') {
  constructor(uint256 initialSupply) {
    _mint(msg.sender, initialSupply);
  }

  function mint(address account, uint256 amount) public {
    _mint(account, amount);
  }

  function burn(address account, uint256 amount) public {
    _burn(account, amount);
  }
}
