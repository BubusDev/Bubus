"use client";

export default function ShowcaseError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h2 style={{ color: "red", marginBottom: "1rem" }}>Hiba a homepage-showcase oldalon</h2>
      <pre style={{ background: "#fee", padding: "1rem", borderRadius: "4px", overflow: "auto", fontSize: "13px" }}>
        {error.message}
        {"\n\n"}
        {error.stack}
      </pre>
      {error.digest && (
        <p style={{ marginTop: "0.5rem", fontSize: "12px", color: "#666" }}>
          Digest: {error.digest}
        </p>
      )}
    </div>
  );
}
