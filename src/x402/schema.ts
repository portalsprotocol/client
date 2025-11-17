export interface PricingOption {
  value: string;
  price: number;
}

export interface PortalsPricing {
  type: 'fixed' | 'tiered';
  price?: number;
  parameter?: string;
  options?: PricingOption[];
}

export interface ToolInfo {
  operationId: string;
  path: string;
  method: string;
  summary?: string;
  description?: string;
  pricing?: PortalsPricing;
  parameters?: any;
}

export interface OpenAPISchema {
  openapi: string;
  info: {
    title: string;
    description?: string;
    version?: string;
  };
  paths: Record<string, Record<string, any>>;
}

export function extractToolsFromSchema(schema: OpenAPISchema): ToolInfo[] {
  const tools: ToolInfo[] = [];

  for (const [path, methods] of Object.entries(schema.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      if (method === 'parameters' || !operation.operationId) continue;

      const tool: ToolInfo = {
        operationId: operation.operationId,
        path,
        method: method.toUpperCase(),
        summary: operation.summary,
        description: operation.description,
        parameters: operation.requestBody?.content?.['application/json']?.schema,
      };

      if (operation['x-portals-pricing']) {
        tool.pricing = operation['x-portals-pricing'] as PortalsPricing;
      }

      tools.push(tool);
    }
  }

  return tools;
}

export function formatPricing(pricing: PortalsPricing | undefined): string {
  if (!pricing) return 'Price not specified';

  if (pricing.type === 'fixed' && pricing.price !== undefined) {
    return `$${pricing.price.toFixed(pricing.price < 0.01 ? 3 : 2)} USDC`;
  }

  if (pricing.type === 'tiered' && pricing.options) {
    const prices = pricing.options.map(opt => opt.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    
    if (min === max) {
      return `$${min.toFixed(min < 0.01 ? 3 : 2)} USDC`;
    }
    
    return `$${min.toFixed(min < 0.01 ? 3 : 2)} - $${max.toFixed(max < 0.01 ? 3 : 2)} USDC`;
  }

  return 'Dynamic pricing';
}

export function getPriceForParams(pricing: PortalsPricing | undefined, params: any): number | null {
  if (!pricing) return null;

  if (pricing.type === 'fixed' && pricing.price !== undefined) {
    return pricing.price;
  }

  if (pricing.type === 'tiered' && pricing.parameter && pricing.options) {
    const paramValue = params[pricing.parameter];
    const option = pricing.options.find(opt => opt.value === paramValue);
    return option ? option.price : null;
  }

  return null;
}

