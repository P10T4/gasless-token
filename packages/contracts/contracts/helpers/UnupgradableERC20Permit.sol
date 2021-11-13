// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import {ERC20, ERC20Permit} from './ERC20Permit.sol';
import './UnupgradableToken.sol';

contract UnupgradableERC20Permit is ERC20Permit {

    UnupgradableToken token;

    constructor(address tokenAddress) ERC20('Unupgradable Token', 'UTOK'){
        token = UnupgradableToken(tokenAddress);
    }

    function mint(address account, uint256 amount) public {
        token.mint(account, amount);
    }

    function burn(address account, uint256 amount) public {
        token.burn(account, amount);
    }
}
