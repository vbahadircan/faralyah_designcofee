import { Check, Copy, Wifi } from 'lucide-react';
import { useEffect, useState } from 'react';
import { tr } from '@/content/tr';

/** TODO(owner): replace with the cafe's real Wi-Fi password. This is the demo value from the mock-up. */
export const WIFI_PASSWORD = 'artcoffee2024';

export function WifiCard({ password = WIFI_PASSWORD }: { password?: string }) {
  const t = tr.welcomeAlt.wifi;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
    } catch {
      // Clipboard can be blocked (insecure origin, permissions); the password stays visible.
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-rule bg-background px-3 py-2 shadow-card">
      <span
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-pill bg-tint text-burgundy"
      >
        <Wifi className="size-5" />
      </span>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="text-xs text-muted-foreground">{t.label}</p>
        <p className="truncate font-display text-base font-bold text-burgundy">{password}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        aria-label={t.copy}
        className="flex size-11 shrink-0 items-center justify-center rounded-md text-burgundy transition-colors [@media(hover:hover)]:hover:bg-tint"
      >
        {copied ? (
          <Check className="size-5" aria-hidden="true" />
        ) : (
          <Copy className="size-5" aria-hidden="true" />
        )}
      </button>
      <span role="status" className="sr-only">
        {copied ? t.copied : ''}
      </span>
    </div>
  );
}
