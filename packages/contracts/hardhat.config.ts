import { task, HardhatUserConfig } from 'hardhat/config';
import { removeConsoleLog } from 'hardhat-preprocessor';
import '@nomiclabs/hardhat-waffle';
import 'hardhat-deploy';
import '@typechain/hardhat';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';

task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});

const config: HardhatUserConfig = {
  // defaultNetwork: "ganache",
  paths: {
    sources: './contracts',
    tests: './test',
    artifacts: './build/artifacts',
    cache: './build/cache',
    deploy: './scripts/deploy',
  },
  solidity: {
    compilers: [
      {
        version: '0.7.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  mocha: {
    timeout: 20000,
  },
  typechain: {
    outDir: 'typechained',
    target: 'ethers-v5',
  },
  preprocess: {
    eachLine: removeConsoleLog((hre) => hre.network.name !== 'hardhat' && hre.network.name !== 'localhost'),
  },
  networks: {
    hardhat: {
      chainId: 1337, // temporary for MetaMask support: https://github.com/MetaMask/metamask-extension/issues/10290
      initialBaseFeePerGas: 0,
      accounts: [
        {
          privateKey: '0x2c6036688de3383aac61e305b3bf91bc567f508ce01db108d17e62ca364a2488',
          balance: '10000000000000000000000',
        },
        {
          privateKey: '0x6d61bdbd9c2cd61f2be4b8aaf3cb930cb317028389f8f7f7f454ccc98d36d4f5',
          balance: '10000000000000000000000',
        },
        {
          privateKey: '0x21f33ccbc687ce720efee931d205f8f7b77d40c6cd2863c1cc61fc0a472c4cc9',
          balance: '10000000000000000000000',
        },
      ],
    },
    ganache: {
      url: 'http://localhost:8545',
      chainId: 1337,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0, // by default, take the first account as deployer
      rinkeby: '0x5238A644636946963ffeDAc52Ec53fb489D3a1CD', // on rinkeby, use a specific account
    },
  },
};

export default config;
