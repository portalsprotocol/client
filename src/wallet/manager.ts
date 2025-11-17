import { Keypair, Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAccount, getAssociatedTokenAddress } from '@solana/spl-token';
import * as fs from 'fs';
import * as path from 'path';
import { WalletConfig, WalletBalance } from './types';
import { RPC_ENDPOINTS, USDC_MINT, USDC_DECIMALS, DEFAULT_NETWORK } from '../constants/network';
import { WalletError } from '../types/errors';
import { fromLamports } from '../helpers/token';

export class WalletManager {
  private keypair: Keypair;
  private connection: Connection;
  private network: WalletConfig['network'];

  constructor(keypair: Keypair, config: WalletConfig) {
    this.keypair = keypair;
    this.network = config.network || DEFAULT_NETWORK;
    const rpcUrl = config.rpcUrl || RPC_ENDPOINTS[this.network];
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  static createNew(walletPath: string, config: Partial<WalletConfig> = {}): WalletManager {
    const keypair = Keypair.generate();
    
    const dir = path.dirname(walletPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const secretKeyArray = Array.from(keypair.secretKey);
    fs.writeFileSync(walletPath, JSON.stringify(secretKeyArray), { mode: 0o600 });

    return new WalletManager(keypair, config as WalletConfig);
  }

  static fromFile(walletPath: string, config: Partial<WalletConfig> = {}): WalletManager {
    if (!fs.existsSync(walletPath)) {
      throw new WalletError(`Wallet file not found: ${walletPath}`);
    }

    const data = fs.readFileSync(walletPath, 'utf-8');
    const secretKey = new Uint8Array(JSON.parse(data));
    const keypair = Keypair.fromSecretKey(secretKey);

    return new WalletManager(keypair, config as WalletConfig);
  }

  static fromKeypair(keypair: Keypair, config: Partial<WalletConfig> = {}): WalletManager {
    return new WalletManager(keypair, config as WalletConfig);
  }

  getAddress(): PublicKey {
    return this.keypair.publicKey;
  }

  getKeypair(): Keypair {
    return this.keypair;
  }

  getConnection(): Connection {
    return this.connection;
  }

  getNetwork(): WalletConfig['network'] {
    return this.network;
  }

  async getSolBalance(): Promise<number> {
    const balance = await this.connection.getBalance(this.keypair.publicKey);
    return balance / LAMPORTS_PER_SOL;
  }

  async getUsdcBalance(): Promise<number> {
    try {
      const usdcMint = USDC_MINT[this.network];
      const ata = await getAssociatedTokenAddress(
        usdcMint,
        this.keypair.publicKey
      );

      const account = await getAccount(this.connection, ata);
      return fromLamports(account.amount, USDC_DECIMALS);
    } catch (error) {
      return 0;
    }
  }

  async getBalance(): Promise<WalletBalance> {
    const [sol, usdc] = await Promise.all([
      this.getSolBalance(),
      this.getUsdcBalance(),
    ]);

    return { sol, usdc };
  }
}

