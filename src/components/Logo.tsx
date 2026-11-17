export function Asterisk({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="square">
      <path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9" />
    </svg>
  );
}
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center font-display text-lg font-black uppercase italic tracking-tight text-brand ${className}`}>
      CHVMP
      <span className="ml-0.5 inline-flex items-center gap-1 rounded-full border-2 border-brand bg-background py-0 pl-2 pr-0.5">
        BUZZ
        <span className="grid h-5 w-5 place-items-center rounded-full border-2 border-brand"><Asterisk className="h-3 w-3" /></span>
      </span>
    </span>
  );
}
