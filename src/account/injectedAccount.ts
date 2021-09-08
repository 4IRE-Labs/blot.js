import { Signer } from '@polkadot/api/types'
import { web3FromSource } from '@polkadot/extension-dapp'
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types'
import { Account } from '.'

export default class InjectedAccount implements Account {
  address: string
  signer: Signer

  constructor (address: string, signer: Signer) {
    this.address = address
    this.signer = signer
  }

  static async create(nativeAccount: InjectedAccountWithMeta): Promise<InjectedAccount> {
    const injector = await web3FromSource(nativeAccount.meta.source)
    return new InjectedAccount(nativeAccount.address, injector.signer)
  }

  getAddress (): string {
    return this.address
  }

  getSigner (): Signer {
    return this.signer
  }
}
