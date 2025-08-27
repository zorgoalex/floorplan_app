import { FIELD, GRID, COLUMN_DIAM } from "@/lib/constants";

export function useViewportScale(): number {
  return 28; // 1 m = 28 px
}

export function metersToPx(m: number, scale: number) { return m * scale; }
export function pxToMeters(px: number, scale: number) { return px / scale; }

// Accept only numbers > min, round to 1 decimal, and clamp to 1 decimal precision
export function metersNumber(v: string, min = 0): number | null {
  const raw = v.replace(",", ".").trim();
  if (!/^\d+(?:[\.,]\d)?$/.test(raw)) return null; // max one decimal
  const n = Math.round(Number(raw) * 10) / 10;
  if (Number.isFinite(n) && n > min) return n;
  return null;
}

export function buildField() {
  const width = FIELD.topRow * FIELD.blockW;   // 36
  const height = 2 * FIELD.blockH;             // 32
  const blocks: { id: string; x: number; y: number; w: number; h: number }[] = [];
  for (let i = 0; i < FIELD.topRow; i++) blocks.push({ id: `T${i}`, x: i * FIELD.blockW, y: 0, w: FIELD.blockW, h: FIELD.blockH });
  for (let i = 0; i < FIELD.bottomRow; i++) blocks.push({ id: `B${i}`, x: (i + 1) * FIELD.blockW, y: FIELD.blockH, w: FIELD.blockW, h: FIELD.blockH });
  return { width, height, blocks };
}

export function gridLinesBuilder(field = buildField()) {
  return (scale: number) => {
    const lines: { id: string; x1: number; y1: number; x2: number; y2: number }[] = [];
    const wPx = metersToPx(field.width, scale);
    const hPx = metersToPx(field.height, scale);
    // vertical every 1 m (displayStep)
    for (let m = 0; m <= field.width; m += GRID.displayStep) {
      const x = metersToPx(m, scale);
      lines.push({ id: `v${m}`, x1: x, y1: 0, x2: x, y2: hPx });
    }
    // horizontal every 1 m (displayStep)
    for (let m = 0; m <= field.height; m += GRID.displayStep) {
      const y = metersToPx(m, scale);
      lines.push({ id: `h${m}`, x1: 0, y1: y, x2: wPx, y2: y });
    }
    return lines;
  };
}

export function columnsBuilder(field = buildField()) {
  return (scale: number) => {
    const items: { id: string; cx: number; cy: number; r: number }[] = [];
    const r = metersToPx(COLUMN_DIAM / 2, scale);
    for (let i = 0; i < FIELD.topRow - 1; i++) items.push({ id: `ct${i}`, cx: metersToPx((i + 1) * FIELD.blockW, scale), cy: metersToPx(FIELD.blockH / 2, scale), r });
    for (let i = 0; i < FIELD.bottomRow - 1; i++) items.push({ id: `cb${i}`, cx: metersToPx((i + 2) * FIELD.blockW, scale), cy: metersToPx(FIELD.blockH + FIELD.blockH / 2, scale), r });
    for (let i = 0; i < FIELD.bottomRow; i++) items.push({ id: `cv${i}`, cx: metersToPx((i + 1) * FIELD.blockW, scale), cy: metersToPx(FIELD.blockH, scale), r });
    return items;
  };
}

export const field = buildField();
export const gridLines = gridLinesBuilder(field);
export const columns = columnsBuilder(field);

export function withinDeleteZone(pxX: number, pxY: number, container: DOMRect) {
  const zx = container.right - 24 - 160;
  const zy = container.bottom - 24 - 48;
  return pxX >= zx && pxY >= zy;
}
