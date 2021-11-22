import { BigNumber } from '@ethersproject/bignumber';
import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('TestToken', function () {
  it('Deploying owner should have total supply given and total supply should be recorded', async function () {
    const [owner] = await ethers.getSigners();
    const TestToken = await ethers.getContractFactory('TestToken');
    const testToken = await TestToken.deploy(BigNumber.from(1000));
    await testToken.deployed();
    expect(await testToken.balanceOf(owner.getAddress())).is.equal(BigNumber.from(1000));
    expect(await testToken.totalSupply()).is.equal(BigNumber.from(1000));
  });

  it('Should updated total supply after minting', async function () {
    const [owner, addr1] = await ethers.getSigners();
    const TestToken = await ethers.getContractFactory('TestToken');
    const testToken = await TestToken.deploy(BigNumber.from(1000));
    await testToken.deployed();

    expect(await testToken.totalSupply()).is.equal(BigNumber.from(1000));
    expect(await testToken.balanceOf(owner.getAddress())).is.equal(BigNumber.from(1000)); // owner no change in amount throughout
    expect(await testToken.balanceOf(addr1.getAddress())).is.equal(BigNumber.from(0));

    const minting = await testToken.connect(addr1).mint(addr1.getAddress(), BigNumber.from(250)); // mint 250 for user
    await minting.wait(); // Wait for minting to end

    expect(await testToken.totalSupply()).is.equal(BigNumber.from(1250));
    expect(await testToken.balanceOf(owner.getAddress())).is.equal(BigNumber.from(1000)); // owner no change in amount throughout
    expect(await testToken.balanceOf(addr1.getAddress())).is.equal(BigNumber.from(250));
  });

  it('Should return warning upon minting to burn address at 0x0', async function () {
    const [owner, addr1] = await ethers.getSigners();
    const TestToken = await ethers.getContractFactory('TestToken');
    const testToken = await TestToken.deploy(BigNumber.from(1000));
    await testToken.deployed();

    expect(await testToken.totalSupply()).is.equal(BigNumber.from(1000));
    expect(await testToken.balanceOf(owner.getAddress())).is.equal(BigNumber.from(1000)); // owner no change in amount throughout
    expect(await testToken.balanceOf(addr1.getAddress())).is.equal(BigNumber.from(0));

    await expect(testToken.connect(addr1).mint('0x0000000000000000000000000000000000000000', 100)).to.be.revertedWith(
      'ERC20: mint to the zero addres'
    );
  });

  it('Should return warning upon buring from address at 0x0', async function () {
    const [owner, addr1] = await ethers.getSigners();
    const TestToken = await ethers.getContractFactory('TestToken');
    const testToken = await TestToken.deploy(BigNumber.from(1000));
    await testToken.deployed();

    expect(await testToken.totalSupply()).is.equal(BigNumber.from(1000));
    expect(await testToken.balanceOf(owner.getAddress())).is.equal(BigNumber.from(1000));
    expect(await testToken.balanceOf(addr1.getAddress())).is.equal(BigNumber.from(0));

    await expect(testToken.connect(addr1).burn('0x0000000000000000000000000000000000000000', 100)).to.be.revertedWith(
      'ERC20: burn from the zero address'
    );

    expect(await testToken.totalSupply()).is.equal(BigNumber.from(1000)); // No change as not burned
  });

  it('Should return messsage if burning amount more than balance', async function () {
    const [owner, addr1] = await ethers.getSigners();
    const TestToken = await ethers.getContractFactory('TestToken');
    const testToken = await TestToken.deploy(BigNumber.from(1000));
    await testToken.deployed();
    // Addr 1 has 0 token after deploy since its not the owner

    expect(await testToken.totalSupply()).is.equal(BigNumber.from(1000));
    expect(await testToken.balanceOf(owner.getAddress())).is.equal(BigNumber.from(1000));
    expect(await testToken.balanceOf(addr1.getAddress())).is.equal(BigNumber.from(0));

    const minting = await testToken.connect(addr1).mint(addr1.getAddress(), BigNumber.from(250)); // mint 250 for user
    await minting.wait(); // Wait for minting to end

    await expect(testToken.connect(owner).burn(addr1.getAddress(), 251)).to.be.revertedWith('ERC20: burn amount exceeds balance');

    expect(await testToken.totalSupply()).is.equal(BigNumber.from(1250)); // 1000 +250 no change
  });

  it('Should upadte balance and total supply after burning', async function () {
    const [owner, addr1] = await ethers.getSigners();
    const TestToken = await ethers.getContractFactory('TestToken');
    const testToken = await TestToken.deploy(BigNumber.from(1000));
    await testToken.deployed();
    // Addr 1 has 0 token after deploy since its not the owner

    expect(await testToken.totalSupply()).is.equal(BigNumber.from(1000));
    expect(await testToken.balanceOf(owner.getAddress())).is.equal(BigNumber.from(1000));
    expect(await testToken.balanceOf(addr1.getAddress())).is.equal(BigNumber.from(0));

    const minting = await testToken.connect(addr1).mint(addr1.getAddress(), BigNumber.from(250)); // mint 250 for user
    await minting.wait(); // Wait for minting to end

    await expect(testToken.connect(owner).burn(addr1.getAddress(), 50)).to.emit(testToken, 'Transfer');

    expect(await testToken.balanceOf(owner.getAddress())).is.equal(BigNumber.from(1000));
    expect(await testToken.balanceOf(addr1.getAddress())).is.equal(BigNumber.from(200));
    expect(await testToken.totalSupply()).is.equal(BigNumber.from(1200)); // Burned 50;
  });
});
