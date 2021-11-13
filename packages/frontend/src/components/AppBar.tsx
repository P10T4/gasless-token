import "./AppBar.css";
import React from "react";
import Spacer from "./Spacer";
import { TabContext, TabValue } from "./Home";
import WalletStateManager from "../utils/WalletStateManager";
import ContractInteractor from "../utils/ContractInteractor";
import { CopyToClipboard } from "react-copy-to-clipboard";
import testToken from "../contractdeployments/localhost/TestToken.json";

const AppBar = () => {
  const tabContext = React.useContext(TabContext);
  const [walletBalance, setWalletBalance] = React.useState(null);

  React.useEffect(() => {
    checkWalletBalance();
  });

  const checkWalletBalance = async () => {
    const { enabled } = await WalletStateManager.getInstance().getWalletState();
    if (enabled) {
      const balance = await ContractInteractor.getInstance().getTokenBalance();
      setWalletBalance(balance);
    } else {
      tabContext.setTabValue(TabValue.walletNotFound);
    }
  };

  return (
    <div className="appbar">
      <img
        className="logo"
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Uniswap_Logo.svg/1026px-Uniswap_Logo.svg.png"
        alt="logo"
      />
      <Spacer />
      <div className="tabbar">
        <button
          className={
            tabContext.tabValue === TabValue.transfer
              ? "tabbar-button-selected"
              : "tabbar-button"
          }
          onClick={() => tabContext.setTabValue(TabValue.transfer)}
        >
          Transfer
        </button>
        <button
          className={
            tabContext.tabValue === TabValue.mint
              ? "tabbar-button-selected"
              : "tabbar-button"
          }
          onClick={() => tabContext.setTabValue(TabValue.mint)}
        >
          Mint
        </button>
      </div>
      <Spacer />
      <CopyToClipboard text={testToken.address}>
        <button
          className="button"
          style={{ justifySelf: "end", backgroundColor: "green" }}
          onClick={() => {}}
        >
          {"Copy Token Address"}
        </button>
      </CopyToClipboard>

      <button
        className="button"
        style={{ justifySelf: "end" }}
        onClick={
          walletBalance != null ? () => {} : () => window.location.reload()
        }
      >
        {walletBalance != null ? `Balance: ${walletBalance}` : "Connect Wallet"}
      </button>
    </div>
  );
};

export default AppBar;
