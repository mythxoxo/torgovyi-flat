import "./jetton/messages";

const DEFAULT_BONDING_TARGET_TON: Int = 8888000000000;
const MIN_BUY_TON: Int = 50000000;
const TOKENS_PER_TON: Int = 1000000;

message Buy {
  referral: Address?;
  minTokensOut: Int as uint128;
}

contract LaunchpadPool {
  creator: Address;
  jettonMaster: Address;
  lpLock: Address;
  collected: Int as coins;
  target: Int as coins;
  soldTokens: Int as uint128;
  graduated: Bool;
  listed: Bool;

  init(creator: Address, jettonMaster: Address, lpLock: Address, targetTon: Int as coins) {
    self.creator = creator;
    self.jettonMaster = jettonMaster;
    self.lpLock = lpLock;
    self.collected = 0;
    self.target = targetTon > 0 ? targetTon : DEFAULT_BONDING_TARGET_TON;
    self.soldTokens = 0;
    self.graduated = false;
    self.listed = false;
  }

  receive(msg: Buy) {
    require(!self.graduated, "graduated");
    require(!self.listed, "listed");
    require(context().value >= MIN_BUY_TON, "min buy");

    let accepted = context().value;
    let remaining = self.target - self.collected;
    if (accepted > remaining) {
      accepted = remaining;
    }
    require(accepted > 0, "graduated");

    let tokensOut = (accepted / 1000000000) * TOKENS_PER_TON;
    require(tokensOut > 0, "slippage");
    require(tokensOut >= msg.minTokensOut, "slippage");

    self.collected = self.collected + accepted;
    self.soldTokens = self.soldTokens + tokensOut;

    message(MessageParameters {
      to: self.jettonMaster,
      value: 0,
      bounce: true,
      mode: SendRemainingValue,
      body: Mint {
        queryId: 0,
        receiver: sender(),
        tonAmount: 0,
        mintMessage: JettonTransferInternal {
          queryId: 0,
          amount: tokensOut,
          sender: myAddress(),
          responseDestination: self.creator,
          forwardTonAmount: 0,
          forwardPayload: emptySlice()
        }
      }.toCell()
    });

    if (self.collected >= self.target) {
      self.graduated = true;
    }
  }

  get fun get_state(): Int {
    if (self.listed) {
      return 2;
    }
    if (self.graduated) {
      return 1;
    }
    return 0;
  }

  get fun get_collected_ton(): Int { return self.collected; }
  get fun get_target_ton(): Int { return self.target; }
  get fun get_creator(): Address { return self.creator; }
  get fun get_jetton_master(): Address { return self.jettonMaster; }
  get fun get_sold_tokens(): Int { return self.soldTokens; }
  get fun get_is_graduated(): Bool { return self.graduated; }
  get fun get_is_listed(): Bool { return self.listed; }
  get fun get_lp_lock(): Address { return self.lpLock; }
}
