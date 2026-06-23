const MIN_SUPPLY: Int = 1;

message CreateToken {
  name: String;
  symbol: String;
  description: String;
  imageUrl: String;
  totalSupply: Int as uint128;
  creator: Address;
  curveTarget: Int as coins;
  minBuy: Int as coins;
  feeBps: Int as uint16;
}

message RegisterPool {
  pool: Address;
  jettonMaster: Address;
  creator: Address;
}

struct LaunchRecord {
  creator: Address;
  pool: Address;
  jettonMaster: Address;
  hasToken: Bool;
  hasPool: Bool;
}

contract LaunchpadFactory {
  owner: Address;
  poolCount: Int as uint32;
  launchCount: Int as uint32;
  pools: map<Int, Address>;
  jettons: map<Int, Address>;
  creators: map<Int, Address>;
  launches: map<Int, LaunchRecord>;
  creatorLaunches: map<Address, Int>;
  poolLaunches: map<Address, Int>;
  jettonLaunches: map<Address, Int>;

  init(owner: Address) {
    self.owner = owner;
    self.poolCount = 0;
    self.launchCount = 0;
  }

  receive(msg: CreateToken) {
    require(sender() == msg.creator, "creator mismatch");
    require(msg.totalSupply >= MIN_SUPPLY, "invalid supply");
    require(msg.curveTarget > 0, "invalid target");
    require(msg.minBuy > 0, "invalid min buy");
    require(msg.feeBps <= 1000, "fee too high");
    require(!self.creatorLaunches.exists(msg.creator), "duplicate launch");

    let launchId = self.launchCount;
    self.launches.set(launchId, LaunchRecord {
      creator: msg.creator,
      pool: msg.creator,
      jettonMaster: msg.creator,
      hasToken: false,
      hasPool: false,
    });
    self.creatorLaunches.set(msg.creator, launchId);
    self.launchCount = self.launchCount + 1;
  }

  receive(msg: RegisterPool) {
    let senderAddress = sender();
    require(senderAddress == msg.creator || senderAddress == self.owner, "creator mismatch");
    require(self.creatorLaunches.exists(msg.creator), "launch missing");
    require(!self.poolLaunches.exists(msg.pool), "duplicate pool");
    require(!self.jettonLaunches.exists(msg.jettonMaster), "duplicate jetton");

    let launchId = self.creatorLaunches.get(msg.creator)!!;
    let launch = self.launches.get(launchId)!!;
    require(launch.creator == msg.creator, "launch mismatch");
    require(!launch.hasPool, "pool already registered");
    require(!launch.hasToken, "token already registered");

    launch.pool = msg.pool;
    launch.jettonMaster = msg.jettonMaster;
    launch.hasPool = true;
    launch.hasToken = true;
    self.launches.set(launchId, launch);

    self.pools.set(self.poolCount, msg.pool);
    self.jettons.set(self.poolCount, msg.jettonMaster);
    self.creators.set(self.poolCount, msg.creator);
    self.poolLaunches.set(msg.pool, launchId);
    self.jettonLaunches.set(msg.jettonMaster, launchId);
    self.poolCount = self.poolCount + 1;
  }

  get fun get_pool_count(): Int {
    return self.poolCount;
  }

  get fun get_launch_count(): Int {
    return self.launchCount;
  }

  get fun get_pool_address(index: Int): Address {
    require(index >= 0 && index < self.poolCount, "index out of range");
    return self.pools.get(index)!!;
  }

  get fun get_pool_jetton(index: Int): Address {
    require(index >= 0 && index < self.poolCount, "index out of range");
    return self.jettons.get(index)!!;
  }

  get fun get_pool_creator(index: Int): Address {
    require(index >= 0 && index < self.poolCount, "index out of range");
    return self.creators.get(index)!!;
  }

  get fun get_owner(): Address {
    return self.owner;
  }

  get fun get_creator_launch_id(creator: Address): Int {
    require(self.creatorLaunches.exists(creator), "launch missing");
    return self.creatorLaunches.get(creator)!!;
  }

  get fun get_launch_record(index: Int): LaunchRecord {
    require(index >= 0 && index < self.launchCount, "index out of range");
    return self.launches.get(index)!!;
  }

  get fun is_pool_registered(pool: Address): Bool {
    return self.poolLaunches.exists(pool);
  }

  get fun is_jetton_registered(jettonMaster: Address): Bool {
    return self.jettonLaunches.exists(jettonMaster);
  }
}
