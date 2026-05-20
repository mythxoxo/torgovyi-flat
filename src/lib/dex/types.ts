export type DexId = 'dedust';

export type DexGraduationStatus =
  | 'not_ready'
  | 'target_reached'
  | 'payload_ready'
  | 'waiting_for_manual_signature'
  | 'pending_confirmation'
  | 'liquidity_added'
  | 'lp_lock_pending'
  | 'failed';

export type PrepareDedustLiquidityInput = {
  jettonMaster: string;
  pool: string;
  creator?: string;
  tonAmountNano: string;
  tokenAmount: string;
  slippageBps: number;
};

export type PreparedDexMessage = {
  address: string;
  amount: string;
  payload?: string;
  stateInit?: string;
};

export type PreparedDedustLiquidityTx = {
  dex: 'dedust';
  mode: 'dry-run';
  status: 'payload scaffold';
  title: string;
  description: string;
  messages: PreparedDexMessage[];
  warnings: string[];
  validUntil: number;
  manualSigningRequired: true;
  liveExecutionVerified: false;
};
