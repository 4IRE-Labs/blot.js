import { Signer } from '@polkadot/api/types'
import { web3FromSource } from '@polkadot/extension-dapp'
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types'

export default class Account {
  account: InjectedAccountWithMeta

  constructor (nativeAccount: InjectedAccountWithMeta) {
    this.account = nativeAccount
  }

  getAddress (): string {
    return this.account.address
  }

  async getSigner (): Promise<Signer> {
    const injector = await web3FromSource(this.account.meta.source)
    return injector.signer
  }
}
