import WalletStateManager from '../utils/WalletStateManager';
import { ethers } from 'ethers';
import { Provider } from '@ethersproject/providers';
import { contractRelayRecipient, contractToken } from './ContractAddresses';

class PermitSigner {
  private static instance: PermitSigner;
  owner = '';
  spender = '';
  value: string = '0';
  deadline = Date.now() + 120;
  nonce = 1;

  private constructor() {}

  public static getInstance(): PermitSigner {
    if (!PermitSigner.instance) {
      PermitSigner.instance = new PermitSigner();
    }
    return PermitSigner.instance;
  }

  createPermitMessageData() {
    let message = {
      owner: this.owner,
      spender: this.spender,
      value: this.value,
      nonce: this.nonce,
      deadline: this.deadline,
    };

    let typedData = JSON.stringify({
      types: {
        EIP712Domain: [
          {
            name: 'name',
            type: 'string',
          },
          {
            name: 'version',
            type: 'string',
          },
          {
            name: 'chainId',
            type: 'uint256',
          },
          {
            name: 'verifyingContract',
            type: 'address',
          },
        ],
        Permit: [
          {
            name: 'owner',
            type: 'address',
          },
          {
            name: 'spender',
            type: 'address',
          },
          {
            name: 'value',
            type: 'uint256',
          },
          {
            name: 'nonce',
            type: 'uint256',
          },
          {
            name: 'deadline',
            type: 'uint256',
          },
        ],
      },
      primaryType: 'Permit',
      domain: {
        name: 'Test Token',
        version: '1',
        chainId: 1337,
        verifyingContract: contractToken.address,
      },
      message: message,
    });

    return {
      typedData,
      message,
    };
  }

  async signData(web3provider: any, owner: any, typeData: any) {
    let result = await web3provider.send('eth_signTypedData_v3', [owner, typeData]);
    console.log('result', result);
    let r = result.slice(0, 66);
    let s = '0x' + result.slice(66, 130);
    let v = Number('0x' + result.slice(130, 132));
    return {
      v,
      r,
      s,
    };
  }

  async setupValues(value: string, spenderAddress: string) {
    let { provider, address } = await WalletStateManager.getInstance().getWalletState();
    this.owner = address;
    this.spender = spenderAddress;
    this.value = value;
    this.deadline = Date.now() + 120;
    this.nonce = await this.getNonce();
  }

  async getNonce() {
    let { provider, address } = await WalletStateManager.getInstance().getWalletState();
    if (!provider) {
      return 0;
    }
    let signer = provider.getSigner();
    let contract = new ethers.Contract(contractToken.address, contractToken.abi, provider as Provider);
    let data = await contract.nonces(address);
    console.log(data.toNumber());
    return data.toNumber();
  }

  async signTransferPermit(value: string, spenderAddress: string) {
    console.log('signTransferPermit - value ', value);
    await this.setupValues(value, spenderAddress);
    let metaProvider = new ethers.providers.Web3Provider((window as any).ethereum);
    let messageData = this.createPermitMessageData();
    let sig = await this.signData(metaProvider, this.owner, messageData.typedData);
    return Object.assign({}, sig, messageData.message);
  }
}

export default PermitSigner;
