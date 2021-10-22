import React from 'react';
import { ethers, providers, Signer } from 'ethers'
import { Web3Provider, Provider } from '@ethersproject/providers';
import paymaster from "../contractbuild/gsn/Paymaster.json";
import metacoin from "../contractdeployments/deployments/localhost/MetaCoin.json";
const gsn = require('@opengsn/provider')

const Home = () => {

    var provider: any = null;

    async function setProvider() {
        if (provider != null) {
            return
        }
        let config = {
            paymasterAddress: paymaster.address,
            verbose: true, 
        };
        let gsnProvider = await (gsn.RelayProvider.newProvider({provider: (window as any).ethereum, config})).init();
        provider = new ethers.providers.Web3Provider(gsnProvider as any);
    }
      // request access to the user's MetaMask account
    async function requestAccount() {
        await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        await setProvider();
    }

      // call the smart contract, read the current greeting value
    async function readBalance() {
        if (typeof (window as any).ethereum !== 'undefined') {
            requestAccount();
        // const provider = new ethers.providers.Web3Provider((window as any).ethereum) as Web3Provider
        const signer = provider.getSigner()
        const contract = new ethers.Contract(metacoin.address, metacoin.abi, provider as Provider);
        try {
            const data = await contract.balanceOf(await signer.getAddress())
            setBalance(data.toNumber());
        } catch (err) {
            console.log("Error: ", err)
        }
        }    
    }

      // call the smart contract, send an update
    async function mintToken() {
        if (typeof (window as any).ethereum !== 'undefined') {
            await requestAccount()
            const contract = new ethers.Contract(metacoin.address, metacoin.abi, provider.getSigner() as Signer)
            const transaction = await contract.mint(100);
            await transaction.wait()
            // readBalance();
        }
    }

    async function transferToken(address: string, amount: any) {
        if (typeof (window as any).ethereum !== 'undefined') {
            await requestAccount();
            let config = {
                paymasterAddress: paymaster.address,
                verbose: true, 
            };
            let gsnProvider = await (gsn.RelayProvider.newProvider({provider: (window as any).ethereum, config})).init();
            
            const provider = new ethers.providers.Web3Provider(gsnProvider as any);
            const contract = new ethers.Contract(metacoin.address, metacoin.abi, provider.getSigner() as Signer)
            const transaction = await contract.transfer(address, amount)
            await transaction.wait()
        }
    }

    const [address, setaddress] = React.useState("");
    const [balance, setBalance] = React.useState(0);

    const handleChange = (event: any) => {    
        setaddress(event.target.value);  
    }
    const handleSubmit = (event: any) => {
      transferToken(address, 30)
      event.preventDefault();
    }

    return (<div>
        <h2>Step 1: Mint some token first</h2>
        <p>After we mint some token, then we can use it to transfer to other accounts</p>
        <button onClick={mintToken}>mint</button>
        <br/>
        <br/>
        <h2>Step 2: Check your current balance</h2>
        <button onClick={readBalance}>Click here to refresh current balance</button>
        <h4>Your current balance: {balance}</h4>
        <p>Can also check balance with metamask. You need to import token into metamask using this address below to see it in metamask account</p>
        <p>Metacoin address: {metacoin.address}</p>
        <br/>
        <h2>Step 3: Try to transfer to receipient address</h2>
        <p>Your current address: {}</p>
        <form onSubmit={handleSubmit}>
        <label>
          Receipient Address:
          <input type="text" value={address} onChange={handleChange} />        </label>
            <input type="submit" value="Submit" />
        </form>
    </div>)
}

export default Home;