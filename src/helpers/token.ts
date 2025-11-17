import { Connection, PublicKey } from '@solana/web3.js';
import { getAccount } from '@solana/spl-token';

export function fromLamports(amount: bigint | number, decimals: number): number {
  return Number(amount) / Math.pow(10, decimals);
}

export function toLamports(amount: number, decimals: number): bigint {
  return BigInt(Math.floor(amount * Math.pow(10, decimals)));
}

export async function getTokenBalance(
  connection: Connection,
  owner: PublicKey,
  mint: PublicKey,
  decimals: number = 9
): Promise<number> {
  try {
    const accounts = await connection.getTokenAccountsByOwner(owner, { mint });
    
    if (accounts.value.length === 0) {
      return 0;
    }
    
    const accountInfo = await getAccount(connection, accounts.value[0].pubkey);
    return fromLamports(accountInfo.amount, decimals);
  } catch {
    return 0;
  }
}

export async function getFirstTokenAccount(
  connection: Connection,
  owner: PublicKey,
  mint: PublicKey
): Promise<PublicKey | null> {
  try {
    const accounts = await connection.getTokenAccountsByOwner(owner, { mint });
    return accounts.value.length > 0 ? accounts.value[0].pubkey : null;
  } catch {
    return null;
  }
}

