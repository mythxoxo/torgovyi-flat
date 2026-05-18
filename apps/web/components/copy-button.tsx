"use client";

import { useState } from "react";

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      }}
      className="rounded-md border border-[#0088cc]/30 px-2 py-1 text-xs text-[#0088cc]"
    >
      {copied ? "OK" : "Copy"}
    </button>
  );
}
