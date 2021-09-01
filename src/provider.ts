import { WsProvider, ApiPromise } from '@polkadot/api'
import { AccountId, Balance } from '@polkadot/types/interfaces'

export default class NetworkProvider {
  provider: WsProvider
  api: ApiPromise

  constructor (url: string) {
    this.provider = new WsProvider(url)
    this.api = new ApiPromise()
  }

  async connect (): Promise<this> {
    this.api = await ApiPromise.create({ provider: this.provider })
    return this
  }

  async getBalance (address: string | AccountId | Uint8Array): Promise<Balance> {
    const account = await this.api.query.system.account(address)
    return account.data.free
  }

  getApi (): ApiPromise {
    return this.api
  }
}
