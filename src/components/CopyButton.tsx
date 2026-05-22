'use client';

import { useState } from 'react';

type CopyButtonProps = {
  label: string;
  value: string;
  className?: string;
};

export default function CopyButton({ label, value, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1300);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-5 py-2.5 text-base font-bold text-white shadow-lg shadow-black/20 transition duration-300 hover:-translate-y-0.5 hover:border-orange-300/50 hover:bg-orange-500/20 ${className}`}
    >
      <span aria-hidden="true">{copied ? '✓' : '⧉'}</span>
      <span className="min-w-16">{copied ? 'Copied!' : label}</span>
    </button>
  );
}
