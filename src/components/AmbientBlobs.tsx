type AmbientBlobsProps = {
  opacity?: number;
};

export function AmbientBlobs({ opacity = 1 }: AmbientBlobsProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      style={{ opacity }}
    >
      <div
        className="absolute -top-32 -left-40 h-[700px] w-[700px] rounded-full blur-[120px]"
        style={{ background: "radial-gradient(circle, rgba(247,158,205,0.28) 0%, transparent 70%)" }}
      />
      <div
        className="absolute top-1/4 -right-48 h-[600px] w-[600px] rounded-full blur-[100px]"
        style={{ background: "radial-gradient(circle, rgba(255,200,235,0.22) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full blur-[110px]"
        style={{ background: "radial-gradient(circle, rgba(220,160,200,0.18) 0%, transparent 70%)" }}
      />
    </div>
  );
}
