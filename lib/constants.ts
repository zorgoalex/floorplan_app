export const GRID = {
  step: 0.1,      // meters (snapping step)
  displayStep: 1, // meters (grid lines)
  snapEps: 0.05   // meters (snapping tolerance)
};

export const STROKES = {
  thin: 1, // x1 - контур отдельных фигур
  thick: 5, // x5 - общий контур поля и групп
  line: 3, // x3 - линии
};

// Новая структура поля по ТЗ: 11 прямоугольников 6×16 м
export const FIELD = {
  blockW: 6,      // ширина блока в метрах
  blockH: 16,     // высота блока в метрах
  topRow: 6,      // верхний ряд: 6 блоков
  bottomRow: 6,   // нижний ряд: 6 блоков
};

export const COLUMN_DIAM = 0.2; // диаметр столбов в метрах
