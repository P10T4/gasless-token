import React from 'react';
import { ethers, Signer } from 'ethers'
import MetaCoin from './MetaCoin.json'
import { Web3Provider, Provider } from '@ethersproject/providers';

const metaCoinDeployedAddress = "0x90614D444FAEf4077e07b0Cbc20099de67CFBc01"

const Home = () => {
      // request access to the user's MetaMask account
    async function requestAccount() {
        await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
    }

      // call the smart contract, read the current greeting value
    async function readBalance() {
        if (typeof (window as any).ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider((window as any).ethereum) as Web3Provider
        const signer = provider.getSigner()
        const contract = new ethers.Contract(metaCoinDeployedAddress, MetaCoin.abi, provider as Provider);
        try {
            const data = await contract.balanceOf(await signer.getAddress())
            console.log('data: ', data)
        } catch (err) {
            console.log("Error: ", err)
        }
        }    
    }

      // call the smart contract, send an update
    async function mintToken() {
        if (typeof (window as any).ethereum !== 'undefined') {
            await requestAccount()
            const provider = new ethers.providers.Web3Provider((window as any).ethereum);
            const signer = provider.getSigner()
            const contract = new ethers.Contract(metaCoinDeployedAddress, MetaCoin.abi, signer as Signer)
            const transaction = await contract.mint(100)
            await transaction.wait()
            readBalance();
        }
    }

    async function transferToken(address: string, amount: any) {
        if (typeof (window as any).ethereum !== 'undefined') {
            await requestAccount()
            const provider = new ethers.providers.Web3Provider((window as any).ethereum);
            const signer = provider.getSigner()
            const contract = new ethers.Contract(metaCoinDeployedAddress, MetaCoin.abi, signer as Signer)
            const transaction = await contract.transfer(address, amount)
            await transaction.wait()
        }
    }

    const [address, setaddress] = React.useState("");

    const handleChange = (event: any) => {    
        setaddress(event.target.value);  
    }
    const handleSubmit = (event: any) => {
      transferToken(address, 30)
      event.preventDefault();
    }

    return (<div>
        <button onClick={mintToken}>mint</button>
        <form onSubmit={handleSubmit}>
        <label>
          Receipient Address:
          <input type="text" value={address} onChange={handleChange} />        </label>
            <input type="submit" value="Submit" />
        </form>
    </div>)

    // const { active, account, library, connector, activate, deactivate } = useWeb3React();

    // async function connect() {
    //     try {
    //       await activate(injected)
    //       let contract = web3.eth.contract(metaCoinArtifact.abi).at(contract_address);

    //     } catch (ex) {
    //       console.log(ex)
    //     }
    //   }
    
    // async function disconnect() {
    // try {
    //     deactivate()
    // } catch (ex) {
    //     console.log(ex)
    // }
    // }

    // return (
    // <div>
    //     <p>{active ? "Connected" : "Not Connected"}</p>
    //     <p>{active ? account : ""}</p>
    //     <button onClick={active ? disconnect : connect}>{active ? "disconnect" : "connect"}</button>
    // </div>
    // );
}

export default Home;