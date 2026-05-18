"use client";

import { useMemo, useState } from "react";
import type { TokenRecord } from "@meme-launchpad/shared";

import { FilterTabs } from "./filter-tabs";
import { SearchBar } from "./search-bar";
import { TokenGrid } from "./token-grid";

export function MarketView({ tokens }: { tokens: TokenRecord[] }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredTokens = useMemo(
    () =>
      normalizedQuery
        ? tokens.filter(
            (token) =>
              token.name.toLowerCase().includes(normalizedQuery) ||
              token.ticker.toLowerCase().includes(normalizedQuery)
          )
        : tokens,
    [normalizedQuery, tokens]
  );

  return (
    <>
      <FilterTabs />
      <SearchBar value={query} onChange={setQuery} />
      <TokenGrid tokens={filteredTokens} hasQuery={Boolean(normalizedQuery)} />
    </>
  );
}
