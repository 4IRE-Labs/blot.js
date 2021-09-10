import { Signer } from "@polkadot/api/types";

export interface Account {
  getAddress(): string;
  getSigner(): Signer;
}
