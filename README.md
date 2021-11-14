# Bluejay Gasless Token
![unit test workflow](https://github.com/To-Be-Rename/gasless-token/actions/workflows/contractTest.yml/badge.svg)

## Setup
Helps to install all necessary dependencies in all packages
```
yarn setup
```

## Start running locally
To start, open two terminal windows in the project root. 

In first window, run the following to start local blockchain node together with gsn network. To view some predefined accounts that was initialised in the blockchain network, can refer to `packages/contracts/hardhat.config.ts` under network accounts
```
yarn start:node
```

In second window, run the following to copy the deployed contract artifacts into frontend code, as well as starting frontend react app
```
yarn start:app
```
