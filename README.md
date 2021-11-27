# Gasless Token

![unit test workflow](https://github.com/To-Be-Rename/gasless-token/actions/workflows/contractTest.yml/badge.svg)

## Setup Guide

Env requirements: 

- yarn installed
- tested with node v14 and below (higher versions such as v17 might have issue running due to a known issue with opengsn lib described [here](https://dev.to/earnestgdata/comment/1jc7m)

<br />

First, run the following to install all the required dependencies of this project:

```
yarn setup
```

Next, to start running, open up two terminal windows. In the first window, run the following from project root start local blockchain node together with gsn network (should take approximately 30 seconds):

```
yarn start:node
```

Once the local blockchain network is started, navigate to the second terminal window and run the following from project root to start the app (should take approximately 30 seconds):

```
yarn start:app
```

Finally, in your metamask, setup the 3 test accounts that we have predefined for this project demo (Please also ensure to switch Metamask to localhost:8545 and chainId to 1337):

```
[
  {
    "name": "Test Account 1",
    "address": "0xF4E8d4160BB5420D9D9fF1ed42044E660a2b2F32",
    "privateKey": "0x2c6036688de3383aac61e305b3bf91bc567f508ce01db108d17e62ca364a2488"
  },
  {
    "name": "Test Account 2",
    "address": "0x3e294ddA81C8225C70BfFAbc4cf23d900768C636",
    "privateKey": "0x6d61bdbd9c2cd61f2be4b8aaf3cb930cb317028389f8f7f7f454ccc98d36d4f5"
  },
  {
    "name": "Test Account 3",
    "address": "0x9f02BFA6C75a8eA77000210F061a6aed15cdF76e",
    "privateKey": "0x21f33ccbc687ce720efee931d205f8f7b77d40c6cd2863c1cc61fc0a472c4cc9"
  }
]
```

### Reason for these predefined accounts

In the [Paymaster Section](#Paymasters), we explained that we have implemented two different types of paymasters. The Whitelist Paymaster only accepts transactions from accounts that have been configured into the whitelisted list. For demo purposes, we have already preconfigured the whitelisting process, and these three accounts mentioned above have been whitelisted. To see the configuration logic, refer to [`config.ts`](packages/contracts/scripts/config/config.ts). (This config script was ran automatically when we run `yarn start:app` mentioned above)

<br />

## Project Demo

Here is our dApp interface. To read the written demo, refer to [`DEMO.md`](DEMO.md). You can also watch our 10min video demo [here](https://www.youtube.com/watch?v=hOhrLGML6Q4)

![image](https://user-images.githubusercontent.com/48687942/142754720-6d45e678-8fbb-4031-98ad-27d0a5c59b49.png)

<br />

## Project Explanation

### Introduction

This project aims to allow users to be able to send and receive ERC20 tokens without having any Ether in their balance to pay for the gas fees. Our project achieved this functionality by integrating with the [OpenGSN](https://opengsn.org/) library, by implementing the various contracts that are required by OpenGSN. OpenGSN achieved this by having a network of relayers available to relay the transaction on behalf of the user and pay for the gas fees in Ether. Paymasters will then compensate the relayers by depositing Ether (amount equivalent to gas fee + txn fee charged by the relayer) to the relayers.

In our project, we have implemented the following contracts:

- Relay Recipient (the contract that receives the relayed call)
- ERC20Permit (to be inherited by any ERC20 token)
- Paymasters (the contract to implement logic on relay call payments)
  - Whitelist Paymaster
  - Token Paymaster

<br />

### Relay Recipient

Normally in a dApp, the user in the frontend (`msg.sender`) invokes the functions in the contracts directly, incurring gas fees on the user.

<br />

![image](https://user-images.githubusercontent.com/48687942/142750907-9badb93f-d2fe-46b0-b11d-28b97810e634.png)

<br />

With the integration of OpenGSN, instead of letting users invoke contract functions directly, users will instead pass that invocation call to the relayer. The relayer will invoke the contract functions on behalf of the user and consequently pay for the gas fee in Ether.

<br />

![image](https://user-images.githubusercontent.com/48687942/142750917-03e968b6-b07b-44af-8447-3c142fd0f27a.png)

(note that this diagram is simplified to convey the main idea in this section, actual interactions involve other contracts such as RelayHub, Forwarder, Paymaster, etc.)

Hence, our project needs to implement the Relay Recipient to implement the various logic that supports our dApp. The main logic that we needed to support is to facilitate gasless token transfer between users.

To facilitate the token transfer logic, one naive function that we could implement in the relay recipient contract is something like this:

```solidity
function transfer(
    address tokenAddress,
    uint256 transferAmount,
    address destinationAddress,
) public {
    ERC20 token = ERC20(tokenAddress);
    require(token.transferFrom(_msgSender(), destinationAddress, transferAmount), 'Transfer failed');
}

// in Relay Recipient, since it is a relayed call, msg.sender will be the Forwarder contract instead of the user.
// To retrieve the actual frontend user, we need to use _msgSender() to access the original msg sender
```

However, this will not work for us because the `transferFrom` call will only work provided that the `_msgSender()` has previously approved some allowance to the relay recipient contract. This means that the user has to manually call the `approve` function in the ERC20 token contract, and that function invocation will incur gas fees, which then violates the primary aim of this project in the first place.

To solve this problem, we needed a way to approve some allowance to the contract without incurring gas fee to the user, and one way that we manage to achieve this is through the use of the `permit` function. ([EIP2612](https://eips.ethereum.org/EIPS/eip-2612))

<br />

### ERC20 permit

The EIP2612 was initiated by Dai and Uniswap and was first implemented in the Dai token itself. By implementing the `permit` function in the ERC20 token, it allows a user to sign an approved transaction off-chain producing a signature that anyone could use and submit to the blockchain, removing the user-unfriendly two-step process of sending `approve` and later `transferFrom`.

In our project, we have defined the permit logic inside the [`ERC20Permit.sol`](packages/contracts/contracts/helpers/ERC20Permit.sol). To demonstrate that any ERC20 token can directly inherit the `ERC20Permit` contract, we have created [`TestToken.sol`](packages/contracts/contracts/helpers/TestToken.sol), which is an ERC20 token that inherits the `ERC20Permit` contract.

With the use of the permit function, our frontend users will just produce a signature and send it to the relay recipient. The relay recipient will then use that signature to approve the allowance in the token contract, and then proceed to do `transferFrom`. Here is how the function in the Relay Recipient could look like now:

```solidity
function permitAndTransfer(
    address tokenAddress,
    uint256 amount,
    address destinationAddress,
    address owner,
    address spender,
    uint256 deadline,
    uint8 v,
    bytes32 r,
    bytes32 s
) public {
    ERC20Permit token = ERC20Permit(tokenAddress);
    token.permit(owner, spender, amount, deadline, v, r, s);
    require(token.transferFrom(_msgSender(), destinationAddress, amount), 'Transfer failed');
}
```

With this approach, `approve` and `transferFrom` are all done in a single transaction, without the user having to possess any Ether.

<br />

### Paymasters

While relayers help to invoke contract calls on behalf of the user, the relayers need to be compensated with gas fee + some txn fee charged by the relayer. Paymasters are responsible to compensate Ether to the relayers (by depositing sufficient Ether into the RelayHub).

Besides compensating relayers, another responsibility of paymasters is to decide on whether to approve a relayed call. Paymasters can implement logic that can decide for each relayed transaction, whether it should be accepted or rejected. Since paymasters help to pay for gas fees, it cannot be opened to everyone or pay for gas fees for free, as that presents the scenario where any arbitrary user can drain the paymaster's account by sending many gasless transactions. Here we discuss some approaches that can solve this issue.

- **Approach 1**: The paymaster could predefine a list of whitelisted account addresses that it can accept relayed calls from. Accounts that are not in the whitelisted account will be rejected. This could be useful in the scenario where a company is trying to acquire more users and is willing to pay gas fees only for its users. In this case, the company will add their users to the whitelist, allowing their users to transfer without gas fees.

  - To demonstrate this approach, we have implemented the [`WhitelistPaymaster.sol`](packages/contracts/contracts/WhitelistPaymaster.sol) contract

- **Approach 2**: The paymaster can charge the msg sender for the gas fees that the paymaster paid to the relayer, by transferring the ERC20 token amount that is equivalent to the gas fee from the msg sender to the paymaster. The paymaster can then use a DEX to swap these received ERC20 tokens back to Ether and deposit them into OpenGSN RelayHub for future transactions.

  - To demonstrate this approach, we have implemented the [`TokenPaymaster.sol`](packages/contracts/contracts/TokenPaymaster.sol) contract
  - To simulate the exchange of ERC20 token to Ether using a DEX, we have also implemented a helper contract [`TestUniswap.sol`](packages/contracts/contracts/helpers/TestUniswap.sol) to represent the swapping of Test Token-Ether pair. For demo purposes, we have fixed the exchange rate of Test Token to Ether to be 1 : 1.

<br /><br />

#### Current limitation of our TokenPaymaster implementation

As explained in previous section, our TokenPaymaster will need to deduct token balance from the user. However, this would mean that the user must `approve` some allowance to the TokenPaymaster contract so that the TokenPaymaster can deduct the token from the user. This will again introduce the same problem of user having to possess Ether to pay for gas fee for contract function invocation.

We have tried some ways to attempt to resolve this issue, but unfortunately we could not find an elegant solution. The following is our attempted solution to solve this problem:

<br />

##### Our Attempt: Use of the permit function just like previously done in Relay Recipient

In the current implementation, the frontend user will produce one signature to permit the `RelayRecipient` to spend the user's token. We can extend on the same function, by asking user to produce two signatures in the frontend, where one signature permits the `RelayRecipient`, while the other signature permits the `TokenPaymaster` contract. With this approach, here is what the function could look like in our `RelayRecipient` contract:

```solidity
function permitAndTransfer(
    address tokenAddress,
    uint256 permitAmount,
    uint256 transferAmount,
    address destinationAddress,
    address owner,
    address spender1,
    uint256 deadline1,
    uint8 v1,
    bytes32 r1,
    bytes32 s1,
    address spender2,
    uint256 deadline2,
    uint8 v2,
    bytes32 r2,
    bytes32 s2,
) public {
  ERC20Permit token = ERC20Permit(tokenAddress);

  // permit RelayRecipient
  token.permit(owner, spender1, permitAmount, deadline1, v1, r1, s1);

  // permit TokenPaymaster
  token.permit(owner, spender2, permitAmount, deadline2, v2, r2, s2);

  require(
    token.transferFrom(_msgSender(), destinationAddress, transferAmount),
    'Transfer failed'
  );
}
```

With this approach, we can permit both the `RelayRecipient` contract as well as the `TokenPaymaster` contract, all in one single transaction.

However, while trying to implement this function, we have encountered the [stack too deep](https://ethereum.stackexchange.com/questions/19587/how-to-fix-stack-too-deep-error) error, seems like its due to having too many function parameters in this case. We have tried some ways but we couldn't manage to resolve this issue in time. If we were to break up this function into multiple parts, both the `permit` calls can no longer be done in a single transaction, and will incur gas fee on the user in Ether.
