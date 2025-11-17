export class PortalsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PortalsError';
  }
}

export class InsufficientSolBalance extends PortalsError {
  constructor(required: number, available: number) {
    super(`Insufficient SOL balance. Required: ${required}, Available: ${available}`);
    this.name = 'InsufficientSolBalance';
  }
}

export class InsufficientUsdcBalance extends PortalsError {
  constructor(required: number, available: number) {
    super(`Insufficient USDC balance. Required: ${required}, Available: ${available}`);
    this.name = 'InsufficientUsdcBalance';
  }
}

export class PaymentAddressMismatch extends PortalsError {
  constructor(expected: string, received: string) {
    super(`Payment address mismatch. Expected: ${expected}, Received: ${received}`);
    this.name = 'PaymentAddressMismatch';
  }
}

export class APINotFound extends PortalsError {
  constructor(apiId: string) {
    super(`API not found: ${apiId}`);
    this.name = 'APINotFound';
  }
}

export class PaymentFailed extends PortalsError {
  constructor(message: string) {
    super(`Payment failed: ${message}`);
    this.name = 'PaymentFailed';
  }
}

export class WalletError extends PortalsError {
  constructor(message: string) {
    super(`Wallet error: ${message}`);
    this.name = 'WalletError';
  }
}

export class InvalidPaymentAmount extends PortalsError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPaymentAmount';
  }
}

export class PaymentAmountTooHigh extends PortalsError {
  constructor(amount: number, max: number) {
    super(`Payment amount too high: $${amount} (max: $${max})`);
    this.name = 'PaymentAmountTooHigh';
  }
}

export class PaymentAmountTooLow extends PortalsError {
  constructor(amount: number, min: number) {
    super(`Payment amount too low: $${amount} (min: $${min})`);
    this.name = 'PaymentAmountTooLow';
  }
}

export class PricingMismatch extends PortalsError {
  constructor(declaredPrices: number[], requested: number) {
    const pricesStr = declaredPrices.map(p => `$${p}`).join(', ');
    super(`Pricing mismatch. Provider declared: [${pricesStr}], but requested: $${requested}`);
    this.name = 'PricingMismatch';
  }
}

