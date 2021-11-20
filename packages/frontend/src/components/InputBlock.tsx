import React from "react";
import { ContractAddressManager, Paymasters } from "../utils/ContractAddresses";
import ContractInteractor from "../utils/ContractInteractor";
import "./InputBlock.css";

export const InputTransferBlock = () => {
  const [amount, setAmoount] = React.useState("");
  const [address, setAddress] = React.useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await ContractInteractor.getInstance().transferTokenWithPermit(
        address,
        parseFloat(amount)
      );
      alert(`You have transfered ${amount} token to ${address} successfully!`);
    } catch (error) {
      alert(error);
    }

    window.location.reload();
  };

  return (
    <div className="main">
      <p className="heading">Transfer</p>
      <form onSubmit={handleSubmit}>
        <div className="field-container">
          <input
            className="input-field"
            type="text"
            name="amount"
            value={amount}
            onChange={(e) => setAmoount(e.target.value)}
            placeholder="Enter amount"
          />
        </div>
        <div className="field-container">
          <input
            className="input-field"
            type="text"
            name="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Recipient Address"
          />
        </div>
        <button className="input-button">Transfer</button>
      </form>
    </div>
  );
};

export const InputMintBlock = () => {
  const [amount, setAmoount] = React.useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await ContractInteractor.getInstance().mintToken(parseInt(amount));
      alert(`You have minted ${amount} token successfully!`);
    } catch (error) {
      alert(error);
    }

    window.location.reload();
  };
  return (
    <div className="main">
      <p className="heading">Mint (only for demo purposes)</p>
      <form onSubmit={handleSubmit}>
        <div className="field-container">
          <input
            className="input-field"
            type="text"
            name="amount"
            value={amount}
            onChange={(e) => setAmoount(e.target.value)}
            placeholder="Enter amount"
          />
        </div>
        <button className="input-button">Mint</button>
      </form>
    </div>
  );
};

export const InputPlaceholderBlock = () => {
  return (
    <div className="main">
      <p className="heading">Connect Wallet to continue</p>
      <div className="field-container"></div>
      <div className="field-container"></div>
      <button className="input-button"></button>
    </div>
  );
};

export const InputPaymasterSelectorBlock = () => {
  const [ignored, forceUpdate] = React.useReducer((x) => x + 1, 0);
  return (
    <div className="main">
      <p className="heading">Select Paymaster (only for demo purposes)</p>
      <button
        className={
          ContractAddressManager.getInstance().getContractPaymaster() ===
          Paymasters.whitelistPaymaster
            ? "input-button"
            : "input-button-dim"
        }
        onClick={() => {
          ContractAddressManager.getInstance().setPaymaster(
            Paymasters.whitelistPaymaster
          );
          forceUpdate();
        }}
      >{`Whitelist Paymaster ${
        ContractAddressManager.getInstance().getContractPaymaster() ===
        Paymasters.whitelistPaymaster
          ? `✅ `
          : ""
      }`}</button>
      <button
        className={
          ContractAddressManager.getInstance().getContractPaymaster() ===
          Paymasters.tokenPaymaster
            ? "input-button"
            : "input-button-dim"
        }
        onClick={() => {
          ContractAddressManager.getInstance().setPaymaster(
            Paymasters.tokenPaymaster
          );
          forceUpdate();
        }}
      >{`Token Paymaster ${
        ContractAddressManager.getInstance().getContractPaymaster() ===
        Paymasters.tokenPaymaster
          ? `✅ `
          : ""
      } `}</button>
    </div>
  );
};
