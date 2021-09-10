#!/usr/bin/env node
import { Keyring } from '@polkadot/keyring';
import { readFileSync } from 'fs';
import {NetworkProvider, ContractFactory, ToolchainAccount} from './main'

const main = async () => {
    const provider = await NetworkProvider.create('ws://127.0.0.1:9944');
    const abi = JSON.parse(readFileSync('examples/contract_creation/src/metadata.json').toString());
    const wasm = readFileSync('examples/contract_creation/src/counter.wasm');
    const keyring = new Keyring({ type: 'sr25519' })
    const alice = keyring.addFromUri('//Alice')
    const account = new ToolchainAccount(provider.api.registry, alice);
    const factory = new ContractFactory(provider, account, abi, wasm);
    const contract = await factory.deploy([1, 3], {weight: 10000000000000, value: 10000000000000})

    console.log((await contract.get()).toString());
    await contract.increment();
    console.log((await contract.get()).toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });