import { getLiveProof } from "./live-proof";

export type StatusItem = readonly [string, string];

export type TechnicalStatusView = {
  verified: StatusItem[];
  ready: StatusItem[];
  pending: StatusItem[];
};

export async function getTechnicalStatusView(locale: "ru" | "en"): Promise<TechnicalStatusView> {
  const live = await getLiveProof();

  const verified: StatusItem[] = locale === "ru"
    ? [
        ["Сборка контрактов", "Проверено"],
        ["Верификация контрактов", "Проверено"],
        ["Sandbox buy/mint loop", "Проверено"],
        ["Security check", "Проверено"],
        ["Production build", "Проверено"],
        ["Live buy < 1 TON", live.summary.liveBuyProven ? "Проверено" : "Не подтверждено"]
      ]
    : [
        ["Contracts build", "Verified"],
        ["Contract verification", "Verified"],
        ["Sandbox buy/mint loop", "Verified"],
        ["Security check", "Verified"],
        ["Production build", "Verified"],
        ["Live buy < 1 TON", live.summary.liveBuyProven ? "Verified" : "Unverified"]
      ];

  const ready: StatusItem[] = locale === "ru"
    ? [
        ["Живой pool", live.pool.deployed ? "Активен" : "Не активен"],
        ["Живой jetton", live.jetton.address ? "Задан" : "Не задан"],
        ["Buyer jetton proof", live.summary.buyerJettonsProven ? "Подтверждён" : "Не подтверждён"],
        ["Торговля через bonding pool", live.summary.liveBuyProven ? "Работает" : "Не доказана"]
      ]
    : [
        ["Live pool", live.pool.deployed ? "Active" : "Inactive"],
        ["Live jetton", live.jetton.address ? "Configured" : "Missing"],
        ["Buyer jetton proof", live.summary.buyerJettonsProven ? "Verified" : "Unverified"],
        ["Bonding-pool trading", live.summary.liveBuyProven ? "Working" : "Unproven"]
      ];

  const pending: StatusItem[] = locale === "ru"
    ? [
        ["Factory mainnet deploy", live.factory.deployed ? "Готово" : "Не сделано"],
        ["Live sell", "Не завершён"],
        ["Migration unlock proof", "Не завершён"],
        ["Indexer DB proof", process.env.DATABASE_URL ? "Можно проверить" : "Нужен DATABASE_URL"]
      ]
    : [
        ["Factory mainnet deploy", live.factory.deployed ? "Done" : "Not done"],
        ["Live sell", "Incomplete"],
        ["Migration unlock proof", "Incomplete"],
        ["Indexer DB proof", process.env.DATABASE_URL ? "Verifiable" : "DATABASE_URL required"]
      ];

  return { verified, ready, pending };
}
