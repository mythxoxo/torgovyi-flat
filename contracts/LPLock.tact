message LockLp {
  amount: Int as uint128;
}

contract LPLock {
  beneficiary: Address;
  unlockTime: Int as uint64;
  lockedLp: Int as uint128;
  permanent: Bool;

  init(beneficiary: Address, unlockTime: Int as uint64, permanent: Bool) {
    self.beneficiary = beneficiary;
    self.unlockTime = unlockTime;
    self.lockedLp = 0;
    self.permanent = permanent;
  }

  receive(msg: LockLp) {
    require(msg.amount > 0, "invalid amount");
    self.lockedLp = self.lockedLp + msg.amount;
  }

  get fun get_locked_lp(): Int { return self.lockedLp; }
  get fun get_unlock_time(): Int { return self.unlockTime; }
  get fun get_beneficiary(): Address { return self.beneficiary; }
  get fun get_is_permanent(): Bool { return self.permanent; }
}
