"use client";

import React, { useState } from "react";

interface WalletBadgeProps {
  address?: string;
  username?: string;
  avatarUrl?: string;
  className?: string;
}

function truncateAddress(address: string): string {
  if (!address) return "—";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

const WalletBadge: React.FC<WalletBadgeProps> = ({
  address = "0x0000000000000000000000000000000000000000",
  username,
  avatarUrl,
  className = "",
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <button
      onClick={handleCopy}
      title={copied ? "Copied!" : address}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-all active:scale-95 ${className}`}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt="Avatar" className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
      ) : (
        <div
          className="w-5 h-5 rounded-full flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)`,
          }}
        />
      )}
      <span className="text-xs font-bold text-black font-mono">
        {username || truncateAddress(address)}
      </span>
      <span className="material-symbols-outlined text-[14px] text-gray-400" style={{ fontVariationSettings: "'wght' 300" }}>
        {copied ? "check" : "content_copy"}
      </span>
    </button>
  );
};

export default WalletBadge;
