import { expect } from 'chai';
import { ethers } from 'hardhat';
const Web3HttpProvider = require('web3-providers-http');
const { RelayProvider } = require('@opengsn/gsn');
import * as relayRecipient from '../deployments/localhost/RelayRecipient.json';
import * as testToken from '../deployments/localhost/TestToken.json';
import * as paymaster from '../gsn/Paymaster.json';

describe('MetaCoin', async function () {
  let accountA: any;
  let accountB: any;
  let signerA: any;
  let signerB: any;
  let testTokenContract: any;
  let relayRecipientContract: any;

  before(async () => {
    // setup gsn provider
    const config = {
      paymasterAddress: paymaster.address,
    };
    let gsnProvider = RelayProvider.newProvider({ provider: new Web3HttpProvider('http://localhost:8545'), config });
    await gsnProvider.init();

    // create dummy accounts for testing
    accountA = new ethers.Wallet(Buffer.from('2'.repeat(64), 'hex'));
    accountB = new ethers.Wallet(Buffer.from('1'.repeat(64), 'hex'));
    gsnProvider.addAccount(accountA.privateKey);
    gsnProvider.addAccount(accountB.privateKey);
    var provider = new ethers.providers.Web3Provider(gsnProvider);
    signerA = provider.getSigner(accountA.address);
    signerB = provider.getSigner(accountB.address);

    // import contracts for testing
    testTokenContract = new ethers.Contract(testToken.address, testToken.abi, provider);
    relayRecipientContract = new ethers.Contract(relayRecipient.address, relayRecipient.abi, provider);
  });

  it('should mint correctly', async function () {
    const mintAccountA = await relayRecipientContract.connect(signerA).mintToken(testTokenContract.address, ethers.utils.parseEther('1.0'));
    await mintAccountA.wait();
    expect(await testTokenContract.balanceOf(accountA.address)).to.equal(ethers.utils.parseEther('1.0'));
  });

  // more test cases
  // it('should do something... ', async function () {
  //   some logic
  // });

  // it('should do another thing...', async function () {
  //   some logic
  // });
});
