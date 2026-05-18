export class JettonWallet {
  public constructor(
    public readonly owner: string,
    public balance: number
  ) {}

  public credit(amount: number): void {
    this.balance += amount;
  }

  public debit(amount: number): void {
    if (amount > this.balance) {
      throw new Error("JettonWallet: insufficient balance");
    }

    this.balance -= amount;
  }
}
