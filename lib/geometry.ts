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
  // Общая ширина поля = нижний ряд (6 блоков)
  const width = FIELD.bottomRow * FIELD.blockW;   // 6 * 6 = 36 м
  const height = 2 * FIELD.blockH;                // 2 * 16 = 32 м
  const blocks: { id: string; x: number; y: number; w: number; h: number; special?: boolean }[] = [];
  
  // Верхний ряд: 5 блоков + 1 специальный (сдвиг на 1 блок вправо)
  for (let i = 0; i < FIELD.topRow; i++) {
    blocks.push({
      id: `T${i}`,
      x: (i + 1) * FIELD.blockW, // сдвиг на 1 блок вправо
      y: 0,
      w: FIELD.blockW,
      h: FIELD.blockH
    });
  }
  
  // Специальный 6-й блок в верхнем ряду (имитация отсутствия)
  blocks.push({
    id: 'T_special',
    x: 0,
    y: 0,
    w: FIELD.blockW,
    h: FIELD.blockH,
    special: true // маркер для специального оформления
  });
  
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
    
    // Столбы только между верхним и нижним рядом прямоугольников
    // Размещаются на границе между рядами (y = FIELD.blockH) там, где пересекаются блоки
    
    // Верхний ряд: блоки от x=0 до x=36 (6 блоков по 6м)
    // Нижний ряд: блоки от x=6 до x=36 (5 блоков по 6м, сдвиг на 6м)
    // Пересечение: от x=6 до x=36
    
    // Новая конфигурация: 
    // Верхний ряд: 5 блоков от x=6 до x=36
    // Нижний ряд: 6 блоков от x=0 до x=36
    // Пересечение: от x=6 до x=36
    
    // Столбы на стыках между блоками в зоне пересечения
    for (let x = 12; x <= 30; x += 6) { // x=12,18,24,30 (4 столба)
      items.push({
        id: `column_${x}`,
        cx: metersToPx(x, scale),
        cy: metersToPx(FIELD.blockH, scale), // на границе между рядами
        r
      });
    }
    
    return items;
  };
}

export const field = buildField();
export const gridLines = gridLinesBuilder(field);
export const columns = columnsBuilder(field);

// Обновленная функция для проверки попадания в зону удаления в сайдбаре
export function withinDeleteZone(pxX: number, pxY: number, container: DOMRect) {
  // Правая колонка сайдбара: ширина 320px + padding 16px
  const sidebarStart = container.right - 320 - 16;
  const sidebarEnd = container.right - 16;
  
  // Примерная область зоны удаления внизу сайдбара
  const deleteZoneTop = container.bottom - 600; // Увеличено в 3 раза: 600px от низа
  
  return pxX >= sidebarStart && pxX <= sidebarEnd && pxY >= deleteZoneTop;
}
