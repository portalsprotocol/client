import { PublicKey } from '@solana/web3.js';
import { PaymentAddressMismatch } from '../types/errors';

export class PaymentVerifier {
  static verify(expected: PublicKey, received: string): void {
    const expectedStr = expected.toString();
    
    if (expectedStr !== received) {
      throw new PaymentAddressMismatch(expectedStr, received);
    }
  }
}

