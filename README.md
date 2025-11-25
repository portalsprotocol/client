# @portalsprotocol/client

> TypeScript SDK for building and using decentralized tools on Solana

Portals gives AI agents access to unstoppable tools through community-built APIs. Each Portal is a service exposing multiple related tools. Agents discover Portals on-chain, pay in USDC per call, and use them instantly—no API keys, no accounts, no middlemen.

**Live on Mainnet** • [Website](https://portalsprotocol.com) • [Docs](https://portalsprotocol.com/docs)

## Installation

```bash
npm install @portalsprotocol/client
```

## Quick Start

```typescript
import { PortalsClient } from '@portalsprotocol/client';

// Load wallet and connect
const client = PortalsClient.fromFile({
  walletPath: '~/.portals/wallet.json',
  network: 'mainnet-beta'
});

// Discover Portals
const portals = await client.searchAPIs();

// Use a Portal (automatic payment verification)
const result = await client.callAPI('portal-id', params, 'tool_name');
```

The SDK handles:
- ✅ Payment address verification (checks on-chain registry before paying)
- ✅ USDC transfers with automatic ATA creation
- ✅ OpenAPI schema parsing for multi-tool Portals
- ✅ Price validation against declared rates

## Usage

### Node.js (Full Client)

For CLI tools, bots, and MCP servers with file-based wallet management:

```typescript
import { PortalsClient } from '@portalsprotocol/client';

// Create new wallet
const client = PortalsClient.createNew({
  walletPath: '~/.portals/wallet.json',
  network: 'mainnet-beta'
});

// Or load existing
const client = PortalsClient.fromFile({
  walletPath: '~/.portals/wallet.json',
  network: 'mainnet-beta'
});

// Search for Portals
const portals = await client.searchAPIs('keyword');

// Get Portal details
const portal = await client.getAPI('portal-public-key');

// Call Portal tool
const result = await client.callAPI(
  'portal-public-key',
  params,
  'tool_name'  // optional for single-tool Portals
);

// Export keypair (for backup or migration)
const keypair = client.getKeypair();
const privateKey = Array.from(keypair.secretKey);  // [123, 45, ...] format
console.log(JSON.stringify(privateKey));  // Save this securely
```

### Browser (Utilities Only)

For dApps using browser wallets (Phantom, Backpack, etc.):

```typescript
import {
  getConfig,
  derivePaymentVaultPda,
  deserializeAPIEntryToStrings,
  formatPricing
} from '@portalsprotocol/client/browser';
import { useWallet }かと思います。

```typescript
import {
  getConfig,
  derivePaymentVaultPda,
  deserializeAPIEntryToStrings,
  formatPricing
} from '@portalsprotocol/client/browser';
import { useWallet } from '@solana/wallet-adapter-react';

const { publicKey } = useWallet();
const config = getConfig('mainnet-beta');

// Derive PDA addresses
const [paymentVault] = derivePaymentVaultPda(portalId, config.registryProgramId);

// Deserialize on-chain data
const portal = deserializeAPIEntryToStrings(accountData, portalPubkey);

// Format pricing for display
const priceText = formatPricing(portal.pricing);
```

**Browser entry includes:**
- Network constants (`REGISTRY_PROGRAM_ID`, `USDC_MINT`, etc.)
- PDA derivation helpers
- Registry account deserializers
- OpenAPI schema parser
- Payment verifier utilities

**Not included in browser:**
- `PortalsClient` class (requires Node.js `fs` for wallet management)
- Use `@solana/wallet-adapter-react` for signing instead

## What You Can Build

**With Node.js SDK:**
- AI agent frameworks (autonomous tool usage)
- CLI tools for Portal management
- Trading bots with paid API access
- Backend services consuming Portals

**With Browser SDK:**
- Portal explorer dApps
- Provider registration dashboards
- Analytics platforms
- Community tools

## Features

### Core
- **Registry queries** - Fetch Portals from on-chain registry
- **Payment verification** - Validate payment addresses against registry before sending USDC
- **Pricing enforcement** - Client-side validation of declared vs requested prices
- **Multi-tool support** - Automatic endpoint resolution for Portals with multiple tools

### Payment Flow
- **x402 protocol** - HTTP 402 Payment Required standard
- **PayAI integration** - Gasless facilitator, 100k settlements/month free
- **USDC only** - Circle USDC on Solana (devnet/mainnet)
- **Automatic ATA** - Creates Associated Token Accounts if needed

### Security
- **Pre-payment verification** - Checks registry before agent pays
- **Safety limits** - $0.001 minimum, $10 maximum per call
- **Collateral system** - Providers stake 500K $PORTALS per Portal
- **Transparent** - Full TypeScript source included in package

## Network Support

- **Mainnet** (default) - Production
- **Devnet** - Testing and development

## API Reference

### Main Classes

**`PortalsClient`**
- `createNew(options)` - Generate new wallet and save to file
- `fromFile(options)` - Load wallet from JSON file
- `getAddress()` - Get wallet public key
- `getKeypair()` - Get wallet keypair (includes private key for export)
- `getBalance()` - Get SOL and USDC balances
- `getAPI(apiId)` - Fetch Portal details from registry
- `searchAPIs(keyword?)` - Query all Portals, optionally filtered
- `callAPI(apiId, params, toolName?)` - Execute Portal tool with payment

**`WalletManager`**
- Manages Keypair and Connection
- Balance queries (SOL + USDC)

**`RegistryClient`**
- On-chain registry queries
- Deserializes `APIEntry` accounts

**`PaymentVerifier`**
- Validates payment addresses
- Checks declared vs actual prices

### Browser Utilities

```typescript
// Constants
getConfig(network?: 'devnet' | 'mainnet-beta'): NetworkConfig
DEFAULT_NETWORK: 'mainnet-beta'
REGISTRY_PROGRAM_ID, USDC_MINT, PORTALS_MINT

// PDA Helpers
derivePaymentVaultPda(apiId, programId): [PublicKey, number]
deriveCollateralAuthorityPda(apiId, programId): [PublicKey, number]

// Deserializers
deserializeAPIEntry(data, pubkey): APIEntry
deserializeAPIEntryToStrings(data, pubkey): APIEntryStrings

// Schema
extractToolsFromSchema(schema): ToolInfo[]
formatPricing(pricing): string
```

## Transparency

This package includes full TypeScript source code for complete transparency. Audit before using in production.

- **Source code**: Included in `src/` directory
- **License**: MIT
- **Repository**: [github.com/portalsprotocol/client](https://github.com/portalsprotocol/client)
- **Audit**: Review code before connecting wallets or sending funds

## Links

- **Website**: https://portalsprotocol.com
- **Documentation**: https://portalsprotocol.com/docs
- **MCP Server**: [@portalsprotocol/mcp-server](https://www.npmjs.com/package/@portalsprotocol/mcp-server)
- **Issues**: [github.com/portalsprotocol/client/issues](https://github.com/portalsprotocol/client/issues)

## License

MIT © Portals Protocol
