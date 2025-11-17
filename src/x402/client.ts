import fetch from 'node-fetch';
import { X402Response, X402PaymentRequired } from './types';
import { OpenAPISchema, extractToolsFromSchema, ToolInfo } from './schema';

export class X402Client {
  async getFullSchema(url: string): Promise<OpenAPISchema> {
    const base = new URL(url);
    if (!base.pathname.endsWith('/')) {
      base.pathname += '/';
    }
    base.pathname += 'openapi.json';
    base.search = '';
    const openapiUrl = base.toString();
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      const response = await fetch(openapiUrl, { 
        method: 'GET',
        signal: controller.signal
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get API schema: ${response.statusText}`);
      }

      return await response.json() as OpenAPISchema;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Schema fetch timeout (10s limit)');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async getTools(url: string): Promise<ToolInfo[]> {
    const schema = await this.getFullSchema(url);
    return extractToolsFromSchema(schema);
  }

  async call(url: string, params: any, proof?: string): Promise<X402Response> {
    const headers: any = {
      'Content-Type': 'application/json',
    };

    if (proof) {
      headers['X-PAYMENT'] = proof;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(params),
        signal: controller.signal
      });

      const x402Headers = {
        'x402-amount': response.headers.get('x402-amount') || undefined,
        'x402-currency': response.headers.get('x402-currency') || undefined,
        'x402-chain': response.headers.get('x402-chain') || undefined,
        'x402-address': response.headers.get('x402-address') || undefined,
      };

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      return {
        status: response.status,
        headers: x402Headers,
        data,
      };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Portal call timeout (5 min limit)');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  parsePaymentRequired(response: X402Response): X402PaymentRequired {
    const { headers, data } = response;
    
    if (headers['x402-amount'] && headers['x402-address']) {
      return {
        amount: parseFloat(headers['x402-amount']),
        currency: headers['x402-currency'] || 'USDC',
        chain: headers['x402-chain'] || 'solana',
        address: headers['x402-address'],
      };
    }

    if (data && typeof data === 'object' && Array.isArray(data.accepts) && data.accepts.length > 0) {
      const option = data.accepts[0] as any;
      const rawAmount = option.maxAmountRequired || option.amount || '0';
      const amountUsd = parseFloat(rawAmount) / 1_000_000;

      if (!option.payTo) {
        throw new Error('Invalid 402 response: missing payTo in accepts[0]');
      }

      return {
        amount: amountUsd,
        currency: 'USDC',
        chain: option.network || 'solana',
        address: option.payTo,
        feePayer: option.extra?.feePayer,
      };
    }

    throw new Error('Invalid 402 response: missing payment details');
  }
}

