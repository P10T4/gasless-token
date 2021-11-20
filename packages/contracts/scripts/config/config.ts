var hardhat = require('hardhat');
const Web3HttpProvider = require('web3-providers-http');
const { RelayProvider } = require('@opengsn/gsn');
import * as testAccounts from './testAccounts.json';

var tokenPaymaster = require('../../deployments/localhost/TokenPaymaster.json');
var whitelistPaymaster = require('../../deployments/localhost/WhitelistPaymaster.json');
var testUniswap = require('../../deployments/localhost/TestUniswap.json');
var testToken = require('../../deployments/localhost/TestToken.json');

const main = async () => {
  var ethers = hardhat.ethers;
  var provider = new ethers.providers.Web3Provider(new Web3HttpProvider('http://localhost:8545'));
  var account1 = new ethers.Wallet(Buffer.from(testAccounts[0].privateKey.substring(2), 'hex'));
  var account1Signer = provider.getSigner(account1.address);
  var account2 = new ethers.Wallet(Buffer.from(testAccounts[1].privateKey.substring(2), 'hex'));
  var account2Signer = provider.getSigner(account2.address);
  var account3 = new ethers.Wallet(Buffer.from(testAccounts[2].privateKey.substring(2), 'hex'));
  var account3Signer = provider.getSigner(account3.address);

  // fund token paymaster
  const fundTokenPaymaster = await account1Signer.sendTransaction({
    to: tokenPaymaster.address,
    value: ethers.utils.parseEther('1.0'),
  });
  await fundTokenPaymaster.wait();

  // fund Test Uniswap
  const fundTestUniswap = await account1Signer.sendTransaction({
    to: testUniswap.address,
    value: ethers.utils.parseEther('50.0'),
  });
  await fundTestUniswap.wait();

  // setup some default whitelist address in whitelist paymaster, and also fund whitelist paymaster
  var whitelistPaymasterContract = new ethers.Contract(whitelistPaymaster.address, whitelistPaymaster.abi, provider);

  var setupPaymaster = await whitelistPaymasterContract.connect(account1Signer).whitelistSender(testAccounts[0].address);
  await setupPaymaster.wait();
  setupPaymaster = await whitelistPaymasterContract.connect(account1Signer).whitelistSender(testAccounts[1].address);
  await setupPaymaster.wait();
  setupPaymaster = await whitelistPaymasterContract.connect(account1Signer).whitelistSender(testAccounts[2].address);
  await setupPaymaster.wait();

  const fundWhitelistPaymaster = await account1Signer.sendTransaction({
    to: whitelistPaymaster.address,
    value: ethers.utils.parseEther('1.0'),
  });
  await fundWhitelistPaymaster.wait();

  // approve test accounts for transfer
  var testTokenContract = new ethers.Contract(testToken.address, testToken.abi, provider);
  var approveTokenPaymasterForTestAccount = await testTokenContract
    .connect(account1Signer)
    .approve(tokenPaymaster.address, ethers.utils.parseEther('100000'));
  await approveTokenPaymasterForTestAccount.wait();

  approveTokenPaymasterForTestAccount = await testTokenContract
    .connect(account2Signer)
    .approve(tokenPaymaster.address, ethers.utils.parseEther('100000'));
  await approveTokenPaymasterForTestAccount.wait();

  approveTokenPaymasterForTestAccount = await testTokenContract
    .connect(account3Signer)
    .approve(tokenPaymaster.address, ethers.utils.parseEther('100000'));
  await approveTokenPaymasterForTestAccount.wait();

  console.log('Done with contract configs...');
};

main();
