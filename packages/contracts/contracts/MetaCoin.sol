// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "@opengsn/contracts/src/BaseRelayRecipient.sol";

contract MetaCoin is BaseRelayRecipient {

	string public symbol = "META";
	string public description = "GSN Sample MetaCoin";
	uint public decimals = 0;

	mapping(address => uint) balances;

	constructor(address forwarder) public {
        balances[tx.origin] = 10000;
        trustedForwarder = forwarder;
    }

    function versionRecipient() external override view returns (string memory) {
        return "2.0.0";
    }

    function transfer(address receiver, uint amount) public returns (bool sufficient) {
        if (balances[_msgSender()] < amount) return false;
        balances[_msgSender()] -= amount;
        balances[receiver] += amount;
        // emit Transfer(_msgSender(), receiver, amount);
        return true;
    }

    function balanceOf(address addr) public view returns (uint) {
        return balances[addr];
    }


    mapping(address => bool) minted;

    /**
     * mint some coins for this caller.
     * (in a real-life application, minting is protected for admin, or by other mechanism.
     * but for our sample, any user can mint some coins - but just once..
     */
    function mint(uint amount) public {
        require(!minted[_msgSender()], "already minted");
        minted[_msgSender()] = true;
        balances[_msgSender()] += amount;
    }
}
