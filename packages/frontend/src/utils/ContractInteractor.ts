import { ethers, Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import relayRecipient from "../contractdeployments/localhost/RelayRecipient.json";
import testToken from "../contractdeployments/localhost/TestToken.json";
import WalletStateManager from "../utils/WalletStateManager";
import PermitSigner from "../utils/PermitSigner";

const gsn = require("@opengsn/provider");

class ContractInteractor {
  private static instance: ContractInteractor;

  private constructor() {}

  public static getInstance(): ContractInteractor {
    if (!ContractInteractor.instance) {
      ContractInteractor.instance = new ContractInteractor();
    }
    return ContractInteractor.instance;
  }

  async mintToken(amount: number) {
    if (typeof (window as any).ethereum !== "undefined") {
      const { provider } =
        await WalletStateManager.getInstance().getWalletState();
      if (!provider) {
        return;
      }
      const contract = new ethers.Contract(
        relayRecipient.address,
        relayRecipient.abi,
        provider.getSigner() as Signer
      );
      const transaction = await contract.mintToken(testToken.address, amount);
      await transaction.wait();
    }
  }

  async getTokenBalance() {
    if (typeof (window as any).ethereum !== "undefined") {
      const { provider, address } =
        await WalletStateManager.getInstance().getWalletState();
      if (!provider) {
        return;
      }
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        testToken.address,
        testToken.abi,
        provider as Provider
      );
      try {
        const data = await contract.balanceOf(address);
        return data.toNumber();
      } catch (err) {
        return 0;
        console.log("Error: ", err);
      }
    }
  }

  async transferTokenSignOnce(destinationAddress: string, amount: number) {
    if (typeof (window as any).ethereum !== "undefined") {
      const { provider } =
        await WalletStateManager.getInstance().getWalletState();
      if (!provider) {
        return;
      }
      const contract = new ethers.Contract(
        relayRecipient.address,
        relayRecipient.abi,
        provider.getSigner() as Signer
      );
      const transaction = await contract.transferToken(
        testToken.address,
        destinationAddress,
        amount
      );
      await transaction.wait();
    }
  }

  async tokenSubmitPermit() {
    var result = await PermitSigner.getInstance().signTransferPermit(0);
    console.log(result);
    const { provider, address } =
      await WalletStateManager.getInstance().getWalletState();
    if (!provider) {
      return;
    }
    const contract = new ethers.Contract(
      relayRecipient.address,
      relayRecipient.abi,
      provider.getSigner() as Signer
    );
    const transaction = await contract.permit(
      testToken.address,
      address,
      relayRecipient.address,
      100,
      (result as any).deadline,
      result.nonce,
      true,
      result.v,
      result.r,
      result.s
    );
    await transaction.wait();
  }

  async transferTokenSignEverytime(destinationAddress: string, amount: number) {
    if (typeof (window as any).ethereum !== "undefined") {
      let result = await PermitSigner.getInstance().signTransferPermit(amount);
      const { provider, address } =
        await WalletStateManager.getInstance().getWalletState();
      if (!provider) {
        return;
      }
      const contract = new ethers.Contract(
        relayRecipient.address,
        relayRecipient.abi,
        provider.getSigner() as Signer
      );

      const permitTransaction = await contract.permit(
        testToken.address,
        address,
        relayRecipient.address,
        amount,
        (result as any).deadline,
        result.nonce,
        true,
        result.v,
        result.r,
        result.s
      );
      await permitTransaction.wait();

      const transaction = await contract.transferToken(
        testToken.address,
        destinationAddress,
        amount
      );
      await transaction.wait();
    }
  }

  /*
          async mintTestToken() {
              if (typeof (window as any).ethereum !== 'undefined') {
                  const { provider } = await WalletStateManager.getInstance().getWalletState();
                  const contract = new ethers.Contract(relayRecipient.address, relayRecipient.abi, provider.getSigner() as Signer);
                  const transaction = await contract.mint()
                  await transaction.wait();
              }
          }

          async getTokenBalance() {
              if (typeof (window as any).ethereum !== 'undefined') {
                  const { provider, address } = await WalletStateManager.getInstance().getWalletState();
                  const signer = provider.getSigner();
                  const contract = new ethers.Contract(testToken.address, testToken.abi, provider as Provider);
                  try {
                      const data = await contract.balanceOf(address);
                      return data.toNumber();
                  } catch (err) {
                      return 0;
                      console.log('Error: ', err);
                  }
              }
          }

          async transferToken(destinationAddress: string, amount: number) {
              if (typeof (window as any).ethereum !== 'undefined') {
                  const { provider } = await WalletStateManager.getInstance().getWalletState();
                  const contract = new ethers.Contract(relayRecipient.address, relayRecipient.abi, provider.getSigner() as Signer);
                  const transaction = await contract.transferToken(testToken.address, destinationAddress, amount);
                  await transaction.wait();
              }
          }

          async tokenSubmitPermit() {
              var result = await PermitSigner.getInstance().signTransferPermit();
              console.log(result);
              const { provider, address } = await WalletStateManager.getInstance().getWalletState();
              const contract = new ethers.Contract(relayRecipient.address, relayRecipient.abi, provider.getSigner() as Signer);
              const transaction = await contract.permit(
                  testToken.address,
                  address,
                  relayRecipient.address,
                  result.nonce,
                  (result as any).expiry,
                  result.allowed,
                  result.v,
                  result.r,
                  result.s
              );
              await transaction.wait();
          }

       */
}

export default ContractInteractor;
