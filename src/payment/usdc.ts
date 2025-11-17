import { Connection, Keypair, PublicKey, Transaction, ComputeBudgetProgram } from '@solana/web3.js';
import { 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getAccount
} from '@solana/spl-token';
import { USDC_MINT, USDC_DECIMALS } from '../constants/network';
import { InsufficientUsdcBalance, PaymentFailed } from '../types/errors';
import { fromLamports, toLamports } from '../helpers/token';

export class USDCPayment {
  private connection: Connection;
  private keypair: Keypair;
  private network: 'devnet' | 'mainnet-beta';

  constructor(connection: Connection, keypair: Keypair, network: 'devnet' | 'mainnet-beta') {
    this.connection = connection;
    this.keypair = keypair;
    this.network = network;
  }

  async pay(to: PublicKey, amountUsd: number, feePayer?: PublicKey): Promise<string> {
    const usdcMint = USDC_MINT[this.network];
    const amount = Number(toLamports(amountUsd, USDC_DECIMALS));

    const fromAta = await getAssociatedTokenAddress(
      usdcMint,
      this.keypair.publicKey
    );

    let fromAccount;
    try {
      fromAccount = await getAccount(this.connection, fromAta);
    } catch (error) {
      throw new InsufficientUsdcBalance(amountUsd, 0);
    }
    
    if (Number(fromAccount.amount) < amount) {
      throw new InsufficientUsdcBalance(
        amountUsd,
        fromLamports(fromAccount.amount, USDC_DECIMALS)
      );
    }

    const tx = new Transaction();
    
    tx.add(
      ComputeBudgetProgram.setComputeUnitLimit({ units: 200_000 })
    );
    
    tx.add(
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1 })
    );
    
    tx.add(
      createTransferCheckedInstruction(
        fromAta,
        usdcMint,
        to,
        this.keypair.publicKey,
        amount,
        USDC_DECIMALS
      )
    );

    const { blockhash } = await this.connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = feePayer || this.keypair.publicKey;
    tx.partialSign(this.keypair);

    const serialized = tx.serialize({ requireAllSignatures: false }).toString('base64');

    return serialized;
  }
}

