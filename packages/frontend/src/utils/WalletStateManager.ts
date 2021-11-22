import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { ContractAddressManager, contractPaymaster } from './ContractAddresses';

const gsn = require('@opengsn/provider');

type WalletState = {
  provider: Web3Provider | undefined;
  address: string;
  enabled: boolean;
};

class WalletStateManager {
  private static instance: WalletStateManager;
  private static walletState: WalletState;

  private constructor() {}

  public static getInstance(): WalletStateManager {
    if (!WalletStateManager.instance) {
      WalletStateManager.instance = new WalletStateManager();
    }
    return WalletStateManager.instance;
  }

  public async getWalletState(): Promise<WalletState> {
    const walletEnabled = await this.enableWallet();
    if (!walletEnabled) {
      const newState: WalletState = {
        provider: undefined,
        address: '',
        enabled: false,
      };
      WalletStateManager.walletState = newState;
      return newState;
    }
    var provider = await this.getProvider();
    var address = await this.getUserAddress(provider);
    const newState: WalletState = {
      provider: provider,
      address: address,
      enabled: walletEnabled,
    };
    WalletStateManager.walletState = newState;
    return newState;
  }

  public async requestAccount() {
    await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
  }

  private async enableWallet() {
    if ((window as any).ethereum) {
      try {
        await (window as any).ethereum.enable();
        return true;
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  private async getProvider(): Promise<Web3Provider> {
    // return new ethers.providers.Web3Provider((window as any).ethereum);
    let config = {
      paymasterAddress: ContractAddressManager.getInstance().getContractPaymaster().address,
      verbose: true,
    };
    let gsnProvider = await gsn.RelayProvider.newProvider({
      provider: (window as any).ethereum,
      config,
    }).init();
    const newProvider = new ethers.providers.Web3Provider(gsnProvider as any);
    return newProvider;
  }

  private async getUserAddress(provider: Web3Provider) {
    const signer = provider.getSigner();
    var address = await signer.getAddress();
    return address;
  }
}

export default WalletStateManager;
