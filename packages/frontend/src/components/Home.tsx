import React from 'react';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector'

export const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42, 1337],
})

const Home = () => {

    const { active, account, library, connector, activate, deactivate } = useWeb3React();

    async function connect() {
        try {
          await activate(injected)
        } catch (ex) {
          console.log(ex)
        }
      }
    
    async function disconnect() {
    try {
        deactivate()
    } catch (ex) {
        console.log(ex)
    }
    }

    return (
    <div>
        <p>{active ? "Connected" : "Not Connected"}</p>
        <p>{active ? account : ""}</p>
        <button onClick={active ? disconnect : connect}>{active ? "disconnect" : "connect"}</button>
    </div>
    );
}

export default Home;