import WalletStateManager from "../utils/WalletStateManager";
import relayRecipient from "../contractdeployments/localhost/RelayRecipient.json";
import { ethers, providers, Signer } from 'ethers'
import freecoin from "../contractdeployments/localhost/FreeCoin.json";
import { Web3Provider, Provider } from '@ethersproject/providers';

class PermitSigner {

    private static instance: PermitSigner;
    private constructor() { }

    public static getInstance(): PermitSigner {
        if (!PermitSigner.instance) {
            PermitSigner.instance = new PermitSigner();
        }
        return PermitSigner.instance;
    }

    fromAddress = "";
    expiry = Date.now() + 120;
    nonce = 1;
    spender = "";

    createPermitMessageData() {
      const message = {
        holder: this.fromAddress,
        spender: this.spender,
        nonce: this.nonce,
        expiry: this.expiry,
        allowed: true,
      };

      const typedData = JSON.stringify({
        types: {
          EIP712Domain: [
            {
              name: "name",
              type: "string",
            },
            {
              name: "version",
              type: "string",
            },
            {
              name: "chainId",
              type: "uint256",
            },
            {
              name: "verifyingContract",
              type: "address",
            },
          ],
          Permit: [
            {
              name: "holder",
              type: "address",
            },
            {
              name: "spender",
              type: "address",
            },
            {
              name: "nonce",
              type: "uint256",
            },
            {
              name: "expiry",
              type: "uint256",
            },
            {
              name: "allowed",
              type: "bool",
            },
          ],
        },
        primaryType: "Permit",
        domain: {
          name: "Dai Stablecoin",
          version: "1",
          chainId: 1337,
          verifyingContract: freecoin.address,
        },
        message: message,
      });

      return {
        typedData,
        message,
      };
    }

    async signData(web3provider: any, fromAddress: any, typeData: any) {
      var result = await web3provider.send('eth_signTypedData_v3', [fromAddress, typeData]);
      console.log(result);
      const r = result.slice(0, 66);
      const s = "0x" + result.slice(66, 130);
      const v = Number("0x" + result.slice(130, 132));
      return {
          v,r,s
      }
    }

    async setupValues() {
        const {provider, address} = await WalletStateManager.getInstance().getWalletState();
        this.fromAddress = address;
        this.expiry = Date.now() + 120;
        this.nonce = await this.getNonce();
        this.spender = relayRecipient.address;
    }

    async getNonce() {
        const {provider, address} = await WalletStateManager.getInstance().getWalletState();
        const signer = provider.getSigner()
        const contract = new ethers.Contract(freecoin.address, freecoin.abi, provider as Provider);
        const data = await contract.nonces(address);
        console.log(data.toNumber());
        return (data.toNumber());
    }

    async signTransferPermit() {
        await this.setupValues();
        const metaProvider = new ethers.providers.Web3Provider((window as any).ethereum);
        const messageData = this.createPermitMessageData();
        const sig = await this.signData(metaProvider, this.fromAddress, messageData.typedData);
        return Object.assign({}, sig, messageData.message);
    }

}

export default PermitSigner;