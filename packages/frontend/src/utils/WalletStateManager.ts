import { ethers, providers, Signer } from 'ethers'
import { Web3Provider, Provider } from '@ethersproject/providers';
import paymaster from "../contractbuild/gsn/Paymaster.json";
import tokenPaymaster from '../contractdeployments/localhost/TokenPaymaster.json'
import relayRecipient from "../contractdeployments/localhost/RelayRecipient.json";
import freecoin from "../contractdeployments/localhost/FreeCoin.json";
const gsn = require('@opengsn/provider')

type WalletState = {
    provider: Web3Provider,
    address: string,
}


class WalletStateManager {

    private static instance: WalletStateManager;
    private static walletState: WalletState;

    private constructor() { }

    public static getInstance(): WalletStateManager {
        if (!WalletStateManager.instance) {
            WalletStateManager.instance = new WalletStateManager();
        }
        return WalletStateManager.instance;
    }

    public async getWalletState(): Promise<WalletState> {
        if (WalletStateManager.walletState) {
            return WalletStateManager.walletState;
        }
        var provider = await this.getProvider();
        var address = await this.getUserAddress(provider);
        const newState: WalletState = {
            provider: provider,
            address: address
        }
        WalletStateManager.walletState = newState;
        return newState;
    }

    public async requestAccount() {
        await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
    }

    private async getProvider(): Promise<Web3Provider> {
        // return new ethers.providers.Web3Provider((window as any).ethereum);
        let config = {
            paymasterAddress: paymaster.address,
            verbose: true,
        };
        let gsnProvider = await (gsn.RelayProvider.newProvider({provider: (window as any).ethereum, config})).init();
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