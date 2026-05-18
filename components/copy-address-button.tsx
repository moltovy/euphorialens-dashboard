"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyAddressButton({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  async function copyAddress() {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <button
      type="button"
      onClick={copyAddress}
      className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-white transition hover:border-euphoria-cyan/50"
      title="Copy wallet address"
    >
      {copied ? <Check size={16} className="text-euphoria-green" /> : <Copy size={16} />}
      {copied ? "Copied" : "Copy address"}
    </button>
  );
}
