import { expect } from "chai";
import { ethers } from "hardhat";
import { MetaCoin, MetaCoin__factory } from "@typechained";
const Web3HttpProvider = require( 'web3-providers-http')
const { GsnTestEnvironment } = require('@opengsn/gsn/dist/GsnTestEnvironment' )
const { RelayProvider } = require('@opengsn/gsn')

describe("MetaCoin", async function () {

  let web3provider: any;
  let etherProvider: any;
  let accountA: any;
  let accountB: any;
  let signerA: any;
  let signerB: any;
  let metacoin: MetaCoin;
  let metacoinFactory: MetaCoin__factory;

  before(async () => {
    web3provider = new Web3HttpProvider('http://localhost:8545')
    const forwarder = require( '../build/gsn/Forwarder').address
    const paymaster = require( '../build/gsn/Paymaster').address
    const config = await {
        paymasterAddress: paymaster,
    }
    let gsnProvider = RelayProvider.newProvider({provider: web3provider, config})
    await gsnProvider.init()

    accountA = new ethers.Wallet(Buffer.from('1'.repeat(64),'hex'))
    accountB = new ethers.Wallet(Buffer.from('2'.repeat(64),'hex'))
    gsnProvider.addAccount(accountA.privateKey)
    gsnProvider.addAccount(accountB.privateKey)
    etherProvider = new ethers.providers.Web3Provider(gsnProvider)
    signerA = etherProvider.getSigner(accountA.address)
    signerB = etherProvider.getSigner(accountB.address)

    metacoinFactory = (await ethers.getContractFactory(
      "MetaCoin"
    )) as MetaCoin__factory;
    metacoin = await metacoinFactory.deploy(forwarder);
    await metacoin.deployed();
  });

  it("should mint correctly", async function () {
    const mintAccountA = await metacoin.connect(signerA).mint(500);
    await mintAccountA.wait();
    expect(await metacoin.balanceOf(accountA.address)).to.equal(500);
  });

  it("should transfer coin correctly without incurring gas fee", async function () {
    const initialBalanceA = await etherProvider.getBalance(accountA.address);
    const initialBalanceB = await etherProvider.getBalance(accountB.address);
    const transferTxn = await metacoin.connect(signerA).transfer(accountB.address, 200);
    await transferTxn.wait();
    expect(await metacoin.balanceOf(accountA.address)).to.equal(300);
    expect(await metacoin.balanceOf(accountB.address)).to.equal(200);
    expect(await etherProvider.getBalance(accountA.address)).to.equal(initialBalanceA);
    expect(await etherProvider.getBalance(accountB.address)).to.equal(initialBalanceB);
  });
});
