import React from 'react';
import './App.css';
import Web3 from 'web3';
import { Web3ReactProvider } from '@web3-react/core'
import Home from './components/Home';

function getLibrary(provider: any) {
  return new Web3(provider)
}

function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Home />
    </Web3ReactProvider>
  );
}

export default App;
