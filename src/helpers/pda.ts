import { PublicKey } from '@solana/web3.js';

export function derivePaymentVaultPda(
  registryProgramId: PublicKey,
  apiEntry: PublicKey
): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('payment_vault'), apiEntry.toBuffer()],
    registryProgramId
  );
  return pda;
}

export function deriveCollateralAuthorityPda(
  registryProgramId: PublicKey,
  apiEntry: PublicKey
): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('api_collateral'), apiEntry.toBuffer()],
    registryProgramId
  );
  return pda;
}

