import { SubmittableResult } from "@polkadot/api";
import type { AccountId } from "@polkadot/types/interfaces/types";
import { CodePromise, Abi } from "@polkadot/api-contract";
import { AnyJson, CodecArg } from "@polkadot/types/types";

import { Account } from "./account";
import Contract from "./contract";
import NetworkProvider from "./provider";

export default class ContractFactory {
  private provider: NetworkProvider;
  account: Account;
  abi: Abi;
  code: CodePromise;

  constructor(
    provider: NetworkProvider,
    account: Account,
    abi: AnyJson,
    wasm: string | Buffer
  ) {
    this.provider = provider;
    this.account = account;
    const api = this.provider.api;
    this.abi = new Abi(abi, api.registry.getChainProperties());
    this.code = new CodePromise(api, this.abi, wasm);
  }

  async deploy(
    params: CodecArg[],
    { weight, value }: { weight: number; value: number }
  ): Promise<Contract> {
    const address = this.account.getAddress();
    const signer = await this.account.getSigner();
    const constructor = this.abi.constructors[0].method;
    const unsignedTransaction = this.code.tx[constructor](
      {
        gasLimit: weight,
        value,
      },
      ...params
    );

    return new Promise((resolve, reject) => {
      const transactionCallback = (result: SubmittableResult) => {
        if (result.status.isInBlock) {
          const successEvents = result.filterRecords(
            "system",
            "ExtrinsicSuccess"
          );
          if (successEvents.length > 0) {
            const instantiateEvents = result.filterRecords(
              "contracts",
              "Instantiated"
            );
            const lastInstantiatedEvent =
              instantiateEvents[instantiateEvents.length - 1];
            const account = lastInstantiatedEvent.event.data[1] as AccountId;
            const contract = new Contract(
              this.provider,
              account.toHuman(),
              this.account,
              this.code
            );
            resolve(contract);
          }

          const failedEvents = result.filterRecords(
            "system",
            "ExtrinsicFailed"
          );
          if (failedEvents.length > 0) {
            const error = failedEvents[0].event.data[0].toHuman();
            reject(error);
          }
        }
      };

      unsignedTransaction.signAndSend(address, { signer }, transactionCallback);
    });
  }
}
