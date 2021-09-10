import { ISubmittableResult } from "@polkadot/types/types";
import { Balance } from "@polkadot/types/interfaces";
import { Account } from "./account";
import NetworkProvider from "./provider";

export default class Interactor {
  provider: NetworkProvider;
  account: Account;

  constructor(provider: NetworkProvider, account: Account) {
    this.provider = provider;
    this.account = account;
  }

  async transfer(
    recipientAddress: string,
    value: number,
    callback: (result: ISubmittableResult) => void
  ): Promise<() => void> {
    const address = this.account.getAddress();
    const signer = await this.account.getSigner();
    const api = this.provider.api;
    return api.tx.balances
      .transfer(recipientAddress, value)
      .signAndSend(address, { signer }, callback);
  }

  async getBalance(): Promise<Balance> {
    return this.provider.getBalance(this.account.getAddress());
  }

  getAddress(): string {
    return this.account.getAddress();
  }
}
