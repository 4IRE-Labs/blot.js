import type { CodePromise, Abi } from '@polkadot/api-contract'
import type { Codec, CodecArg } from '@polkadot/types/types';
import { createTypeUnsafe } from '@polkadot/types';
import { Account } from './account'
import NetworkProvider from './provider'
import { AbiMessage } from '@polkadot/api-contract/types';
import { SubmittableResult } from '@polkadot/api';

export default class Contract {
  _provider: NetworkProvider
  _account: Account
  _abi: Abi
  _code: CodePromise
  _address: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [name: string]: any;

  constructor(provider: NetworkProvider, address: string, account: Account, code: CodePromise) {
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
      
      if (message.isMutating) {
        this[identifier] = this.constructSend(message)
      }
      else {
        this[identifier] = this.constructCall(message)
      }
    });
  }

  constructSend(message: AbiMessage): (...args: CodecArg[]) => Promise<string | null> {
    return async (...args: CodecArg[]): Promise<null> => {
      const encodedParams = message.toU8a(args);

      //TODO rework gas estimation technique
      const maximumBlockWeight = this._provider.api.consts.system.blockWeights.maxBlock;

      await new Promise((resolve, reject) => {
        this._provider.api.tx.contracts.call(
          this._address, 0, maximumBlockWeight, encodedParams
        ).signAndSend(this._account.getAddress(), {signer: this._account.getSigner()}, (result: SubmittableResult) => {
          if (result.status.isInBlock) {
            const successEvents = result.filterRecords('system', 'ExtrinsicSuccess');
            if (successEvents.length > 0) {
              resolve(null);
            }
  
            const failedEvent = result.filterRecords('system', 'ExtrinsicFailed');
            if (failedEvent.length > 0) {
              reject();
            }
          }
        })
      })

      return null;
    }
  }

  constructCall(message: AbiMessage): (...args: CodecArg[]) => Promise<Codec | null> {
    return async (...args: CodecArg[]): Promise<Codec | null> => {
      const encodedParams = message.toU8a(args);

      //TODO rework gas estimation technique
      const maximumBlockWeight = this._provider.api.consts.system.blockWeights.maxBlock;

      const { result } = await this._provider.api.rpc.contracts.call({
        origin: this._account.getAddress(),
        dest: this._address,
        gasLimit: maximumBlockWeight,
        inputData: encodedParams,
      });

      if (message.returnType) {
        return createTypeUnsafe(
          this._provider.api.registry, 
          message.returnType?.type, 
          [result.asOk.data.toU8a(true)],
          { isPedantic: true }
        )
      }

      return null;
    }
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

  getAddress(): string {
    return this._address
  }
}
