import type { Signer } from '@polkadot/api/types'
import type { KeyringPair } from '@polkadot/keyring/types';
import type { Registry, SignerPayloadJSON, SignerPayloadRaw, SignerResult } from '@polkadot/types/types';
import { assert, hexToU8a, u8aToHex } from '@polkadot/util';
import { Account } from '.'

export default class ToolchainAccount implements Account {
  address: string
  signer: Signer

  constructor(registry: Registry, keyringPair: KeyringPair) {
    this.address = keyringPair.address
    this.signer = new SingleAccountSigner(registry, keyringPair)
  }

  getAddress(): string {
    return this.address
  }

  getSigner(): Signer {
    return this.signer
  }
}

let id = 0;

class SingleAccountSigner implements Signer {
  readonly keyringPair: KeyringPair;
  readonly registry: Registry;
  readonly signDelay: number;

  constructor(registry: Registry, keyringPair: KeyringPair, signDelay = 0) {
    this.keyringPair = keyringPair;
    this.registry = registry;
    this.signDelay = signDelay;
  }

  public async signPayload(payload: SignerPayloadJSON): Promise<SignerResult> {
    assert(payload.address === this.keyringPair.address, 'Signer does not have the keyringPair');

    return new Promise((resolve): void => {
      setTimeout((): void => {
        const signed = this.registry.createType('ExtrinsicPayload', payload, { version: payload.version }).sign(this.keyringPair);

        resolve({
          id: ++id,
          ...signed
        });
      }, this.signDelay);
    });
  }

  public async signRaw({ address, data }: SignerPayloadRaw): Promise<SignerResult> {
    assert(address === this.keyringPair.address, 'Signer does not have the keyringPair');

    return new Promise((resolve): void => {
      setTimeout((): void => {
        const signature = u8aToHex(this.keyringPair.sign(hexToU8a(data)));

        resolve({
          id: ++id,
          signature
        });
      }, this.signDelay);
    });
  }
}