export interface X402Response {
  status: number;
  headers: {
    'x402-amount'?: string;
    'x402-currency'?: string;
    'x402-chain'?: string;
    'x402-address'?: string;
  };
  data?: any;
}

export interface X402PaymentRequired {
  amount: number;
  currency: string;
  chain: string;
  address: string;
  feePayer?: string;
}

