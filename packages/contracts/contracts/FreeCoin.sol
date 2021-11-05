// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

// interface IERC20 {
//     // function totalSupply() external view returns (uint);

//     function balanceOf(address account) external view returns (uint);

//     function transfer(address recipient, uint amount) external returns (bool);

//     function allowance(address owner, address spender) external view returns (uint);

//     function approve(address spender, uint amount) external returns (bool);

//     function transferFrom(
//         address sender,
//         address recipient,
//         uint amount
//     ) external returns (bool);

//     event Transfer(address indexed from, address indexed to, uint value);
//     event Approval(address indexed owner, address indexed spender, uint value);
// }

import 'hardhat/console.sol';

contract FreeCoin {
  string public symbol = 'DAI';
  string public name = 'Dai Stablecoin';
  string public version = '1';
  uint256 public decimals = 18;

  mapping(address => uint256) _balances;
  mapping(address => mapping(address => uint256)) _allowance;

  constructor(uint256 chainId_) public {
    // wards[msg.sender] = 1;
    DOMAIN_SEPARATOR = keccak256(
      abi.encode(
        keccak256(
          'EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'
        ),
        keccak256(bytes(name)),
        keccak256(bytes(version)),
        chainId_,
        address(this)
      )
    );
  }

  // implement the permit function copy from dai contract
  // https://github.com/makerdao/dss/blob/master/src/dai.sol

  // --- EIP712 niceties ---
  bytes32 public DOMAIN_SEPARATOR;
  // bytes32 public constant PERMIT_TYPEHASH = keccak256("Permit(address holder,address spender,uint256 nonce,uint256 expiry,bool allowed)");
  bytes32 public constant PERMIT_TYPEHASH =
    0xea2aa0a1be11a07ed86d755c93467f4f82362b452371d1ba94d1715123511acb;
  mapping(address => uint256) public nonces;

  function permit(
    address holder,
    address spender,
    uint256 nonce,
    uint256 expiry,
    bool allowed,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) external {
    bytes32 digest = keccak256(
      abi.encodePacked(
        '\x19\x01',
        DOMAIN_SEPARATOR,
        keccak256(abi.encode(PERMIT_TYPEHASH, holder, spender, nonce, expiry, allowed))
      )
    );

    require(holder != address(0), 'Dai/invalid-address-0');
    require(holder == ecrecover(digest, v, r, s), 'Dai/invalid-permit');
    require(expiry == 0 || block.timestamp <= expiry, 'Dai/permit-expired');
    require(nonce == nonces[holder]++, 'Dai/invalid-nonce');
    uint256 wad = allowed ? uint256(-1) : 0;
    _allowance[holder][spender] = wad;
  }

  function transfer(address _to, uint256 _value) public returns (bool success) {
    if (_balances[msg.sender] >= _value && _value > 0) {
      _balances[msg.sender] -= _value;
      _balances[_to] += _value;
      return true;
    } else {
      return false;
    }
  }

  function transferFrom(
    address _from,
    address _to,
    uint256 _value
  ) public returns (bool success) {
    if (_balances[_from] >= _value && _allowance[_from][msg.sender] >= _value && _value > 0) {
      _balances[_to] += _value;
      _balances[_from] -= _value;
      _allowance[_from][msg.sender] -= _value;
      return true;
    } else {
      return false;
    }
  }

  function balanceOf(address _owner) public view returns (uint256 balance) {
    return _balances[_owner];
  }

  function approve(address _spender, uint256 _value) public returns (bool success) {
    _allowance[msg.sender][_spender] = _value;
    return true;
  }

  function mint(uint256 amount, address receiver) public {
    _balances[receiver] += amount;
  }
}
