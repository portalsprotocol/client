import { InvalidPaymentAmount, PaymentAmountTooHigh, PaymentAmountTooLow } from '../types/errors';

export class PaymentValidator {
  static readonly MAX_AMOUNT = 10;
  static readonly MIN_AMOUNT = 0.001;

  static validate(amount: number): void {
    if (amount <= 0 || isNaN(amount)) {
      throw new InvalidPaymentAmount(`Invalid payment amount: ${amount}`);
    }
    
    if (amount < PaymentValidator.MIN_AMOUNT) {
      throw new PaymentAmountTooLow(amount, PaymentValidator.MIN_AMOUNT);
    }
    
    if (amount > PaymentValidator.MAX_AMOUNT) {
      throw new PaymentAmountTooHigh(amount, PaymentValidator.MAX_AMOUNT);
    }
  }
}

