import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployFunc: DeployFunction = async (
  hre: HardhatRuntimeEnvironment
) => {
  const { deployer } = await hre.getNamedAccounts();
  const chainId = await hre.getChainId();

  await hre.deployments.deploy("MetaCoin", {
    from: deployer,
    args: ["0x572f76C826F2bfdef8ada45e98B6684944b42052"], //need to edit this
    log: true,
  });
};
deployFunc.tags = ["MetaCoin"];

export default deployFunc;