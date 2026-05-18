import "@stdlib/deploy";

message(0x4001) CreditFees {
    queryId: Int as uint64;
    creator: Address;
    referral: Address?;
    platformAmount: Int as coins;
    creatorAmount: Int as coins;
    referralAmount: Int as coins;
    buybackAmount: Int as coins;
    burnAmount: Int as coins;
}

message(0x4002) ClaimCreator {
    queryId: Int as uint64;
}

message(0x4003) ClaimReferral {
    queryId: Int as uint64;
}

struct FeeVaultState {
    platformTreasury: Address;
    treasuryForwardedTon: Int as coins;
    creatorTaxBuybackTon: Int as coins;
    creatorTaxBurnedTon: Int as coins;
}

contract FeeVault with Deployable {
    platformTreasury: Address;
    treasuryForwardedTon: Int as coins;
    creatorTaxBuybackTon: Int as coins;
    creatorTaxBurnedTon: Int as coins;
    creatorClaimables: map<Address, Int as coins>;
    referralClaimables: map<Address, Int as coins>;
    creatorClaimedTon: map<Address, Int as coins>;
    referralClaimedTon: map<Address, Int as coins>;

    init(platformTreasury: Address) {
        self.platformTreasury = platformTreasury;
        self.treasuryForwardedTon = 0;
        self.creatorTaxBuybackTon = 0;
        self.creatorTaxBurnedTon = 0;
    }

    receive(msg: CreditFees) {
        let creatorExisting = self.creatorClaimables.get(msg.creator);
        let creatorCurrent = 0;
        if (creatorExisting != null) {
            creatorCurrent = creatorExisting!!;
        }
        self.creatorClaimables.set(msg.creator, creatorCurrent + msg.creatorAmount);

        if (msg.referral != null && msg.referralAmount > 0) {
            let referralWallet = msg.referral!!;
            let referralExisting = self.referralClaimables.get(referralWallet);
            let referralCurrent = 0;
            if (referralExisting != null) {
                referralCurrent = referralExisting!!;
            }
            self.referralClaimables.set(referralWallet, referralCurrent + msg.referralAmount);
        }

        self.creatorTaxBuybackTon = self.creatorTaxBuybackTon + msg.buybackAmount;
        self.creatorTaxBurnedTon = self.creatorTaxBurnedTon + msg.burnAmount;

        if (msg.platformAmount > 0) {
            self.treasuryForwardedTon = self.treasuryForwardedTon + msg.platformAmount;
            send(SendParameters{
                to: self.platformTreasury,
                value: msg.platformAmount,
                bounce: false
            });
        }
    }

    receive(msg: ClaimCreator) {
        let claimer = sender();
        let claimable = 0;
        let currentClaimable = self.creatorClaimables.get(claimer);
        if (currentClaimable != null) {
            claimable = currentClaimable!!;
        }
        require(claimable > 0, "NOTHING_TO_CLAIM");

        self.creatorClaimables.set(claimer, 0);
        let alreadyClaimed = 0;
        let claimedSnapshot = self.creatorClaimedTon.get(claimer);
        if (claimedSnapshot != null) {
            alreadyClaimed = claimedSnapshot!!;
        }
        self.creatorClaimedTon.set(claimer, alreadyClaimed + claimable);

        send(SendParameters{
            to: claimer,
            value: claimable,
            bounce: false
        });
    }

    receive(msg: ClaimReferral) {
        let claimer = sender();
        let claimable = 0;
        let currentClaimable = self.referralClaimables.get(claimer);
        if (currentClaimable != null) {
            claimable = currentClaimable!!;
        }
        require(claimable > 0, "NOTHING_TO_CLAIM");

        self.referralClaimables.set(claimer, 0);
        let alreadyClaimed = 0;
        let claimedSnapshot = self.referralClaimedTon.get(claimer);
        if (claimedSnapshot != null) {
            alreadyClaimed = claimedSnapshot!!;
        }
        self.referralClaimedTon.set(claimer, alreadyClaimed + claimable);

        send(SendParameters{
            to: claimer,
            value: claimable,
            bounce: false
        });
    }

    get fun getState(): FeeVaultState {
        return FeeVaultState{
            platformTreasury: self.platformTreasury,
            treasuryForwardedTon: self.treasuryForwardedTon,
            creatorTaxBuybackTon: self.creatorTaxBuybackTon,
            creatorTaxBurnedTon: self.creatorTaxBurnedTon
        };
    }

    get fun getCreatorClaimable(wallet: Address): Int {
        let claimable = self.creatorClaimables.get(wallet);
        if (claimable == null) {
            return 0;
        }

        return claimable!!;
    }

    get fun getReferralClaimable(wallet: Address): Int {
        let claimable = self.referralClaimables.get(wallet);
        if (claimable == null) {
            return 0;
        }

        return claimable!!;
    }
}
