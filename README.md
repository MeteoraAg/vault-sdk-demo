# Mercurial Finance Vault SDK Demo

<p align="center">
<img align="center" src="https://vaults.mercurial.finance/icons/logo.svg" width="180" height="180" />
</p>
<br>

## Getting started
This is the easiest way to get started with our Typescript SDK, the example demo includes all functionality and information we display on our own site.

NPM: https://www.npmjs.com/package/@mercurial-finance/vault-sdk

SDK: https://github.com/mercurial-finance/vault-sdk

Demo: https://vault-sdk-demo.vercel.app/

Demo repo: https://github.com/mercurial-finance/vault-sdk-demo
- Easiest way to get started with our Typescript SDK, the example demo includes all functionality and information we display on our own site.

Node Demo repo: https://github.com/mercurial-finance/vault-sdk-node-demo

Docs: https://docs.mercurial.finance/mercurial-dynamic-yield-infra/

Discord: https://discord.com/channels/841152225564950528/864859354335412224

<hr>

## Install & Run

1. `pnpm i`
2. `pnpm run dev`


## FAQ

- Module not found: Can't resolve 'fs'
  Due to our dependency `@project-serum/anchor` requiring `fs`, which is not available on frontend.
  With NextJS, this can be fixed by providing a fallback of `fs` from `next.config.js`

```
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

    return config;
  },
}

module.exports = nextConfig
```
