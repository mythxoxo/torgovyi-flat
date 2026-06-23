import { Address, beginCell, toNano } from "@ton/core";
import { existsSync, readFileSync } from "node:fs";
import { mnemonicToPrivateKey } from "@ton/crypto";
import { TonClient, WalletContractV5R1 } from "@ton/ton";
import { LaunchpadFactory } from "../../../build/launchpad-factory/LaunchpadFactory_LaunchpadFactory";
import type { CreateTokenInput, TokenRow } from "../shared";
import { normalizeCreatorTax } from "../shared";
import { upsertTokenRow } from "./indexer-store";
import { getLiveProof } from "./live-proof";

function loadLocalEnv(path: string) {
  if (!existsSync(path)) return;
  const content = readFileSync(path, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1);
    if (!process.env[key]) process.env[key] = value;
  }
}

loadLocalEnv('.env.local');
loadLocalEnv('.env.production');

const endpoint = process.env.TONCENTER_API_KEY
  ? `https://toncenter.com/api/v2/jsonRPC?api_key=${process.env.TONCENTER_API_KEY}`
  : 'https://toncenter.com/api/v2/jsonRPC';

export async function executeCreateToken(input: CreateTokenInput) {
  const factoryAddress = process.env.NEXT_PUBLIC_FACTORY_ADDRESS;
  const mnemonic = process.env.DEPLOYER_MNEMONIC || process.env.TONK_MEM_DEPLOYER_MNEMONIC;
  if (!factoryAddress) throw new Error('NEXT_PUBLIC_FACTORY_ADDRESS is required');
  if (!mnemonic) throw new Error('DEPLOYER_MNEMONIC is required');

  const live = await getLiveProof();
  if (!live.factory.deployed) {
    throw new Error('Factory is not deployed on mainnet yet');
  }

  const keyPair = await mnemonicToPrivateKey(mnemonic.split(' '));
  const client = new TonClient({ endpoint });
  const wallet = WalletContractV5R1.create({ publicKey: keyPair.publicKey });
  const sender = client.open(wallet).sender(keyPair.secretKey);
  const factory = client.open(LaunchpadFactory.fromAddress(Address.parse(factoryAddress)));
  const creatorTax = normalizeCreatorTax(input.creatorTax ?? { mode: 'normal' });

  await factory.send(sender, { value: toNano('0.35') }, {
    $$type: 'CreateToken',
    name: input.name,
    symbol: input.ticker,
    description: input.description || '',
    imageUrl: input.image || '',
    totalSupply: BigInt(String(input.totalSupply || '1000000000')),
    creator: wallet.address,
    curveTarget: toNano(String((input.curveConfig?.targetTon as number) || 5)),
    minBuy: toNano(String((input.curveConfig?.minBuyTon as number) || 0.05)),
    feeBps: BigInt((input.curveConfig?.feeBps as number) || 75)
  });

  const now = new Date().toISOString();
  const stagedRow: TokenRow = {
    pool_address: `pending:${wallet.address.toString({ bounceable: true, testOnly: false })}:${Date.now()}`,
    jetton_address: '',
    creator: wallet.address.toString({ bounceable: true, testOnly: false }),
    name: input.name,
    symbol: input.ticker,
    description: input.description || '',
    image_url: input.image || null,
    collected_ton: 0,
    target_ton: Number((input.curveConfig?.targetTon as number) || 5),
    sold_tokens: 0,
    status: 'PENDING',
    is_listed: false,
    lp_lock_address: null,
    dedust_pool_address: null,
    created_at: now,
    updated_at: now
  };
  await upsertTokenRow(stagedRow);

  return {
    ok: true,
    pending: true,
    creatorWallet: wallet.address.toString({ bounceable: true, testOnly: false }),
    submittedVia: 'server-executor',
    creatorTax,
    stagedId: stagedRow.pool_address,
    message: 'CreateToken submitted to live factory; indexed contract addresses will appear after deployment/indexing completes.'
  };
}
