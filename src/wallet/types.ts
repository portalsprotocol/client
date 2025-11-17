import { Keypair, PublicKey } from '@solana/web3.js';
import { NetworkCluster } from '../constants/network';

export interface WalletConfig {
  network: NetworkCluster;
  rpcUrl?: string;
}

export interface WalletBalance {
  sol: number;
  usdc: number;
}

export interface CreateWalletOptions {
  walletPath: string;
  network?: NetworkCluster;
  rpcUrl?: string;
}

export interface LoadWalletOptions {
  walletPath: string;
  network?: NetworkCluster;
  rpcUrl?: string;
}

