import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import forwarder from "../../build/gsn/Forwarder.json";

const deployFunc: DeployFunction = async (
  hre: HardhatRuntimeEnvironment
) => {
  const { deployer } = await hre.getNamedAccounts();
  const chainId = await hre.getChainId();

  await hre.deployments.deploy("MetaCoin", {
    from: deployer,
    args: [forwarder.address], //need to edit this
    log: true,
  });

  // await hre.deployments.deploy("MyPaymaster", {
  //   from: deployer,
  //   args: [], //need to edit this
  //   log: true,
  // });
};
deployFunc.tags = ["MetaCoin"];

export default deployFunc;