import { existsSync, readFileSync } from 'node:fs';
import { TonClient } from '@ton/ton';

let client: TonClient | null = null;
let lastEndpointHost = 'unknown';
let lastToncenterKeyPresent = false;

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

function buildEndpoint() {
  const explicit =
    process.env.TON_RPC_ENDPOINT?.trim() ||
    process.env.TONCENTER_RPC_URL?.trim() ||
    process.env.TONCENTER_ENDPOINT?.trim() ||
    '';
  const toncenterKey = pickToncenterKey();

  if (explicit) {
    return { endpoint: explicit, toncenterKey };
  }
  if (toncenterKey) {
    return { endpoint: `https://toncenter.com/api/v2/jsonRPC?api_key=${toncenterKey}`, toncenterKey };
  }
  return { endpoint: 'https://toncenter.com/api/v2/jsonRPC', toncenterKey };
}

export function getDedustClientMeta() {
  return {
    endpointHost: lastEndpointHost,
    toncenterKeyPresent: lastToncenterKeyPresent,
  };
}

export function getDedustTonClient() {
  if (client) return client;
  const { endpoint, toncenterKey } = buildEndpoint();
  const endpointHost = (() => {
    try { return new URL(endpoint).host; } catch { return 'invalid-endpoint'; }
  })();
  lastEndpointHost = endpointHost;
  lastToncenterKeyPresent = Boolean(toncenterKey);
  console.log(`[dedust-client] endpointHost=${endpointHost} toncenterKeyPresent=${Boolean(toncenterKey)}`);
  client = new TonClient({
    endpoint,
    apiKey: toncenterKey || undefined,
  });
  return client;
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
