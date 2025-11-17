import { Keypair, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { WalletManager } from './wallet/manager';
import { WalletConfig, CreateWalletOptions, LoadWalletOptions } from './wallet/types';
import { RegistryClient } from './registry/client';
import { USDCPayment } from './payment/usdc';
import { PaymentVerifier } from './payment/verify';
import { PaymentValidator } from './payment/validate';
import { X402Client } from './x402/client';
import { APIEntry } from './registry/types';
import { NetworkCluster, USDC_MINT, DEFAULT_NETWORK } from './constants/network';
import { extractToolsFromSchema } from './x402/schema';
import { PricingMismatch } from './types/errors';

export class PortalsClient {
  private wallet: WalletManager;
  private registry: RegistryClient;
  private usdc: USDCPayment;
  private x402: X402Client;

  constructor(keypair: Keypair, config: WalletConfig) {
    this.wallet = WalletManager.fromKeypair(keypair, config);
    
    const connection = this.wallet.getConnection();
    
    this.registry = new RegistryClient(connection, config.network);
    this.usdc = new USDCPayment(connection, keypair, config.network);
    this.x402 = new X402Client();
  }

  static createNew(options: CreateWalletOptions): PortalsClient {
    const config = {
      network: options.network,
      rpcUrl: options.rpcUrl,
    };
    const wallet = WalletManager.createNew(options.walletPath, config);

    return new PortalsClient(wallet.getKeypair(), {
      network: options.network || DEFAULT_NETWORK,
      rpcUrl: options.rpcUrl,
    });
  }

  static fromFile(options: LoadWalletOptions): PortalsClient {
    const config = {
      network: options.network,
      rpcUrl: options.rpcUrl,
    };
    const wallet = WalletManager.fromFile(options.walletPath, config);

    return new PortalsClient(wallet.getKeypair(), {
      network: options.network || DEFAULT_NETWORK,
      rpcUrl: options.rpcUrl,
    });
  }

  getAddress(): PublicKey {
    return this.wallet.getAddress();
  }

  getKeypair(): Keypair {
    return this.wallet.getKeypair();
  }

  async getBalance() {
    return this.wallet.getBalance();
  }

  async getAPI(apiId: string): Promise<APIEntry> {
    return this.registry.getAPI(new PublicKey(apiId));
  }

  async searchAPIs(keyword?: string): Promise<APIEntry[]> {
    return this.registry.searchAPIs(keyword);
  }

  async callAPI(apiId: string, params: any, toolName?: string): Promise<any> {
    const api = await this.getAPI(apiId);

    const network = this.wallet.getNetwork() as NetworkCluster;
    const usdcMint = USDC_MINT[network];

    const schema = await this.x402.getFullSchema(api.url);
    const tools = extractToolsFromSchema(schema);
    
    const validPrices = new Set<number>();
    for (const tool of tools) {
      if (tool.pricing?.type === 'fixed' && tool.pricing.price !== undefined) {
        validPrices.add(tool.pricing.price);
      } else if (tool.pricing?.type === 'tiered' && tool.pricing.options) {
        tool.pricing.options.forEach(opt => validPrices.add(opt.price));
      }
    }

    let targetUrl = api.url;
    if (toolName) {
      const targetTool = tools.find(t => t.operationId === toolName);
      if (targetTool && targetTool.path) {
        const baseUrl = api.url.endsWith('/') ? api.url.slice(0, -1) : api.url;
        targetUrl = baseUrl + targetTool.path;
      }
    }

    const response = await this.x402.call(targetUrl, params);

    if (response.status === 200) {
      return response.data;
    }

    if (response.status === 402) {
      const payment = this.x402.parsePaymentRequired(response);

      PaymentValidator.validate(payment.amount);

      if (validPrices.size > 0) {
        const tolerance = 0.0001;
        const isValidPrice = Array.from(validPrices).some(
          validPrice => Math.abs(payment.amount - validPrice) < tolerance
        );
        
        if (!isValidPrice) {
          throw new PricingMismatch(Array.from(validPrices), payment.amount);
        }
      }

      const payToOwner = new PublicKey(payment.address);
      const derivedAta = await getAssociatedTokenAddress(usdcMint, payToOwner, true);
      PaymentVerifier.verify(api.paymentVault, derivedAta.toString());

      const transaction = await this.usdc.pay(
        derivedAta,
        payment.amount,
        payment.feePayer ? new PublicKey(payment.feePayer) : undefined
      );

      const proof = {
        x402Version: 1,
        scheme: 'exact',
        network: payment.chain,
        payload: {
          transaction,
        },
      };
      const proofEncoded = Buffer.from(JSON.stringify(proof)).toString('base64');

      const retryResponse = await this.x402.call(targetUrl, params, proofEncoded);

      if (retryResponse.status === 200) {
        return retryResponse.data;
      }

      throw new Error(`API call failed after payment: ${retryResponse.status}`);
    }

    throw new Error(`Unexpected response status: ${response.status}`);
  }
}

