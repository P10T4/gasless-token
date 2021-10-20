import { expect } from "chai";
import { ethers } from "hardhat";
import { MetaCoin, MetaCoin__factory } from "@typechained";
const Web3HttpProvider = require( 'web3-providers-http')
const { GsnTestEnvironment } = require('@opengsn/gsn/dist/GsnTestEnvironment' )
const { RelayProvider } = require('@opengsn/gsn')

describe("MetaCoin", function () {

  beforeEach(async () => {

  });

  it("checking transfer logic", async function () {
    const web3provider = new Web3HttpProvider('http://localhost:8545')
    const forwarder = require( '../build/gsn/Forwarder').address
    const paymaster = require( '../build/gsn/Paymaster').address
    const config = await {
        paymasterAddress: paymaster,
    }
        // const hdweb3provider = new HDWallet('0x123456', 'http://localhost:8545')
    let gsnProvider = RelayProvider.newProvider({provider: web3provider, config})
    await gsnProvider.init()

    const account = new ethers.Wallet(Buffer.from('1'.repeat(64),'hex'))
    gsnProvider.addAccount(account.privateKey)
    let from = account.address
    const etherProvider = new ethers.providers.Web3Provider(gsnProvider)
    const signer = etherProvider.getSigner(from)

  let metacoin: MetaCoin;
  let metacoinFactory: MetaCoin__factory;


  // let accountAddress = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";
  let accountA = "0x572f76C826F2bfdef8ada45e98B6684944b42052";
  // let accountB = "0x5A17dc3bB5DacC32d752A864E55fe4306EA5a116";
    metacoinFactory = (await ethers.getContractFactory(
      "MetaCoin"
    )) as MetaCoin__factory;
    metacoin = await metacoinFactory.deploy(forwarder);
    await metacoin.deployed();

    //first check account should have initial value of 10000
    // expect(await metacoin.balanceOf(forwarder)).to.equal(10000);

    // //check minting logic
    const mintAccountA = await metacoin.connect(signer).mint(500);
    await mintAccountA.wait();
    expect(await metacoin.balanceOf(account.address)).to.equal(500);

    // const mintAccountB = await metacoin.mint(accountB, 500);
    // await mintAccountB.wait();

    // //check transfer logic from A to B
    // const transferTxn = await metacoin.connect(accountA).transfer(accountB, 500);
    // await transferTxn.wait();
    // expect(await metacoin.balanceOf(accountA)).to.equal(0);
    // expect(await metacoin.balanceOf(accountB)).to.equal(1000);
  });
});
