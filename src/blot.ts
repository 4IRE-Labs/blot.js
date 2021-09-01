import {
  web3Enable,
  web3Accounts,
} from '@polkadot/extension-dapp'
import {
  InjectedExtension,
  InjectedAccountWithMeta
} from '@polkadot/extension-inject/types'

import Account from './account'
import Interactor from './interactor'
import NetworkProvider from './provider'

export default class Blot {
  extensions: InjectedExtension[]
  provider: NetworkProvider

  constructor (provider: NetworkProvider) {
    this.extensions = []
    this.provider = provider
  }

  async enable (dappName: string): Promise<void> {
    const beforeEnableTime = Date.now()
    this.extensions = await web3Enable(dappName)
    const afterEnableTime = Date.now()

    if (this.extensions.length === 0) {
      // TRICK: refactoring web3Enable to handle errors correctly is needed
      if (afterEnableTime - beforeEnableTime >= 1000) {
        throw new Error('request rejected by user')
      }
      throw new Error('no extension installed or this page is not allowed to interact with installed extension')
    }
  }

  async getAccounts (): Promise<InjectedAccountWithMeta[]> {
    return web3Accounts()
  }

  async getInteractor (accountIndex: number): Promise<Interactor> {
    const accounts = await web3Accounts()
    const account = new Account(accounts[accountIndex])

    return new Interactor(this.provider, account)
  }
}
