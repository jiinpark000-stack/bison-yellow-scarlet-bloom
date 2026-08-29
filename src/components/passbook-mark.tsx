export function PassbookMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 88 88" className={className} aria-hidden>
      <rect x="8" y="14" width="72" height="60" rx="10" fill="var(--color-surface)" stroke="var(--color-border-strong)" />
      <rect x="8" y="14" width="10" height="60" rx="4" fill="var(--color-primary)" />
      <rect x="26" y="28" width="42" height="4" rx="2" fill="var(--color-border-strong)" />
      <rect x="26" y="38" width="34" height="4" rx="2" fill="var(--color-border)" />
      <rect x="26" y="48" width="38" height="4" rx="2" fill="var(--color-border)" />
      <circle cx="64" cy="58" r="10" fill="var(--color-primary)" />
      <path d="M60 58.5l3 3 6-7" fill="none" stroke="var(--color-primary-foreground)" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
