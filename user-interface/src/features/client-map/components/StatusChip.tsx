import { STATUS } from "../availability";
import type { Availability } from "../types";

export function StatusChip({ a }: { a: Availability }) {
  const s = STATUS[a];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold"
      style={{ background: s.color, color: s.fg }}
    >
      <s.icon className="size-4" aria-hidden />
      {s.label}
    </span>
  );
}
