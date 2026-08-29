import { cn } from "@/lib/utils";

export function Sparkline({
  points,
  className,
  rising,
}: {
  points: number[];
  className?: string;
  rising: boolean;
}) {
  if (points.length < 2) {
    return <div className={cn("h-10", className)} />;
  }
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const w = 120;
  const h = 40;
  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p - min) / span) * (h - 4) - 2;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn("h-10 w-full", className)} aria-hidden>
      <path
        d={d}
        fill="none"
        stroke={rising ? "var(--color-up)" : "var(--color-down)"}
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
