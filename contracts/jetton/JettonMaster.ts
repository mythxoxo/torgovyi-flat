import { TOTAL_SUPPLY } from "@meme-launchpad/shared";

import { JettonWallet } from "./JettonWallet";

export class JettonMaster {
  public readonly totalSupply = TOTAL_SUPPLY;
  public readonly mintDisabled = true;
  public readonly metadata: Record<string, string>;

  public constructor(metadata: Record<string, string>) {
    this.metadata = metadata;
  }

  public deployWallet(owner: string, initialBalance = 0): JettonWallet {
    return new JettonWallet(owner, initialBalance);
  }
}
