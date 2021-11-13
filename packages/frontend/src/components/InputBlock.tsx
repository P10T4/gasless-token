import React from "react";
import ContractInteractor from "../utils/ContractInteractor";
import "./InputBlock.css";

export const InputTransferBlock = () => {
  const [amount, setAmoount] = React.useState("");
  const [address, setAddress] = React.useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await ContractInteractor.getInstance().transferTokenSignEverytime(
      address,
      parseInt(amount)
    );
    alert(`You have transfered ${amount} token to ${address} successfully!`);
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
    await ContractInteractor.getInstance().mintToken(parseInt(amount));
    alert(`You have minted ${amount} token successfully!`);
    window.location.reload();
  };
  return (
    <div className="main">
      <p className="heading">Mint</p>
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
