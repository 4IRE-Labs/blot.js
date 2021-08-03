# Docs for develop

## Environment require

- `POSIX` (bash, git, grep, cut, sort, etc)
- `Node.js` https://github.com/nvm-sh/nvm
- `yarn` https://yarnpkg.com/getting-started/install

## Work flow

Install deeps
```shell
yarn install
```

Run test
```shell
yarn qa
```

Build
```shell
yarn build
```

Down local near network and clean
```shell
yarn clean
```

## Release flow

```shell
yarn release
yarn package-publish
```
