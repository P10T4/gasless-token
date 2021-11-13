import React from "react";
import AppBar from "./AppBar";
import {
  InputMintBlock,
  InputTransferBlock,
  InputPlaceholderBlock,
} from "./InputBlock";
import "./Home.css";

export enum TabValue {
  transfer,
  mint,
  walletNotFound,
}

export const TabContext = React.createContext({
  tabValue: TabValue.transfer,
  setTabValue: (tabValue: TabValue) => {},
});

const Home = () => {
  const [tabValue, setTabValue] = React.useState(TabValue.transfer);

  return (
    <div>
      <TabContext.Provider value={{ tabValue, setTabValue }}>
        <HomeComponents />
      </TabContext.Provider>
    </div>
  );
};

const HomeComponents = () => {
  const tabContext = React.useContext(TabContext);

  return (
    <div>
      <AppBar />
      <div className="home">
        {tabContext.tabValue === TabValue.transfer ? (
          <InputTransferBlock />
        ) : tabContext.tabValue === TabValue.mint ? (
          <InputMintBlock />
        ) : (
          <InputPlaceholderBlock />
        )}
      </div>
    </div>
  );
};

export default Home;
