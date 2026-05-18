import "@stdlib/deploy";

struct CreatorTaxConfig {
    rateBps: Int as uint16;
    buybackSplitBps: Int as uint16;
    burnSplitBps: Int as uint16;
}

message(0x1001) CreateToken {
    queryId: Int as uint64;
    name: String;
    ticker: String;
    metadataUri: String;
    creator: Address;
    creatorTax: CreatorTaxConfig;
}

struct FactoryState {
    owner: Address;
    platformTreasury: Address;
    creationFee: Int as coins;
    totalCreated: Int as uint32;
}

contract JettonFactory with Deployable {
    owner: Address;
    platformTreasury: Address;
    creationFee: Int as coins;
    totalCreated: Int as uint32;

    init(owner: Address, platformTreasury: Address) {
        self.owner = owner;
        self.platformTreasury = platformTreasury;
        self.creationFee = ton("1");
        self.totalCreated = 0;
    }

    receive(msg: CreateToken) {
        require(context().value >= self.creationFee, "LOW_CREATION_FEE");
        self.totalCreated = self.totalCreated + 1;

        send(SendParameters{
            to: self.platformTreasury,
            value: self.creationFee,
            bounce: false
        });

        // TODO: deploy JettonMaster, BondingCurve, FeeVault, VestingVault, LiquidityMigrator.
        cashback(sender());
    }

    get fun getState(): FactoryState {
        return FactoryState{
            owner: self.owner,
            platformTreasury: self.platformTreasury,
            creationFee: self.creationFee,
            totalCreated: self.totalCreated
        };
    }
}
