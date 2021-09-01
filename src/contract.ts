import { ContractPromise, CodePromise, Abi } from '@polkadot/api-contract'
import { ContractOptions } from '@polkadot/api-contract/types'
import { AccountId, EventRecord, ExtrinsicStatus } from '@polkadot/types/interfaces'
import { AnyJson, CodecArg } from '@polkadot/types/types'
import Account from './account'
import NetworkProvider from './provider'

class ERC20 {
  contract: ContractPromise
  options: ContractOptions

  constructor (provider: NetworkProvider, abi: AnyJson | Abi, address: string | AccountId) {
    this.contract = new ContractPromise(provider.getApi(), abi, address)
    this.options = {
      value: 0,
      gasLimit: "300000000000"
    }
  }

  async tokenName () {
    const { result } = await this.contract.query['iErc20,tokenName']('', this.options)
    return result.asOk.data.toUtf8()
  }

  async tokenSymbol () {
    const { result } = await this.contract.query['iErc20,tokenSymbol']('', this.options)
    return result.asOk.data.toUtf8()
  }
}

export default class Contract {
  provider: NetworkProvider
  account: Account
  abi: Abi
  code: CodePromise
  address: string | undefined

  constructor (provider: NetworkProvider, account: Account, dotContract: {source: {wasm: string}}) {
    this.provider = provider
    this.account = account
    const api = this.provider.getApi()
    const wasm = dotContract.source.wasm
    this.abi = new Abi(dotContract, api.registry.getChainProperties())
    this.code = new CodePromise(api, this.abi, wasm)
  }

  async deploy (params: CodecArg[], { weight, value }: {weight: number, value: number}, handler: (params: { events: EventRecord[]; status: ExtrinsicStatus }) => void): Promise<() => void> {
    const address = this.account.getAddress()
    const signer = await this.account.getSigner()
    return this.code.tx[this.abi.constructors[0].method]({
      gasLimit: weight,
      value
    }, ...params).signAndSend(address, { signer }, ({ events = [], status }) => {
      if (status.isInBlock) {
        events.forEach(({ event: { data, method, section } }) => {
          if (section === 'contracts' && method === 'ContractEmitted') {
            this.address = data[0].toHuman() as string
          }
        })
      }
      if (handler) {
        handler({ events, status })
      }
    })
  }

  getAddress (): string | undefined {
    return this.address
  }

  assumeERC20 (): ERC20 {
    if (!this.address) {
      throw 'No address'
    }
    return new ERC20(this.provider, this.abi, this.address)
  }

  async call (): Promise<void> {
    if (!this.address) {
      throw 'No address'
    }

    const api = this.provider.getApi()
    const contract = new ContractPromise(api, this.abi, this.address)
    const value = 0
    const gasLimit = "300000000000"
    const { gasConsumed, result } = await contract.query['iErc20,tokenName']('', { gasLimit, value })

    console.log(result.toHuman())

    console.log(gasConsumed.toHuman())
  }
}
