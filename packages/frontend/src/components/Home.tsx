import React from "react";
import { ethers, providers, Signer } from "ethers";
import { Web3Provider, Provider } from "@ethersproject/providers";
import paymaster from "../contractbuild/gsn/Paymaster.json";
import relayRecipient from "../contractdeployments/localhost/RelayRecipient.json";
import freecoin from "../contractdeployments/localhost/FreeCoin.json";
import testToken from "../contractdeployments/localhost/TestToken.json";
import WalletStateManager from "../utils/WalletStateManager";
import ContractInteractor from "../utils/ContractInteractor";
import PermitSigner from "../utils/PermitSigner";
import { signDaiPermit } from "eth-permit";
import web3 from "web3";
const gsn = require("@opengsn/provider");

const Home = () => {
    const [userAddress, setUserAddress] = React.useState("");
    const [balance, setBalance] = React.useState(0);
    const [destinationAddress, setDestinationAddress] = React.useState("");
    const [transferAmount, setTransferAmount] = React.useState("");

    React.useEffect(() => {
        initialSetup();
    }, []);

    async function initialSetup() {
        const { address } = await WalletStateManager.getInstance().getWalletState();
        setUserAddress(address);
        setBalance(await ContractInteractor.getInstance().getTokenBalance());
    }

    const handleSubmit = (event: any) => {
        myfunc();
        event.preventDefault();
    };

    const myfunc = async () => {
        await ContractInteractor.getInstance().transferToken(
            destinationAddress,
            parseInt(transferAmount)
        );
    };

    return (
        <div>
            <h2>Step 1: Mint some dai stable coins first for testing purposes</h2>
            <button onClick={ContractInteractor.getInstance().mintFreeToken}>mint</button>
            <br />
            <br />
            <h2>Step 2: Check your current balance</h2>
            <button
                onClick={async () =>
                    setBalance(await ContractInteractor.getInstance().getTokenBalance())
                }
            >
                Click here to refresh current balance
            </button>
            <h4>Your current balance: {balance}</h4>
            <p>
                Can also check balance with metamask. You need to import token into
                metamask using this address below to see it in metamask account
            </p>
            <p>Dai stable coin address: {freecoin.address}</p>
            <p>Test Token address: {testToken.address}</p>
            <br />
            <h2>
                Step 3: Grant access to the contract by signing (so that contract can do
                the transfer through relay)
            </h2>
            <p>Note that without this step, the step 4: transfer will not work</p>
            <button onClick={ContractInteractor.getInstance().tokenSubmitPermit}>
                sign
            </button>
            <br />
            <br />
            <h2>Step 4: Try to transfer to recipient address</h2>
            <p>Your current address: {userAddress}</p>
            <form onSubmit={handleSubmit}>
                <label>
                    Recipient Address:
                    <input
                        type="text"
                        value={destinationAddress}
                        onChange={(event) => setDestinationAddress(event.target.value)}
                    />
                </label>
                <label>
                    Amount of dai:
                    <input
                        type="text"
                        value={transferAmount}
                        onChange={(event) => setTransferAmount(event.target.value)}
                    />
                </label>
                <input type="submit" value="Submit" />
            </form>
        </div>
    );
};

export default Home;
