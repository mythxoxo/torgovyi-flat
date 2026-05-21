import { Address } from "@ton/core";

export function normalizeTonAddress(value: string): string {
  return Address.parse(value).toRawString();
}

export function sameTonAddress(a: string, b: string): boolean {
  return normalizeTonAddress(a) === normalizeTonAddress(b);
}

export function formatAddressVariants(value: string) {
  const address = Address.parse(value);
  return {
    raw: address.toRawString(),
    bounceable: address.toString({ bounceable: true, urlSafe: true, testOnly: false }),
    nonBounceable: address.toString({ bounceable: false, urlSafe: true, testOnly: false })
  };
}
