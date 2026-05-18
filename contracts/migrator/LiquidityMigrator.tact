import "@stdlib/deploy";

message(0x6001) MigrateLiquidity {
    queryId: Int as uint64;
    creator: Address;
    reserveTon: Int as coins;
    liquidityTokens: Int as uint128;
}

message(0x6002) FinalizeMigration {
    queryId: Int as uint64;
    lpLocked: Bool;
}

struct LiquidityMigratorState {
    platformTreasury: Address;
    stonfiRouter: Address;
    lastCreator: Address?;
    lastReserveTon: Int as coins;
    lastLiquidityTon: Int as coins;
    lastLiquidityTokens: Int as uint128;
    migrationPrepared: Bool;
    migratedAt: Int as uint64;
    lpLocked: Bool;
}

contract LiquidityMigrator with Deployable {
    platformTreasury: Address;
    stonfiRouter: Address;
    lastCreator: Address?;
    lastReserveTon: Int as coins;
    lastLiquidityTon: Int as coins;
    lastLiquidityTokens: Int as uint128;
    migrationPrepared: Bool;
    migratedAt: Int as uint64;
    lpLocked: Bool;

    init(platformTreasury: Address, stonfiRouter: Address) {
        self.platformTreasury = platformTreasury;
        self.stonfiRouter = stonfiRouter;
        self.lastCreator = null;
        self.lastReserveTon = 0;
        self.lastLiquidityTon = 0;
        self.lastLiquidityTokens = 0;
        self.migrationPrepared = false;
        self.migratedAt = 0;
        self.lpLocked = false;
    }

    receive(msg: MigrateLiquidity) {
        require(msg.reserveTon > ton("31"), "INSUFFICIENT_RESERVE");
        require(context().value >= msg.reserveTon, "INSUFFICIENT_ATTACHED_VALUE");

        let liquidityTon = msg.reserveTon - ton("31");
        self.lastCreator = msg.creator;
        self.lastReserveTon = msg.reserveTon;
        self.lastLiquidityTon = liquidityTon;
        self.lastLiquidityTokens = msg.liquidityTokens;
        self.migrationPrepared = true;
        self.migratedAt = 0;
        self.lpLocked = false;

        send(SendParameters{
            to: self.platformTreasury,
            value: ton("30"),
            bounce: false
        });

        send(SendParameters{
            to: msg.creator,
            value: ton("1"),
            bounce: false
        });

        // TODO:
        // 1. call real STON.fi router with remaining reserve and liquidityTokens
        // 2. lock or burn LP
        // 3. mark migration finalized only after router success
    }

    receive(msg: FinalizeMigration) {
        require(sender() == self.platformTreasury, "ONLY_TREASURY");
        require(self.migrationPrepared, "MIGRATION_NOT_PREPARED");
        require(self.migratedAt == 0, "MIGRATION_ALREADY_FINALIZED");

        self.migratedAt = now();
        self.lpLocked = msg.lpLocked;
    }

    get fun getState(): LiquidityMigratorState {
        return LiquidityMigratorState{
            platformTreasury: self.platformTreasury,
            stonfiRouter: self.stonfiRouter,
            lastCreator: self.lastCreator,
            lastReserveTon: self.lastReserveTon,
            lastLiquidityTon: self.lastLiquidityTon,
            lastLiquidityTokens: self.lastLiquidityTokens,
            migrationPrepared: self.migrationPrepared,
            migratedAt: self.migratedAt,
            lpLocked: self.lpLocked
        };
    }
}
