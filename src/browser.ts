import { web3Enable, web3Accounts } from "@polkadot/extension-dapp";
import {
  InjectedExtension,
  InjectedAccountWithMeta,
} from "@polkadot/extension-inject/types";

import NetworkProvider from "./provider";
import InjectedAccount from "./account/injectedAccount";
import Blot from "./blot";

export default class BrowserBlot extends Blot {
  extensions: InjectedExtension[];

  constructor(provider: NetworkProvider) {
    super(provider);
    this.extensions = [];
  }

  static async create(url: string) {
    const provider = await Blot.constructProvider(url);
    return new BrowserBlot(provider);
  }

  async enable(dappName: string): Promise<void> {
    const beforeEnableTime = Date.now();
    this.extensions = await web3Enable(dappName);
    const afterEnableTime = Date.now();

    if (this.extensions.length === 0) {
      // TRICK: refactoring web3Enable to handle errors correctly is needed
      if (afterEnableTime - beforeEnableTime >= 1000) {
        throw new Error("request rejected by user");
      }
      throw new Error(
        "no extension installed or this page is not allowed to interact with installed extension"
      );
    }
  }

  async getAccounts(): Promise<InjectedAccountWithMeta[]> {
    return web3Accounts();
  }

  async setAccount(accountIndex: number) {
    const accounts = await web3Accounts();
    this.account = await InjectedAccount.create(accounts[accountIndex]);
  }
}
