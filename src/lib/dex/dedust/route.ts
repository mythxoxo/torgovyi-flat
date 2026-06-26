import { Address } from '@ton/core';
import { getDedustTonClient, loadDedustSdk } from './client';

export type DedustRouteStatus = 'quote_ready' | 'route_not_found' | 'liquidity_not_found' | 'pool_not_ready' | 'payload_unavailable' | 'sdk_missing' | 'unknown_error';

export type DedustResolvedRoute = {
  status: DedustRouteStatus;
  reason?: string;
  tokenAddress: string;
  poolAddress?: string;
  vaultAddress?: string;
  userJettonWalletAddress?: string;
  poolReadiness?: string;
  vaultReadiness?: string;
  sdk?: Record<string, unknown>;
};

async function resolveBase(tokenAddress: string) {
  const sdk = await loadDedustSdk();
  if (!sdk) {
    return { status: 'sdk_missing' as const, reason: '@dedust/sdk is not installed', tokenAddress };
  }
  try {
    const client = getDedustTonClient();
    const { Factory, MAINNET_FACTORY_ADDR, Asset, PoolType, ReadinessStatus } = sdk as any;
    const factory = client.open(Factory.createFromAddress(MAINNET_FACTORY_ADDR));
    const jettonMaster = Address.parse(tokenAddress);
    const pool = await factory.getPool(PoolType.VOLATILE, [Asset.native(), Asset.jetton(jettonMaster)]);
    const poolReadiness = await pool.getReadinessStatus();
    const poolAddress = pool.address.toString({ bounceable: true, testOnly: false });
    return { sdk, client, factory, jettonMaster, pool, poolReadiness, poolAddress, ReadinessStatus };
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'route resolution failed';
    if (/Cannot convert undefined to a BigInt|Invalid address/i.test(reason)) {
      return { status: 'route_not_found' as const, reason, tokenAddress };
    }
    if (/getState|not deployed|not-ready/i.test(reason)) {
      return { status: 'pool_not_ready' as const, reason, tokenAddress };
    }
    return {
      status: 'unknown_error' as const,
      reason,
      tokenAddress,
    };
  }
}

export async function resolveDedustBuyRoute(tokenAddress: string): Promise<DedustResolvedRoute> {
  const base = await resolveBase(tokenAddress);
  if ('status' in base) return base as DedustResolvedRoute;
  try {
    const { factory, pool, poolReadiness, poolAddress, ReadinessStatus } = base as any;
    const nativeVault = await factory.getNativeVault();
    const vaultReadiness = await nativeVault.getReadinessStatus();
    const vaultAddress = nativeVault.address.toString({ bounceable: true, testOnly: false });

    if (poolReadiness !== ReadinessStatus.READY) {
      return { status: 'pool_not_ready', tokenAddress, poolAddress, vaultAddress, poolReadiness, vaultReadiness, sdk: base.sdk as any };
    }
    if (vaultReadiness !== ReadinessStatus.READY) {
      return { status: 'pool_not_ready', tokenAddress, poolAddress, vaultAddress, poolReadiness, vaultReadiness, sdk: base.sdk as any };
    }

    const reserves = await pool.getReserves().catch(() => null);
    if (!reserves) {
      return { status: 'liquidity_not_found', tokenAddress, poolAddress, vaultAddress, poolReadiness, vaultReadiness, sdk: base.sdk as any };
    }

    return {
      status: 'quote_ready',
      tokenAddress,
      poolAddress,
      vaultAddress,
      poolReadiness,
      vaultReadiness,
      sdk: base.sdk as any,
    };
  } catch (error) {
    return { status: 'unknown_error', reason: error instanceof Error ? error.message : 'buy route failed', tokenAddress };
  }
}

export async function resolveDedustSellRoute(tokenAddress: string, userWallet: string): Promise<DedustResolvedRoute> {
  const base = await resolveBase(tokenAddress);
  if ('status' in base) return base as DedustResolvedRoute;
  try {
    const { factory, pool, poolReadiness, poolAddress, jettonMaster, ReadinessStatus } = base as any;
    const jettonVault = await factory.getJettonVault(jettonMaster);
    const vaultReadiness = await jettonVault.getReadinessStatus();
    const vaultAddress = jettonVault.address.toString({ bounceable: true, testOnly: false });
    const userJettonWallet = await pool.getWallet(Address.parse(userWallet));
    const userJettonWalletAddress = userJettonWallet.address.toString({ bounceable: true, testOnly: false });

    if (poolReadiness !== ReadinessStatus.READY) {
      return { status: 'pool_not_ready', tokenAddress, poolAddress, vaultAddress, poolReadiness, vaultReadiness, userJettonWalletAddress, sdk: base.sdk as any };
    }
    if (vaultReadiness !== ReadinessStatus.READY) {
      return { status: 'pool_not_ready', tokenAddress, poolAddress, vaultAddress, poolReadiness, vaultReadiness, userJettonWalletAddress, sdk: base.sdk as any };
    }

    return {
      status: 'quote_ready',
      tokenAddress,
      poolAddress,
      vaultAddress,
      userJettonWalletAddress,
      poolReadiness,
      vaultReadiness,
      sdk: base.sdk as any,
    };
  } catch (error) {
    return { status: 'unknown_error', reason: error instanceof Error ? error.message : 'sell route failed', tokenAddress };
  }
}
