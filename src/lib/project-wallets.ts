import { Address } from "@ton/core";

export type ProjectWalletRole = "treasury" | "owner" | "deployer" | "operator" | "liquidity";

export type ProjectWalletConfig = {
  treasury?: string;
  owner?: string;
  deployer?: string;
  operator?: string;
  liquidity?: string;
};

function readAddress(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : undefined;
}

export function getProjectWallets(): ProjectWalletConfig {
  return {
    treasury: readAddress("TONK_TREASURY_ADDRESS"),
    owner: readAddress("TONK_OWNER_ADDRESS"),
    deployer: readAddress("TONK_DEPLOYER_ADDRESS"),
    operator: readAddress("TONK_OPERATOR_ADDRESS"),
    liquidity: readAddress("TONK_LIQUIDITY_ADDRESS")
  };
}

export function validateProjectWallets() {
  const wallets = getProjectWallets();
  const missing: string[] = [];
  const invalid: string[] = [];

  for (const [role, address] of Object.entries(wallets)) {
    if (!address) {
      missing.push(role);
      continue;
    }
    try {
      Address.parse(address);
    } catch {
      invalid.push(role);
    }
  }

  return {
    ok: missing.length === 0 && invalid.length === 0,
    missing,
    invalid,
    wallets
  };
}

export function maskAddress(address?: string): string {
  if (!address) return "not set";
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}
