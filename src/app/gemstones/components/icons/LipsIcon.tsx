export function LipsIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 8c-2-1.8-5-1.7-6 0-1 1.6 1.1 4.1 3.1 5.1.7.4 2 1.1 2.9 1.1s2.2-.7 2.9-1.1c2-1 4.1-3.5 3.1-5.1-1-1.7-4-1.8-6 0Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M6.4 8.4c.2 1.7 1.8 3.1 3.2 3.8" strokeLinecap="round" />
      <path d="M17.6 8.4c-.2 1.7-1.8 3.1-3.2 3.8" strokeLinecap="round" />
    </svg>
  );
}
