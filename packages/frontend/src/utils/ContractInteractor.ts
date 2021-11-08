import { ethers, providers, Signer } from 'ethers'
import { Web3Provider, Provider } from '@ethersproject/providers';
import paymaster from "../contractbuild/gsn/Paymaster.json";
import relayRecipient from "../contractdeployments/localhost/RelayRecipient.json";
import freecoin from "../contractdeployments/localhost/FreeCoin.json";
import WalletStateManager from "../utils/WalletStateManager";
import PermitSigner from '../utils/PermitSigner';
const gsn = require('@opengsn/provider');


class ContractInteractor {

    private static instance: ContractInteractor;
    private constructor() { }

    public static getInstance(): ContractInteractor {
        if (!ContractInteractor.instance) {
            ContractInteractor.instance = new ContractInteractor();
        }
        return ContractInteractor.instance;
    }

	async mintFreeToken() {
        if (typeof (window as any).ethereum !== 'undefined') {
        	const {provider} = await WalletStateManager.getInstance().getWalletState();
            const contract = new ethers.Contract(relayRecipient.address, relayRecipient.abi, provider.getSigner() as Signer)
            const transaction = await contract.mint(freecoin.address,100);
            await transaction.wait()
        }
    }

    async getTokenBalance() {
        if (typeof (window as any).ethereum !== 'undefined') {
            const {provider, address} = await WalletStateManager.getInstance().getWalletState();
            const signer = provider.getSigner()
            const contract = new ethers.Contract(freecoin.address, freecoin.abi, provider as Provider);
            try {
                const data = await contract.balanceOf(address);
                return data.toNumber();
            } catch (err) {
            	return 0;
                console.log("Error: ", err)
            }
        }
    }

    async transferToken(destinationAddress: string, amount: number) {
        if (typeof (window as any).ethereum !== 'undefined') {
            const {provider} = await WalletStateManager.getInstance().getWalletState();
            const contract = new ethers.Contract(relayRecipient.address, relayRecipient.abi, provider.getSigner() as Signer)
            const transaction = await contract.transferToken(freecoin.address ,destinationAddress, amount)
            await transaction.wait();
        }
    }

    async tokenSubmitPermit() {
        var result = await PermitSigner.getInstance().signTransferPermit();
        console.log(result);
        const {provider, address} = await WalletStateManager.getInstance().getWalletState();
        const contract = new ethers.Contract(relayRecipient.address, relayRecipient.abi, provider.getSigner() as Signer)
        const transaction = await contract.permit(freecoin.address, address, relayRecipient.address, result.nonce, (result as any).expiry, result.allowed, result.v, result.r, result.s);
        await transaction.wait();
    }

}

export default ContractInteractor;