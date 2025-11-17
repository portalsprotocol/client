import { PublicKey } from '@solana/web3.js';
import { PROTOCOL_CONSTANTS } from '../constants/protocol';
import { fromLamports } from '../helpers/token';

export interface APIEntry {
  publicKey: PublicKey;
  provider: PublicKey;
  title: string;
  description: string;
  url: string;
  paymentVault: PublicKey;
  collateralVault: PublicKey;
  collateralAmount: number;
  totalClaimed: number;
  suspended: boolean;
  createdAt: number;
  lastUpdated: number;
}

export interface APIEntryStrings {
  publicKey: string;
  provider: string;
  title: string;
  description: string;
  url: string;
  paymentVault: string;
  collateralVault: string;
  collateralAmount: number;
  totalClaimed: number;
  suspended: boolean;
  createdAt: number;
  lastUpdated: number;
  totalVolume?: number;
}

export function deserializeAPIEntry(data: Buffer, pubkey: PublicKey): Omit<APIEntry, 'publicKey'> {
  let offset = 8;

  const provider = new PublicKey(data.slice(offset, offset + 32));
  offset += 32;

  const titleLen = data.readUInt32LE(offset);
  offset += 4;
  const title = data.slice(offset, offset + titleLen).toString('utf-8');
  offset += titleLen;

  const descLen = data.readUInt32LE(offset);
  offset += 4;
  const description = data.slice(offset, offset + descLen).toString('utf-8');
  offset += descLen;

  const urlLen = data.readUInt32LE(offset);
  offset += 4;
  const url = data.slice(offset, offset + urlLen).toString('utf-8');
  offset += urlLen;

  const paymentVault = new PublicKey(data.slice(offset, offset + 32));
  offset += 32;

  const collateralVault = new PublicKey(data.slice(offset, offset + 32));
  offset += 32;

  const collateralAmount = Number(data.readBigUInt64LE(offset));
  offset += 8;

  const totalClaimed = Number(data.readBigUInt64LE(offset));
  offset += 8;

  const suspended = data.readUInt8(offset) === 1;
  offset += 1;

  const createdAt = Number(data.readBigInt64LE(offset));
  offset += 8;

  const lastUpdated = Number(data.readBigInt64LE(offset));

  return {
    provider,
    title,
    description,
    url,
    paymentVault,
    collateralVault,
    collateralAmount,
    totalClaimed,
    suspended,
    createdAt,
    lastUpdated,
  };
}

export function deserializeAPIEntryToStrings(data: Buffer, pubkey: PublicKey): APIEntryStrings {
  const entry = deserializeAPIEntry(data, pubkey);
  
  return {
    publicKey: pubkey.toString(),
    provider: entry.provider.toString(),
    title: entry.title,
    description: entry.description,
    url: entry.url,
    paymentVault: entry.paymentVault.toString(),
    collateralVault: entry.collateralVault.toString(),
    collateralAmount: fromLamports(entry.collateralAmount, PROTOCOL_CONSTANTS.PORTALS_DECIMALS),
    totalClaimed: fromLamports(entry.totalClaimed, 6),
    suspended: entry.suspended,
    createdAt: entry.createdAt,
    lastUpdated: entry.lastUpdated,
  };
}

