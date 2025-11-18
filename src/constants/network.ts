import { PublicKey } from '@solana/web3.js';

export type NetworkCluster = 'devnet' | 'mainnet-beta';

export const DEFAULT_NETWORK: NetworkCluster = 'mainnet-beta';

export const RPC_ENDPOINTS: Record<NetworkCluster, string> = {
  'devnet': 'https://api.devnet.solana.com',
  'mainnet-beta': 'https://api.mainnet-beta.solana.com',
};

export const USDC_MINT: Record<NetworkCluster, PublicKey> = {
  'devnet': new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'),
  'mainnet-beta': new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
};

export const REGISTRY_PROGRAM_ID: Record<NetworkCluster, PublicKey> = {
  'devnet': new PublicKey('CYWVLuztYg7XX3nRNGiF7JRrcAy6to4BZgQ3PgpbbJ8C'),
  'mainnet-beta': new PublicKey('CYWVLuztYg7XX3nRNGiF7JRrcAy6to4BZgQ3PgpbbJ8C'),
};

export const PORTALS_MINT: Record<NetworkCluster, PublicKey> = {
  'devnet': new PublicKey('7TY587cEWBcHtN5wpaJS7JabZLPLt2Ever76sTM8mNKG'),
  'mainnet-beta': new PublicKey('4ToEhsZQNThpMcsXxDY4fGFUc28LrCe7HeuiRRCGBAGS'),
};

export const REGISTRY_ACCOUNT: Record<NetworkCluster, PublicKey> = {
  'devnet': new PublicKey('43CczJDbDnuCuU7NbD8VqQEcxEiQcXWN4HhqbBF68r8N'),
  'mainnet-beta': new PublicKey('3HL31uTgncGMmN2EkjCvPnsyvA3gCaLhwQSPRWo4i8Gr'),
};

export const USDC_DECIMALS = 6;

export interface NetworkConfig {
  rpcEndpoint: string;
  usdcMint: PublicKey;
  registryProgramId: PublicKey;
  portalsMint: PublicKey;
  registryAccount: PublicKey;
  usdcDecimals: number;
}

export function getConfig(network?: NetworkCluster): NetworkConfig {
  const net = network || DEFAULT_NETWORK;
  return {
    rpcEndpoint: RPC_ENDPOINTS[net],
    usdcMint: USDC_MINT[net],
    registryProgramId: REGISTRY_PROGRAM_ID[net],
    portalsMint: PORTALS_MINT[net],
    registryAccount: REGISTRY_ACCOUNT[net],
    usdcDecimals: USDC_DECIMALS,
  };
}

