import WalletStateManager from "../utils/WalletStateManager";
import relayRecipient from "../contractdeployments/localhost/RelayRecipient.json";
import { ethers } from "ethers";
import freeCoin from "../contractdeployments/localhost/FreeCoin.json";
import testToken from "../contractdeployments/localhost/TestToken.json";
import { Provider } from "@ethersproject/providers";

class PermitSigner {
  private static instance: PermitSigner;
  owner = "";
  spender = "";
  value: number = 0;
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
    const message = {
      owner: this.owner,
      spender: this.spender,
      value: this.value,
      nonce: this.nonce,
      deadline: this.deadline,
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
            name: "owner",
            type: "address",
          },
          {
            name: "spender",
            type: "address",
          },
          {
            name: "value",
            type: "uint256",
          },
          {
            name: "nonce",
            type: "uint256",
          },
          {
            name: "deadline",
            type: "uint256",
          },
        ],
      },
      primaryType: "Permit",
      domain: {
        name: "Test Token",
        version: "1",
        chainId: 1337,
        verifyingContract: testToken.address,
      },
      message: message,
    });

    return {
      typedData,
      message,
    };
  }

  async signData(web3provider: any, owner: any, typeData: any) {
    var result = await web3provider.send("eth_signTypedData_v3", [
      owner,
      typeData,
    ]);
    console.log("result", result);
    const r = result.slice(0, 66);
    const s = "0x" + result.slice(66, 130);
    const v = Number("0x" + result.slice(130, 132));
    return {
      v,
      r,
      s,
    };
  }

  async setupValues(value: number) {
    const { provider, address } =
      await WalletStateManager.getInstance().getWalletState();
    this.owner = address;
    this.spender = relayRecipient.address;
    this.value = value;
    this.deadline = Date.now() + 120;
    this.nonce = await this.getNonce();
  }

  async getNonce() {
    const { provider, address } =
      await WalletStateManager.getInstance().getWalletState();
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      freeCoin.address,
      freeCoin.abi,
      provider as Provider
    );
    const data = await contract.nonces(address);
    console.log(data.toNumber());
    return data.toNumber();
  }

  async signTransferPermit(value: number) {
    console.log("signTransferPermit - value ", value);
    await this.setupValues(value);
    const metaProvider = new ethers.providers.Web3Provider(
      (window as any).ethereum
    );
    const messageData = this.createPermitMessageData();
    const sig = await this.signData(
      metaProvider,
      this.owner,
      messageData.typedData
    );
    return Object.assign({}, sig, messageData.message);
  }
}

export default PermitSigner;
