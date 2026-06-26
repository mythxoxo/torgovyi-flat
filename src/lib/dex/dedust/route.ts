import { Address } from '@ton/core';
import { getDedustTonClient, loadDedustSdk, with429Retry } from './client';

export type DedustRouteStatus = 'quote_ready' | 'route_not_found' | 'liquidity_not_found' | 'pool_not_ready' | 'payload_unavailable' | 'sdk_missing' | 'dex_rate_limited' | 'unknown_error';

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
    const unresolvedPool = await with429Retry(() => factory.getPool(PoolType.VOLATILE, [Asset.native(), Asset.jetton(jettonMaster)]));
    const pool = client.open(unresolvedPool as any);
    const poolReadiness = await with429Retry(() => pool.getReadinessStatus());
    const poolAddress = pool.address.toString({ bounceable: true, testOnly: false });
    return { sdk, client, factory, jettonMaster, pool, poolReadiness, poolAddress, ReadinessStatus };
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'route resolution failed';
    if (/429/.test(reason)) {
      return { status: 'dex_rate_limited' as const, reason, tokenAddress };
    }
    if (/405/.test(reason)) {
      return { status: 'payload_unavailable' as const, reason, tokenAddress };
    }
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
    const unresolvedNativeVault = await with429Retry(() => factory.getNativeVault());
    const nativeVault = (base as any).client.open(unresolvedNativeVault as any);
    const vaultReadiness = await with429Retry(() => nativeVault.getReadinessStatus());
    const vaultAddress = nativeVault.address.toString({ bounceable: true, testOnly: false });

    if (poolReadiness !== ReadinessStatus.READY) {
      return { status: 'pool_not_ready', tokenAddress, poolAddress, vaultAddress, poolReadiness: String(poolReadiness), vaultReadiness: String(vaultReadiness), sdk: base.sdk as any };
    }
    if (vaultReadiness !== ReadinessStatus.READY) {
      return { status: 'pool_not_ready', tokenAddress, poolAddress, vaultAddress, poolReadiness: String(poolReadiness), vaultReadiness: String(vaultReadiness), sdk: base.sdk as any };
    }

    const reserves = await with429Retry(() => pool.getReserves()).catch(() => null);
    if (!reserves) {
      return { status: 'liquidity_not_found', tokenAddress, poolAddress, vaultAddress, poolReadiness: String(poolReadiness), vaultReadiness: String(vaultReadiness), sdk: base.sdk as any };
    }

    return {
      status: 'quote_ready',
      tokenAddress,
      poolAddress,
      vaultAddress,
      poolReadiness: String(poolReadiness),
      vaultReadiness: String(vaultReadiness),
      sdk: base.sdk as any,
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'buy route failed';
    if (/429/.test(reason)) return { status: 'dex_rate_limited', reason, tokenAddress };
    return { status: 'unknown_error', reason, tokenAddress };
  }
}

export async function resolveDedustSellRoute(tokenAddress: string, userWallet: string): Promise<DedustResolvedRoute> {
  const base = await resolveBase(tokenAddress);
  if ('status' in base) return base as DedustResolvedRoute;
  try {
    const { factory, pool, poolReadiness, poolAddress, jettonMaster, ReadinessStatus } = base as any;
    const unresolvedJettonVault = await with429Retry(() => factory.getJettonVault(jettonMaster));
    const jettonVault = (base as any).client.open(unresolvedJettonVault as any);
    const vaultReadiness = await with429Retry(() => jettonVault.getReadinessStatus());
    const vaultAddress = jettonVault.address.toString({ bounceable: true, testOnly: false });
    const userJettonWallet = await with429Retry(() => pool.getWallet(Address.parse(userWallet)));
    const userJettonWalletAddress = (userJettonWallet as any).address.toString({ bounceable: true, testOnly: false });

    if (poolReadiness !== ReadinessStatus.READY) {
      return { status: 'pool_not_ready', tokenAddress, poolAddress, vaultAddress, poolReadiness: String(poolReadiness), vaultReadiness: String(vaultReadiness), userJettonWalletAddress, sdk: base.sdk as any };
    }
    if (vaultReadiness !== ReadinessStatus.READY) {
      return { status: 'pool_not_ready', tokenAddress, poolAddress, vaultAddress, poolReadiness: String(poolReadiness), vaultReadiness: String(vaultReadiness), userJettonWalletAddress, sdk: base.sdk as any };
    }

    return {
      status: 'quote_ready',
      tokenAddress,
      poolAddress,
      vaultAddress,
      userJettonWalletAddress,
      poolReadiness: String(poolReadiness),
      vaultReadiness: String(vaultReadiness),
      sdk: base.sdk as any,
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'sell route failed';
    if (/429/.test(reason)) return { status: 'dex_rate_limited', reason, tokenAddress };
    return { status: 'unknown_error', reason, tokenAddress };
  }
}
