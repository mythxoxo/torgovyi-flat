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

contract LaunchpadFactory {
  owner: Address;
  poolCount: Int as uint32;
  pools: map<Int, Address>;
  jettons: map<Int, Address>;
  creators: map<Int, Address>;

  init(owner: Address) {
    self.owner = owner;
    self.poolCount = 0;
  }

  receive(msg: CreateToken) {
    require(sender() == msg.creator, "creator mismatch");
    require(msg.totalSupply >= MIN_SUPPLY, "invalid supply");
    require(msg.curveTarget > 0, "invalid target");
    require(msg.minBuy > 0, "invalid min buy");
    require(msg.feeBps <= 1000, "fee too high");
  }

  receive(msg: RegisterPool) {
    require(sender() == msg.creator || sender() == self.owner, "creator mismatch");
    self.pools.set(self.poolCount, msg.pool);
    self.jettons.set(self.poolCount, msg.jettonMaster);
    self.creators.set(self.poolCount, msg.creator);
    self.poolCount = self.poolCount + 1;
  }

  get fun get_pool_count(): Int {
    return self.poolCount;
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
}
