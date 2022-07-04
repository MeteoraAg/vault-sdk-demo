# Mercurial Finance Vault SDK Demo

## Getting started
1. `pnpm i`
2. `pnpm run dev`

## Demo
https://vault-sdk-demo.vercel.app/

## Docs
https://docs.mercurial.finance/mercurial-dynamic-yield-infra/

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
