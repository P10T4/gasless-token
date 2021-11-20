import { expect } from 'chai';
import { ethers } from 'hardhat';
const Web3HttpProvider = require('web3-providers-http');
const { RelayProvider } = require('@opengsn/gsn');
import * as relayRecipient from '../deployments/localhost/RelayRecipient.json';
import * as testToken from '../deployments/localhost/TestToken.json';
import * as paymaster from '../gsn/Paymaster.json';
import * as forwarder from '../gsn/Forwarder.json';
import * as relayHub from '../gsn/RelayHub.json';
import * as tokenPaymaster from '../deployments/localhost/TokenPaymaster.json';
import * as TestUniswap from '../deployments/localhost/TestUniswap.json';

describe('Test TokenPaymaster', async function () {
  let accountA: any;
  let accountB: any;
  let signerA: any;
  let signerB: any;
  let testTokenContract: any;
  let relayRecipientContract: any;
  let tokenPaymasterContract: any;
  let provider: any;

  before(async () => {
    // setup token paymaster
    var accountWithEth = new ethers.Wallet(Buffer.from('2c6036688de3383aac61e305b3bf91bc567f508ce01db108d17e62ca364a2488', 'hex'));
    provider = new ethers.providers.Web3Provider(new Web3HttpProvider('http://localhost:8545'));
    tokenPaymasterContract = new ethers.Contract(tokenPaymaster.address, tokenPaymaster.abi, provider);
    var accountWithEthSigner = provider.getSigner(accountWithEth.address);

    // fund token paymaster
    const fundTokenPaymaster = await accountWithEthSigner.sendTransaction({
      to: tokenPaymaster.address,
      value: ethers.utils.parseEther('1.0'),
    });
    await fundTokenPaymaster.wait();

    // fund Test Uniswap
    const fundTestUniswap = await accountWithEthSigner.sendTransaction({
      to: TestUniswap.address,
      value: ethers.utils.parseEther('50.0'),
    });
    await fundTestUniswap.wait();

    // create dummy accounts for testing
    accountA = new ethers.Wallet(Buffer.from('6d61bdbd9c2cd61f2be4b8aaf3cb930cb317028389f8f7f7f454ccc98d36d4f5', 'hex'));
    accountB = new ethers.Wallet(Buffer.from('1'.repeat(64), 'hex'));

    // setup gsn provider
    const config = {
      paymasterAddress: tokenPaymaster.address,
    };
    let gsnProvider = RelayProvider.newProvider({ provider: new Web3HttpProvider('http://localhost:8545'), config });
    await gsnProvider.init();

    // import deployed contracts
    testTokenContract = new ethers.Contract(testToken.address, testToken.abi, provider);
    testTokenContract = new ethers.Contract(testToken.address, testToken.abi, provider);
    relayRecipientContract = new ethers.Contract(relayRecipient.address, relayRecipient.abi, provider);

    // mint some test token into accountA
    const fundAccountA = await testTokenContract
      .connect(provider.getSigner(accountA.address))
      .mint(accountA.address, ethers.utils.parseEther('1000.0'));
    await fundAccountA.wait();

    // approve tokenPaymaster to spend for accountA (THIS IS TEMPORARY, NEED THINK ABOUT THIS)
    const approveA = await testTokenContract
      .connect(provider.getSigner(accountA.address))
      .approve(tokenPaymaster.address, ethers.utils.parseEther('1000.0'));
    await approveA.wait();

    // final setup on provider and signers
    gsnProvider.addAccount(accountA.privateKey);
    gsnProvider.addAccount(accountB.privateKey);
    provider = new ethers.providers.Web3Provider(gsnProvider);
    signerA = provider.getSigner(accountA.address);
    signerB = provider.getSigner(accountB.address);
  });

  it('should mint correctly', async function () {
    const mintAccountA = await relayRecipientContract.connect(signerA).mintToken(testTokenContract.address, ethers.utils.parseEther('10'));
    await mintAccountA.wait();
    expect(parseFloat(ethers.utils.formatEther(await testTokenContract.balanceOf(accountA.address))))
      .to.greaterThan(1009)
      .lessThan(1010); // must be less than 1010 because of deducted token as gas fees
  });
});
