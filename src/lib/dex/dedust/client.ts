import { existsSync, readFileSync } from 'node:fs';
import { TonClient, TonClient4 } from '@ton/ton';

let v4Client: TonClient4 | null = null;
let rpcClient: TonClient | null = null;
let lastMeta = {
  providerType: 'v4',
  endpointHost: 'unknown',
  explicitV4EndpointPresent: false,
  explicitRpcEndpointPresent: false,
};

function loadLocalEnv(path: string) {
  if (!existsSync(path)) return;
  const content = readFileSync(path, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1);
    if (!process.env[key]) process.env[key] = value;
  }
}

loadLocalEnv('.env.local');
loadLocalEnv('.env.production');

function pickToncenterKey() {
  return (
    process.env.TONCENTER_API_KEY?.trim() ||
    process.env.TONCENTER_KEY?.trim() ||
    process.env.TONCENTER_TOKEN?.trim() ||
    ''
  );
}

function getProviderType(): 'v4' | 'jsonrpc' {
  const raw = (process.env.DEDUST_PROVIDER_TYPE?.trim() || 'v4').toLowerCase();
  return raw === 'jsonrpc' ? 'jsonrpc' : 'v4';
}

function getV4Endpoint() {
  return process.env.DEDUST_TON_V4_ENDPOINT?.trim() || 'https://mainnet-v4.tonhubapi.com';
}

function getRpcEndpoint() {
  const explicit =
    process.env.TON_RPC_ENDPOINT?.trim() ||
    process.env.TONCENTER_RPC_URL?.trim() ||
    process.env.TONCENTER_ENDPOINT?.trim() ||
    '';
  const toncenterKey = pickToncenterKey();
  if (explicit) return { endpoint: explicit, toncenterKey };
  if (toncenterKey) return { endpoint: `https://toncenter.com/api/v2/jsonRPC?api_key=${toncenterKey}`, toncenterKey };
  return { endpoint: 'https://toncenter.com/api/v2/jsonRPC', toncenterKey };
}

function safeHost(url: string) {
  try { return new URL(url).host; } catch { return 'invalid-endpoint'; }
}

export function getDedustClientMeta() {
  return lastMeta;
}

export function getDedustTonClient() {
  const providerType = getProviderType();
  if (providerType === 'v4') {
    if (v4Client) return v4Client;
    const endpoint = getV4Endpoint();
    lastMeta = {
      providerType: 'v4',
      endpointHost: safeHost(endpoint),
      explicitV4EndpointPresent: Boolean(process.env.DEDUST_TON_V4_ENDPOINT?.trim()),
      explicitRpcEndpointPresent: Boolean(process.env.TON_RPC_ENDPOINT?.trim() || process.env.TONCENTER_RPC_URL?.trim() || process.env.TONCENTER_ENDPOINT?.trim()),
    };
    console.log(`[dedust-client] providerType=v4 endpointHost=${lastMeta.endpointHost} explicitV4EndpointPresent=${lastMeta.explicitV4EndpointPresent} explicitRpcEndpointPresent=${lastMeta.explicitRpcEndpointPresent}`);
    v4Client = new TonClient4({ endpoint });
    return v4Client;
  }

  if (rpcClient) return rpcClient;
  const { endpoint, toncenterKey } = getRpcEndpoint();
  lastMeta = {
    providerType: 'jsonrpc',
    endpointHost: safeHost(endpoint),
    explicitV4EndpointPresent: Boolean(process.env.DEDUST_TON_V4_ENDPOINT?.trim()),
    explicitRpcEndpointPresent: Boolean(process.env.TON_RPC_ENDPOINT?.trim() || process.env.TONCENTER_RPC_URL?.trim() || process.env.TONCENTER_ENDPOINT?.trim()),
  };
  console.log(`[dedust-client] providerType=jsonrpc endpointHost=${lastMeta.endpointHost} explicitV4EndpointPresent=${lastMeta.explicitV4EndpointPresent} explicitRpcEndpointPresent=${lastMeta.explicitRpcEndpointPresent} toncenterKeyPresent=${Boolean(toncenterKey)}`);
  rpcClient = new TonClient({ endpoint, apiKey: toncenterKey || undefined });
  return rpcClient;
}

export async function loadDedustSdk() {
  try {
    const importer = new Function('moduleName', 'return import(moduleName)') as (moduleName: string) => Promise<Record<string, unknown>>;
    return await importer('@dedust/sdk');
  } catch {
    return null;
  }
}

export async function with429Retry<T>(fn: () => Promise<T>): Promise<T> {
  const delays = [500, 1500, 3000];
  let lastError: unknown;
  for (let i = 0; i < delays.length; i += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const reason = error instanceof Error ? error.message : String(error);
      if (!/429/.test(reason)) throw error;
      await new Promise((resolve) => setTimeout(resolve, delays[i]));
    }
  }
  throw lastError;
}
