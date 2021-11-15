import { ethers, Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import WalletStateManager from "../utils/WalletStateManager";
import PermitSigner from "../utils/PermitSigner";
import {
  contractRelayRecipient,
  contractToken,
  contractPaymaster,
  contractUnupgradableToken,
  contractUnupgradableERC20Permit,
} from "./addresses";

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
        contractRelayRecipient.address,
        contractRelayRecipient.abi,
        provider.getSigner() as Signer
      );
      const transaction = await contract.mintToken(
        contractUnupgradableERC20Permit.address,
        ethers.utils.parseEther(`${amount}`).toBigInt()
      );
      await transaction.wait();
    }
  }

  async getTokenBalance(): Promise<number | null> {
    if (typeof (window as any).ethereum !== "undefined") {
      const { provider, address } =
        await WalletStateManager.getInstance().getWalletState();
      if (!provider) {
        return null;
      }
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractUnupgradableERC20Permit.address,
        contractUnupgradableERC20Permit.abi,
        provider as Provider
      );
      try {
        const data = await contract.balanceOf(address);
        return parseFloat(ethers.utils.formatEther(data));
      } catch (err) {
        return 0;
      }
    }
    return 0;
  }

  async transferTokenWithPermit(destinationAddress: string, amount: number) {
    if (typeof (window as any).ethereum !== "undefined") {
      let result = await PermitSigner.getInstance().signTransferPermit(amount);
      const { provider, address } =
        await WalletStateManager.getInstance().getWalletState();
      if (!provider) {
        return;
      }
      const contract = new ethers.Contract(
        contractRelayRecipient.address,
        contractRelayRecipient.abi,
        provider.getSigner() as Signer
      );

      const permitTransaction = await contract.permitAndTransfer(
        contractUnupgradableERC20Permit.address,
        amount,
        ethers.utils.parseEther(`${amount}`).toBigInt(),
        destinationAddress,
        address,
        contractRelayRecipient.address,
        (result as any).deadline,
        result.nonce,
        true,
        result.v,
        result.r,
        result.s
      );
      await permitTransaction.wait();
    }
  }
}

export default ContractInteractor;
