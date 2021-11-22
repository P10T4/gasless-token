export var contractToken = require('../contractdeployments/localhost/TestToken.json');
export var contractRelayRecipient = require('../contractdeployments/localhost/RelayRecipient.json');
export var contractTokenPaymaster = require('../contractdeployments/localhost/TokenPaymaster.json');
export var contractWhitelistPaymaster = require('../contractdeployments/localhost/WhitelistPaymaster.json');
export var contractPaymaster = contractWhitelistPaymaster;

export class Paymasters {
  static whitelistPaymaster = contractWhitelistPaymaster;
  static tokenPaymaster = contractTokenPaymaster;
}
export class ContractAddressManager {
  private static instance: ContractAddressManager;

  private constructor() {}

  public static getInstance(): ContractAddressManager {
    if (!ContractAddressManager.instance) {
      ContractAddressManager.instance = new ContractAddressManager();
    }
    return ContractAddressManager.instance;
  }

  getContractPaymaster() {
    return contractPaymaster;
  }

  setPaymaster(newPaymaster: Paymasters) {
    contractPaymaster = newPaymaster;
  }
}
