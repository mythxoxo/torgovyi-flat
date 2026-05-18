import "@stdlib/deploy";

struct JettonMetadata {
    name: String;
    symbol: String;
    description: String;
    image: String;
}

message(0x2001) MintInitialSupply {
    owner: Address;
    bondingCurve: Address;
    liquidityVault: Address;
    platformVestingVault: Address;
}

struct JettonMasterState {
    owner: Address;
    totalSupply: Int as uint128;
    mintDisabled: Bool;
}

contract JettonMaster with Deployable {
    owner: Address;
    totalSupply: Int as uint128;
    mintDisabled: Bool;
    metadata: JettonMetadata;

    init(owner: Address, metadata: JettonMetadata) {
        self.owner = owner;
        self.totalSupply = 1000000000;
        self.mintDisabled = false;
        self.metadata = metadata;
    }

    receive(msg: MintInitialSupply) {
        require(sender() == self.owner, "ONLY_OWNER");
        require(!self.mintDisabled, "MINT_DISABLED");

        // TODO: distribute 80% bonding, 19.5% liquidity, 0.5% platform vesting.
        self.mintDisabled = true;
    }

    get fun getState(): JettonMasterState {
        return JettonMasterState{
            owner: self.owner,
            totalSupply: self.totalSupply,
            mintDisabled: self.mintDisabled
        };
    }
}
