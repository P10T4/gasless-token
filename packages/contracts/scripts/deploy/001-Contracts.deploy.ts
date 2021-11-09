import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import forwarder from '../../gsn/Forwarder.json';
import { BigNumber } from 'ethers';

const deployFunc: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployer } = await hre.getNamedAccounts();
  const chainId = await hre.getChainId();

  console.log(deployer);

  await hre.deployments.deploy('FreeCoin', {
    from: deployer,
    args: [chainId], //need to edit this
    log: true,
  });

  await hre.deployments.deploy('RelayRecipient', {
    from: deployer,
    args: [forwarder.address], //need to edit this
    log: true,
  });

  await hre.deployments.deploy('TestToken', {
    from: deployer,
    log: true,
  });

  let testUniswap = await hre.deployments.deploy('TestUniswap', {
    from: deployer,
    args: [1, 1],
    value: BigNumber.from(1),
    log: true,
  });

  await hre.deployments.deploy('TokenPaymaster', {
    from: deployer,
    args: [[testUniswap.address]],
    log: true,
  });
};

deployFunc.tags = ['Contracts'];

export default deployFunc;

// import * as ethers from 'ethers';

// async function main() {
//   // We get the contract to deploy
//   const Greeter = await ethers.getContractFactory("Greeter");
//   const greeter = await Greeter.deploy("Hello, Hardhat!");

//   console.log("Greeter deployed to:", greeter.address);
// }

// main()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });
