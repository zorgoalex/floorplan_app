// components/Sidebar.tsx

"use client";
import React, { useState } from "react";
import { useStore } from "@/store";
import { metersNumber } from "@/lib/geometry";

export function Sidebar() {
  const addFigure = useStore((s) => s.addFigure);
  const addLine = useStore((s) => s.addLine);
  const [w, setW] = useState("3.0");
  const [h, setH] = useState("2.0");
  const [len, setLen] = useState("4.0");

  return (
    // Изменения в этой строке: добавлены классы absolute, top-4, right-4
    <aside className="absolute top-4 right-4 w-[300px] rounded-2xl bg-white shadow-sm p-4 flex flex-col gap-6">
      <div>
        <h3 className="font-semibold mb-2">Создать фигуру</h3>
        <label className="block text-sm mb-1">Ширина (м, до 1 десятичного)</label>
        <input value={w} onChange={(e)=>setW(e.target.value)} className="input" placeholder="например, 2.5" />
        <label className="block text-sm mt-3 mb-1">Высота (м, до 1 десятичного)</label>
        <input value={h} onChange={(e)=>setH(e.target.value)} className="input" placeholder="например, 1.2" />
        <button
          className="btn mt-3"
          onClick={() => {
            const width = metersNumber(w, 0);
            const height = metersNumber(h, 0);
            if (width === null || height === null) return alert("Введите число с не более чем 1 десятичным знаком и > 0");
            addFigure({ width, height });
            setW(width.toFixed(1));
            setH(height.toFixed(1));
          }}
        >Создать фигуру</button>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Создать линию</h3>
        <label className="block text-sm mb-1">Длина (м, до 1 десятичного)</label>
        <input value={len} onChange={(e)=>setLen(e.target.value)} className="input" placeholder="например, 3.4" />
        <button
          className="btn mt-3"
          onClick={() => {
            const length = metersNumber(len, 0);
            if (length === null) return alert("Введите число с не более чем 1 десятичным знаком и > 0");
            addLine({ length });
            setLen(length.toFixed(1));
          }}
        >Создать линию</button>
      </div>

      <div className="text-xs text-neutral-600 leading-relaxed">
        <p>• Перетаскивайте объекты; снаппинг к шагу 0.1 м и к краям.</p>
        <p>• Стыковка формирует группу с общим толстым контуром.</p>
        <p>• ПКМ — контекстное меню (дублирование, слои, удалить и т.д.).</p>
        <p>• Зона удаления — внизу справа на поле.</p>
        <p>• Скриншот — в шапке.</p>
      </div>
    </aside>
  );
}
