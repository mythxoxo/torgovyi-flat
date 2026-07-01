import { existsSync, readFileSync } from "node:fs";
import { beginCell, Address, internal, SendMode, toNano } from "@ton/core";
import { mnemonicToPrivateKey } from "@ton/crypto";
import { TonClient, WalletContractV5R1 } from "@ton/ton";
import { JettonMinter, storeConfigureLaunchPhase, storeChangeOwner } from "../build/jetton-minter/JettonMinter_JettonMinter";
import { storeRegisterPool } from "../build/launchpad-factory/LaunchpadFactory_LaunchpadFactory";

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

const FALLBACK_CREATOR = 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c';

async function main() {
  const step = process.argv[2];
  if (!step || !['1','2','3'].includes(step)) throw new Error('Pass step: 1 | 2 | 3');
  const mnemonic = process.env.DEPLOYER_MNEMONIC || process.env.TONS_OF_GRAM_DEPLOYER_MNEMONIC;
  if (!mnemonic) throw new Error('DEPLOYER_MNEMONIC is required');
  const factory = process.env.NEXT_PUBLIC_FACTORY_ADDRESS;
  if (!factory) throw new Error('NEXT_PUBLIC_FACTORY_ADDRESS is required');

  const creator = Address.parse(process.env.EXAMPLE_CREATOR_ADDRESS || process.env.TONS_OF_GRAM_DEPLOYER_ADDRESS || process.env.FACTORY_OWNER_ADDRESS || FALLBACK_CREATOR);
  const jetton = Address.parse(process.env.LIVE_JETTON_ADDRESS || 'EQAIwaFJVmiCycuB5BCaUL0EYqs8ZHD_Xp82Lq5T-Ibf-ix9');
  const pool = Address.parse(process.env.LIVE_POOL_ADDRESS || 'EQAOUNHKfo5ocpKjbCA-lsqedae5EqRlH1nep4a-MqzRvnTX');

  const keyPair = await mnemonicToPrivateKey(mnemonic.split(' '));
  const client = new TonClient({ endpoint });
  const wallet = WalletContractV5R1.create({ publicKey: keyPair.publicKey });
  const opened = client.open(wallet);
  const seqno = await opened.getSeqno();

  const message = step === '1'
    ? internal({
        to: jetton,
        value: toNano('0.05'),
        body: beginCell().store(storeChangeOwner({ $$type: 'ChangeOwner', queryId: 0n, newOwner: pool })).endCell()
      })
    : step === '2'
      ? internal({
          to: jetton,
          value: toNano('0.05'),
          body: beginCell().store(storeConfigureLaunchPhase({ $$type: 'ConfigureLaunchPhase', queryId: 0n, pool, transfersEnabled: false })).endCell()
        })
      : internal({
          to: Address.parse(factory),
          value: toNano('0.15'),
          body: beginCell().store(storeRegisterPool({ $$type: 'RegisterPool', pool, jettonMaster: jetton, creator })).endCell()
        });

  await opened.sendTransfer({
    secretKey: keyPair.secretKey,
    seqno,
    messages: [message],
    sendMode: SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS
  });

  console.log(JSON.stringify({ ok: true, step, seqno, wallet: opened.address.toString({ bounceable: true, testOnly: false }) }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
