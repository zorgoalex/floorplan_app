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
  // Одинаковые ряды: 6 блоков в верхнем и нижнем рядах, выровнены по левому краю
  const width = FIELD.bottomRow * FIELD.blockW;   // 6 * 6 = 36 м
  const height = 2 * FIELD.blockH;                // 2 * 16 = 32 м
  const blocks: { id: string; x: number; y: number; w: number; h: number }[] = [];

  // Верхний ряд: 6 блоков, начиная с x=0
  for (let i = 0; i < FIELD.topRow; i++) {
    blocks.push({
      id: `T${i}`,
      x: i * FIELD.blockW,
      y: 0,
      w: FIELD.blockW,
      h: FIELD.blockH
    });
  }

  // Нижний ряд: 6 блоков, начиная с x=0
  for (let i = 0; i < FIELD.bottomRow; i++) {
    blocks.push({
      id: `B${i}`,
      x: i * FIELD.blockW,
      y: FIELD.blockH,
      w: FIELD.blockW,
      h: FIELD.blockH
    });
  }

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

    // При 6×6 блоках столбы на границе между рядами (y = FIELD.blockH)
    // в местах вертикальных швов: x = 6,12,18,24,30 (5 столбов)
    for (let x = FIELD.blockW; x <= (FIELD.bottomRow - 1) * FIELD.blockW; x += FIELD.blockW) {
      items.push({ id: `column_${x}`, cx: metersToPx(x, scale), cy: metersToPx(FIELD.blockH, scale), r });
    }
    return items;
  };
}

export const field = buildField();
export const gridLines = gridLinesBuilder(field);
export const columns = columnsBuilder(field);

// Обновленная функция для проверки попадания в зону удаления в сайдбаре
export function withinDeleteZone(pxX: number, pxY: number, _container: DOMRect) {
  // Привязка к реальному DOM-элементу зоны удаления в сайдбаре
  const el = typeof document !== 'undefined' ? document.getElementById('delete-zone') : null;
  if (el) {
    const r = el.getBoundingClientRect();
    return pxX >= r.left && pxX <= r.right && pxY >= r.top && pxY <= r.bottom;
  }
  // Fallback: нижняя правая область окна на ширину 240px и высоту 900px
  const vw = typeof window !== 'undefined' ? window.innerWidth : 0;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 0;
  const left = vw - 240;
  const right = vw;
  const top = Math.max(0, vh - 900); // увеличить высоту в 3 раза
  return pxX >= left && pxX <= right && pxY >= top;
}
