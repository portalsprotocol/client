import { Connection, PublicKey } from '@solana/web3.js';
import { APIEntry, deserializeAPIEntry } from './types';
import { APINotFound } from '../types/errors';
import { REGISTRY_PROGRAM_ID } from '../constants/network';
import { ACCOUNT_DISCRIMINATORS, API_ENTRY_SIZE } from '../constants/protocol';

export class RegistryClient {
  private connection: Connection;
  private programId: PublicKey;

  constructor(connection: Connection, network: 'devnet' | 'mainnet-beta') {
    this.connection = connection;
    this.programId = REGISTRY_PROGRAM_ID[network];
  }

  async getAPI(apiId: PublicKey): Promise<APIEntry> {
    try {
      const accountInfo = await this.connection.getAccountInfo(apiId);
      if (!accountInfo) {
        throw new Error('Account not found');
      }

      const data = accountInfo.data;
      const account = deserializeAPIEntry(data, apiId);
      
      return {
        publicKey: apiId,
        ...account,
      };
    } catch (error) {
      throw new APINotFound(apiId.toString());
    }
  }

  async searchAPIs(keyword?: string): Promise<APIEntry[]> {
    const accounts = await this.connection.getProgramAccounts(this.programId, {
      filters: [
        { dataSize: API_ENTRY_SIZE },
        { memcmp: { offset: 0, bytes: ACCOUNT_DISCRIMINATORS.API_ENTRY } },
      ]
    });

    const apis = accounts
      .map(({ pubkey, account }) => {
        try {
          return {
            publicKey: pubkey,
            ...deserializeAPIEntry(account.data, pubkey),
          };
        } catch {
          return null;
        }
      })
      .filter((api): api is APIEntry & { publicKey: PublicKey } => api !== null);

    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      return apis.filter(api => 
        api.url.toLowerCase().includes(lowerKeyword) ||
        api.title.toLowerCase().includes(lowerKeyword) ||
        api.description.toLowerCase().includes(lowerKeyword)
      );
    }

    return apis;
  }
}

