import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("TestUniSwap", function () {

    it("Should be deployed normally", async function () {
        const TestUniSwap = await ethers.getContractFactory('TestUniswap');
        const testUniswap = await TestUniSwap.deploy(1, 2, { value: 3 });
        await testUniswap.deployed();

        expect(await testUniswap.rateMult()).is.equal(1);
        expect(await testUniswap.rateDiv()).is.equal(2);
    });

    it("Should revert (msg.value=0) with a need to specifiy liquidity", async function () {
        const TestUniSwap = await ethers.getContractFactory('TestUniswap');
        await expect(TestUniSwap.deploy(1, 2, { value: 0 }))
            .is.revertedWith("must specify liquidity");
    });

    it("Should revert (div=0) with bad mult,div", async function () {
        const TestUniSwap = await ethers.getContractFactory('TestUniswap');
        await expect(TestUniSwap.deploy(1, 0, { value: 3 }))
            .is.revertedWith('bad mult,div');
    });

    it("Should revert (mult=0) with bad mult,div", async function () {
        const TestUniSwap = await ethers.getContractFactory('TestUniswap');
        await expect(TestUniSwap.deploy(0, 1, { value: 3 }))
            .is.revertedWith('bad mult,div');
    });

    it("Should give correct Token/ETH output price", async function () {
        const TestUniSwap = await ethers.getContractFactory('TestUniswap');
        const testUniswap = await TestUniSwap.deploy(1, 2, { value: 3 });
        await testUniswap.deployed();

        expect(await testUniswap.getTokenToEthOutputPrice(4)).is.equal(2);
    });



});