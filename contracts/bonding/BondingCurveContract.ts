import {
  canTradeOnBondingCurve,
  createInitialBondingState,
  graduationPreview,
  quoteBuy,
  quoteSell
} from "@meme-launchpad/shared";
import type { BondingState, BuyQuote, CreatorTaxConfig, SellQuote, TokenStatus } from "@meme-launchpad/shared";

export class BondingCurveContract {
  public state: BondingState;
  public status: TokenStatus = "BONDING";

  public constructor(public readonly creatorTax: CreatorTaxConfig) {
    this.state = createInitialBondingState();
  }

  public getBuyQuote(tonAmount: number, referralWallet?: string): BuyQuote {
    return quoteBuy(this.state, tonAmount, this.creatorTax, referralWallet);
  }

  public getSellQuote(tokenAmount: number, referralWallet?: string): SellQuote {
    return quoteSell(this.state, tokenAmount, this.creatorTax, referralWallet);
  }

  public buy(tonAmount: number, referralWallet?: string): BuyQuote {
    if (!canTradeOnBondingCurve(this.status)) {
      throw new Error("BondingCurveContract: bonding trading is closed");
    }

    const quote = this.getBuyQuote(tonAmount, referralWallet);
    this.state = quote.newState;
    return quote;
  }

  public sell(tokenAmount: number, referralWallet?: string): SellQuote {
    if (!canTradeOnBondingCurve(this.status)) {
      throw new Error("BondingCurveContract: bonding trading is closed");
    }

    const quote = this.getSellQuote(tokenAmount, referralWallet);
    this.state = quote.newState;
    return quote;
  }

  public canGraduate(): boolean {
    return this.state.canGraduate;
  }

  public graduate() {
    if (this.status !== "BONDING") {
      throw new Error("BondingCurveContract: already graduated");
    }

    if (!this.canGraduate()) {
      throw new Error("BondingCurveContract: graduation threshold not reached");
    }

    this.status = "GRADUATED";
    return graduationPreview(this.state);
  }
}
