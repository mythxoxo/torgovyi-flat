import "@stdlib/deploy";

message(0x5001) StartVesting {
    queryId: Int as uint64;
    graduatedAt: Int as uint64;
}

message(0x5002) ClaimUnlocked {
    queryId: Int as uint64;
}

struct PlatformVestingState {
    platformTreasury: Address;
    totalAllocation: Int as uint128;
    immediateUnlockAmount: Int as uint128;
    linearUnlockAmount: Int as uint128;
    claimed: Int as uint128;
    graduatedAt: Int as uint64;
}

contract PlatformVestingVault with Deployable {
    platformTreasury: Address;
    totalAllocation: Int as uint128;
    immediateUnlockAmount: Int as uint128;
    linearUnlockAmount: Int as uint128;
    claimed: Int as uint128;
    graduatedAt: Int as uint64;

    init(platformTreasury: Address) {
        self.platformTreasury = platformTreasury;
        self.totalAllocation = 5000000;
        self.immediateUnlockAmount = 2500000;
        self.linearUnlockAmount = 2500000;
        self.claimed = 0;
        self.graduatedAt = 0;
    }

    fun unlockedAt(at: Int): Int {
        if (self.graduatedAt == 0 || at <= self.graduatedAt) {
            return 0;
        }

        let elapsed = at - self.graduatedAt;
        let vestingDuration = 60 * 24 * 60 * 60;
        if (elapsed >= vestingDuration) {
            return self.totalAllocation;
        }

        return self.immediateUnlockAmount + (self.linearUnlockAmount * elapsed) / vestingDuration;
    }

    receive(msg: StartVesting) {
        require(self.graduatedAt == 0, "VESTING_ALREADY_STARTED");
        self.graduatedAt = msg.graduatedAt;
    }

    receive(msg: ClaimUnlocked) {
        require(self.graduatedAt > 0, "VESTING_NOT_STARTED");
        require(sender() == self.platformTreasury, "ONLY_TREASURY");

        let unlocked = self.unlockedAt(now());
        require(unlocked > self.claimed, "NOTHING_TO_CLAIM");
        let claimable = unlocked - self.claimed;
        self.claimed = self.claimed + claimable;

        // TODO: transfer unlocked platform jettons from this vault to platformTreasury.
        cashback(sender());
    }

    get fun getState(): PlatformVestingState {
        return PlatformVestingState{
            platformTreasury: self.platformTreasury,
            totalAllocation: self.totalAllocation,
            immediateUnlockAmount: self.immediateUnlockAmount,
            linearUnlockAmount: self.linearUnlockAmount,
            claimed: self.claimed,
            graduatedAt: self.graduatedAt
        };
    }

    get fun getClaimable(nowTs: Int): Int {
        let unlocked = self.unlockedAt(nowTs);
        if (unlocked <= self.claimed) {
            return 0;
        }

        return unlocked - self.claimed;
    }
}
