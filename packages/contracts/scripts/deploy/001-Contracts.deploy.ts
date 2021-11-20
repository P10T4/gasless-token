import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import forwarder from '../../gsn/Forwarder.json';
import relayHub from '../../gsn/RelayHub.json';
import { BigNumber } from 'ethers';

const deployFunc: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployer } = await hre.getNamedAccounts();
  const chainId = await hre.getChainId();

  let relayRecipient = await hre.deployments.deploy('RelayRecipient', {
    from: deployer,
    args: [forwarder.address], //need to edit this
    log: true,
  });

  let testToken = await hre.deployments.deploy('TestToken', {
    from: deployer,
    args: [BigNumber.from(1000)],
    log: true,
  });

  let testUniswap = await hre.deployments.deploy('TestUniswap', {
    from: deployer,
    args: [1, 1, testToken.address],
    value: BigNumber.from(1),
    log: true,
  });

  let tokenPaymaster = await hre.deployments.deploy('TokenPaymaster', {
    from: deployer,
    args: [[testUniswap.address], forwarder.address, relayHub.address],
    log: true,
  });

  let whitelistPaymaster = await hre.deployments.deploy('WhitelistPaymaster', {
    from: deployer,
    args: [forwarder.address, relayHub.address],
    log: true,
  });
};

deployFunc.tags = ['Contracts'];

export default deployFunc;
