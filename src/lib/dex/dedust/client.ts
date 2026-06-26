import { TonClient } from '@ton/ton';

let client: TonClient | null = null;

export function getDedustTonClient() {
  if (client) return client;
  const endpoint = process.env.TONCENTER_RPC_URL || 'https://toncenter.com/api/v2/jsonRPC';
  const apiKey = process.env.TONCENTER_API_KEY?.trim();
  client = new TonClient({
    endpoint,
    apiKey: apiKey || undefined,
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
