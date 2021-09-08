import { CodePromise, Abi } from '@polkadot/api-contract'
import { Account } from './account'
import NetworkProvider from './provider'

export default class Contract {
  _provider: NetworkProvider
  _account: Account
  _abi: Abi
  _code: CodePromise
  _address: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [name: string]: any;

  constructor (provider: NetworkProvider, address: string, account: Account, code: CodePromise) {
    this._provider = provider
    this._address = address
    this._account = account
    this._code = code
    this._abi = this._code.abi

    this.populateAbiMethods();
  }

  populateAbiMethods(): void {
    const existingProperties = this.getAllPropertyNames();
    this._abi.messages.forEach(message => {
      const identifier = message.identifier;
      if (existingProperties.includes(identifier)) {
        return;
      }

      this[identifier] = () => console.log(identifier);
    });
  }

  getAllPropertyNames(): string[] {
    const result = new Set<string>();
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let obj = this;
    while (obj) {
        Object.getOwnPropertyNames(obj).forEach(p => result.add(p));
        obj = Object.getPrototypeOf(obj);
    }
    return [...result];
  }

  getAddress (): string {
    return this._address
  }
}
