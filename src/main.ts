import type { KeyringPair } from "@polkadot/keyring/types";

import ToolchainAccount from "./account/toolchainAccount";
import Blot from "./blot";

export default class NodeBlot extends Blot {
  static async create(url: string) {
    const provider = await Blot.constructProvider(url);
    return new NodeBlot(provider);
  }

  setToolchainAccount(keyringPair: KeyringPair) {
    this.account = new ToolchainAccount(
      this.provider.api.registry,
      keyringPair
    );
  }
}
