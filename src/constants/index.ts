import { StaticTokenListResolutionStrategy, TokenInfo } from "@solana/spl-token-registry";

const tokenMapOriginal = new StaticTokenListResolutionStrategy().resolve();
export const tokenMap: TokenInfo[] = Array.from(tokenMapOriginal).concat([
  {
    chainId: 103,
    address: '9NGDi2tZtNmCCp8SVLKNuGjuWAVwNF3Vap5tT8km5er9',
    name: 'Devnet USD Tether',
    decimals: 9,
    symbol: 'USDT',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg',
    tags: undefined,
    extensions: undefined,
  },
  {
    chainId: 103,
    address: 'zVzi5VAf4qMEwzv7NXECVx5v2pQ7xnqVVjCXZwS9XzA',
    name: 'Devnet USD Coin',
    decimals: 6,
    symbol: 'USDC',
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
    tags: undefined,
    extensions: undefined,
  }
])