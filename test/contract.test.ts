import { Keyring } from "@polkadot/api";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { readFileSync } from "fs";

import Blot from "../src/main";
import ContractFactory from "../src/contractFactory";
import Contract from "../src/contract";

chai.should();
chai.use(chaiAsPromised);

describe("Blot", function () {
  let factory: ContractFactory;

  beforeEach(async () => {
    const blot = await Blot.create("ws://127.0.0.1:9944");
    const keyring = new Keyring({ type: "sr25519" });
    const alice = keyring.addFromUri("//Alice");

    blot.setToolchainAccount(alice);

    const abi = JSON.parse(
      readFileSync("./test/resources/metadata.json").toString()
    );
    const wasm = readFileSync("./test/resources/counter.wasm");

    factory = blot.getContractFactory(abi, wasm);
  });

  const deploy = (): Promise<Contract> => {
    return factory.deploy([1], {
      weight: 10000000000000,
      value: 10000000000000,
    });
  };

  it("should return contract instance with address after deployment", async () => {
    const contract = await deploy();
    await contract.should.be.instanceOf(Contract);
    const address = contract.getAddress();
    (typeof address).should.be.eq("string");
    address.startsWith("5").should.be.true;
  });

  it("should be able to call a contract", async () => {
    const contract = await deploy();
    const value = await contract.get();
    value.toString().should.be.eq("1");
  });

  it("should be able to send a transaction to a contract and that should actually change state", async () => {
    const contract = await deploy();
    await contract.increment();
    const value = await contract.get();
    value.toString().should.be.eq("2");
  });
});
