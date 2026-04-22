export function BraceletIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      className={className}
      aria-hidden="true"
    >
      <ellipse cx="12" cy="12" rx="7.5" ry="5.5" />
      <ellipse cx="12" cy="12" rx="4" ry="2.8" strokeOpacity="0.55" />
      <circle cx="12" cy="6.4" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="4.8" cy="12" r="1.05" fill="currentColor" stroke="none" />
      <circle cx="19.2" cy="12" r="1.05" fill="currentColor" stroke="none" />
      <circle cx="12" cy="17.6" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  );
}
