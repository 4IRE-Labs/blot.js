import { AnyJson } from "@polkadot/types/types";

import Interactor from "./interactor";
import NetworkProvider from "./provider";
import { ApiPromise, WsProvider } from "@polkadot/api";
import ContractFactory from "./contractFactory";
import { Account } from "./account";

export default class Blot {
  provider: NetworkProvider;
  account: Account | undefined;

  constructor(provider: NetworkProvider) {
    this.provider = provider;
  }

  static async constructProvider(url: string) {
    const innerProvider = new WsProvider(url);
    const api = await ApiPromise.create({ provider: innerProvider });
    return new NetworkProvider(innerProvider, api);
  }

  async getInteractor(): Promise<Interactor> {
    this.assertAccount();
    return new Interactor(this.provider, this.account as Account);
  }

  getContractFactory(abi: AnyJson, wasm: string | Buffer) {
    this.assertAccount();
    return new ContractFactory(
      this.provider,
      this.account as Account,
      abi,
      wasm
    );
  }

  assertAccount() {
    if (!this.account) {
      throw Error("Account is not initialized");
    }
  }
}
