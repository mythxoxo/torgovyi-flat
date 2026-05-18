import "@stdlib/deploy";

message(0x3001) Buy {
    queryId: Int as uint64;
    referral: Address?;
    minTokensOut: Int as uint128;
}

message(0x3002) Sell {
    queryId: Int as uint64;
    tokenAmount: Int as uint128;
    referral: Address?;
    minTonOut: Int as coins;
}

message(0x3003) Graduate {
    queryId: Int as uint64;
}

struct BondingState {
    creator: Address;
    reserveTon: Int as coins;
    soldSupply: Int as uint128;
    graduated: Bool;
}

contract BondingCurve with Deployable {
    creator: Address;
    feeVault: Address;
    liquidityMigrator: Address;
    reserveTon: Int as coins;
    soldSupply: Int as uint128;
    graduated: Bool;

    init(creator: Address, feeVault: Address, liquidityMigrator: Address) {
        self.creator = creator;
        self.feeVault = feeVault;
        self.liquidityMigrator = liquidityMigrator;
        self.reserveTon = 0;
        self.soldSupply = 0;
        self.graduated = false;
    }

    receive(msg: Buy) {
        require(!self.graduated, "BONDING_CLOSED");
        // TODO: calculate deterministic buy quote, split fees, mint/transfer jettons.
        self.reserveTon = self.reserveTon + context().value;
    }

    receive(msg: Sell) {
        require(!self.graduated, "BONDING_CLOSED");
        // TODO: calculate sell quote, burn/collect jettons, transfer TON out.
    }

    receive(msg: Graduate) {
        require(!self.graduated, "ALREADY_GRADUATED");
        // TODO: enforce reserve threshold and call LiquidityMigrator.
        self.graduated = true;
    }

    get fun getState(): BondingState {
        return BondingState{
            creator: self.creator,
            reserveTon: self.reserveTon,
            soldSupply: self.soldSupply,
            graduated: self.graduated
        };
    }
}
