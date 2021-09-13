import { Keyring } from "@polkadot/api";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

import Blot from "../src/main";
import NetworkProvider from "../src/provider";
import Interactor from "../src/interactor";

chai.should();
chai.use(chaiAsPromised);

describe("Blot", function () {
  it("should contain provider after initialization", async () => {
    const blot = await Blot.create("ws://127.0.0.1:9944");
    blot.provider.should.be.instanceOf(NetworkProvider);
  });

  it("should fail to get interactor without account", async () => {
    const blot = await Blot.create("ws://127.0.0.1:9944");
    blot.getInteractor().should.be.rejectedWith("asf");
  });

  it("should have interactor after account is set", async () => {
    const blot = await Blot.create("ws://127.0.0.1:9944");

    const keyring = new Keyring({ type: "sr25519" });
    const alice = keyring.addFromUri("//Alice");

    blot.setToolchainAccount(alice);
    blot.getInteractor().should.be.eventually.instanceOf(Interactor);
  });
});
