import { Address, fromNano, TonClient, TupleBuilder } from "@ton/ton";

const endpoint = () => {
  const apiKey = process.env.TONCENTER_API_KEY || "";
  return apiKey
    ? `https://toncenter.com/api/v2/jsonRPC?api_key=${apiKey}`
    : "https://toncenter.com/api/v2/jsonRPC";
};

let client: TonClient | undefined;

export const getTonClient = () => {
  if (!client) {
    client = new TonClient({ endpoint: endpoint() });
  }
  return client;
};

const readStackBigint = (value: unknown): bigint => {
  if (typeof value === "bigint") return value;
  if (typeof value === "number") return BigInt(value);
  if (typeof value === "string") return BigInt(value);
  throw new Error("Unsupported stack value");
};

export const getPoolState = async (poolAddress: string) => {
  const ton = getTonClient();
  const address = Address.parse(poolAddress);

  const [collected, target, sold, creator, jettonMaster, graduated, listed, lpLock] = await Promise.all([
    ton.runMethod(address, "get_collected_ton"),
    ton.runMethod(address, "get_target_ton"),
    ton.runMethod(address, "get_sold_tokens"),
    ton.runMethod(address, "get_creator"),
    ton.runMethod(address, "get_jetton_master"),
    ton.runMethod(address, "get_is_graduated"),
    ton.runMethod(address, "get_is_listed"),
    ton.runMethod(address, "get_lp_lock")
  ]);

  return {
    poolAddress,
    collectedTon: Number(fromNano(readStackBigint(collected.stack.readBigNumber()))),
    targetTon: Number(fromNano(readStackBigint(target.stack.readBigNumber()))),
    soldTokens: Number(readStackBigint(sold.stack.readBigNumber())),
    creator: creator.stack.readAddress().toString({ bounceable: true, testOnly: false }),
    jettonMaster: jettonMaster.stack.readAddress().toString({ bounceable: true, testOnly: false }),
    isGraduated: Boolean(graduated.stack.readBoolean()),
    isListed: Boolean(listed.stack.readBoolean()),
    lpLock: lpLock.stack.readAddress().toString({ bounceable: true, testOnly: false })
  };
};

export const getFactoryPoolCount = async (factoryAddress: string) => {
  const ton = getTonClient();
  const result = await ton.runMethod(Address.parse(factoryAddress), "get_pool_count");
  return Number(readStackBigint(result.stack.readBigNumber()));
};

export const getFactoryPoolAddress = async (factoryAddress: string, index: number) => {
  const ton = getTonClient();
  const tuple = new TupleBuilder();
  tuple.writeNumber(index);
  const result = await ton.runMethod(Address.parse(factoryAddress), "get_pool_address", tuple.build());
  return result.stack.readAddress().toString({ bounceable: true, testOnly: false });
};

export const getRecentTransactions = async (address: string, limit = 20) => {
  const ton = getTonClient();
  return ton.getTransactions(Address.parse(address), { limit });
};

export const getContractState = async (address: string) => {
  const ton = getTonClient();
  return ton.getContractState(Address.parse(address));
};
