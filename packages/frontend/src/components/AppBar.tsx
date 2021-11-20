import "./AppBar.css";
import React from "react";
import Spacer from "./Spacer";
import { TabContext, TabValue } from "./Home";
import WalletStateManager from "../utils/WalletStateManager";
import ContractInteractor from "../utils/ContractInteractor";
import { CopyToClipboard } from "react-copy-to-clipboard";
import {
  ContractAddressManager,
  contractToken,
  Paymasters,
} from "../utils/ContractAddresses";

const AppBar = () => {
  const tabContext = React.useContext(TabContext);
  const [walletBalance, setWalletBalance] = React.useState<number | null>(null);

  React.useEffect(() => {
    checkWalletBalance();
  });

  const checkWalletBalance = async () => {
    const { enabled } = await WalletStateManager.getInstance().getWalletState();
    if (enabled) {
      const balance = await ContractInteractor.getInstance().getTokenBalance();
      console.log(balance);
      setWalletBalance(balance);
    } else {
      tabContext.setTabValue(TabValue.walletNotFound);
    }
  };

  return (
    <div className="appbar">
      {/* <img
        className="logo"
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Uniswap_Logo.svg/1026px-Uniswap_Logo.svg.png"
        alt="logo"
      /> */}
      <CopyToClipboard text={contractToken.address}>
        <button
          className="button"
          style={{
            justifySelf: "end",
            backgroundColor: "green",
            marginLeft: "16px",
          }}
          onClick={() => {}}
        >
          {"Copy Token Address"}
        </button>
      </CopyToClipboard>
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
        <button
          className={
            tabContext.tabValue === TabValue.selectPaymaster
              ? "tabbar-button-selected"
              : "tabbar-button"
          }
          onClick={() => tabContext.setTabValue(TabValue.selectPaymaster)}
        >
          {ContractAddressManager.getInstance().getContractPaymaster() ===
          Paymasters.tokenPaymaster
            ? "Using Token Paymaster"
            : "Using Whitelist Paymaster"}
        </button>
      </div>
      <Spacer />

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
