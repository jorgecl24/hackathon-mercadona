/**
 * Interpretacion minima del campo opening_hours de OSM para la demo:
 * reconoce bloques "Mo-Sa 09:00-21:30" y "Su 10:00-15:00" separados por ";".
 * Devuelve la hora de cierre de hoy si la tienda esta abierta ahora, null
 * si esta cerrada. Horarios mas raros caen al valor por defecto (abierta
 * hasta las 21:30), suficiente para la demo.
 */
const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

function parseBlock(block: string, dow: string): string | null {
  const [daysPart, timePart] = block.split(/\s+/, 2);
  if (!daysPart || !timePart) return null;

  const days = daysPart.split(",").flatMap((span) => {
    const [a, b] = span.split("-");
    if (!b) return [a];
    const i = DOW.indexOf(a as (typeof DOW)[number]);
    const j = DOW.indexOf(b as (typeof DOW)[number]);
    if (i < 0 || j < 0) return [];
    return DOW.slice(i, j + 1);
  });
  if (!days.includes(dow)) return null;

  const [, end] = timePart.split("-");
  return end ?? null;
}

export function closesAtToday(oh: string | undefined, now = new Date()): string | null {
  if (!oh) return "21:30";
  const dow = DOW[now.getDay()];
  for (const block of oh.split(";").map((b) => b.trim()).filter(Boolean)) {
    const end = parseBlock(block, dow);
    if (!end) continue;
    const [eh, em] = end.split(":").map(Number);
    const closes = eh * 60 + (em || 0);
    const nowMin = now.getHours() * 60 + now.getMinutes();
    if (nowMin < closes) return end;
  }
  return null;
}
