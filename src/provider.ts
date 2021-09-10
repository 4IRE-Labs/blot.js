import { WsProvider, ApiPromise } from "@polkadot/api";
import { AccountId, Balance } from "@polkadot/types/interfaces";

export default class NetworkProvider {
  provider: WsProvider;
  api: ApiPromise;

  constructor(provider: WsProvider, api: ApiPromise) {
    this.provider = provider;
    this.api = api;
  }

  static async create(url: string): Promise<NetworkProvider> {
    const provider = new WsProvider(url);
    const api = await ApiPromise.create({ provider });
    return new NetworkProvider(provider, api);
  }

  async getBalance(address: string | AccountId | Uint8Array): Promise<Balance> {
    const account = await this.api.query.system.account(address);
    return account.data.free;
  }
}
