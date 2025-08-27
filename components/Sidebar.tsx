// components/Sidebar.tsx

"use client";
import React, { useState } from "react";
import { useStore } from "@/store";
import { metersNumber } from "@/lib/geometry";

// Компонент для создания фигур (компактный)
export function FigureCreator() {
  const addFigure = useStore((s) => s.addFigure);
  const [w, setW] = useState("3.0");
  const [h, setH] = useState("2.0");

  return (
    <div style={{
      borderRadius: '12px',
      backgroundColor: 'white',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      padding: '10px'
    }}>
      <h3 style={{ fontWeight: '600', marginBottom: '8px', fontSize: '13px' }}>Создать фигуру</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>Ширина (м)</label>
          <input 
            value={w} 
            onChange={(e)=>setW(e.target.value)} 
            className="input" 
            placeholder="2.5"
            style={{ fontSize: '12px', padding: '4px 6px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>Высота (м)</label>
          <input 
            value={h} 
            onChange={(e)=>setH(e.target.value)} 
            className="input" 
            placeholder="1.2"
            style={{ fontSize: '12px', padding: '4px 6px' }}
          />
        </div>
        <button
          className="btn"
          style={{ width: '100%', fontSize: '12px', padding: '6px 8px' }}
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
    </div>
  );
}

// Компонент для создания линий (компактный)
export function LineCreator() {
  const addLine = useStore((s) => s.addLine);
  const [len, setLen] = useState("4.0");

  return (
    <div style={{
      borderRadius: '12px',
      backgroundColor: 'white',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      padding: '10px'
    }}>
      <h3 style={{ fontWeight: '600', marginBottom: '8px', fontSize: '13px' }}>Создать линию</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>Длина (м)</label>
          <input 
            value={len} 
            onChange={(e)=>setLen(e.target.value)} 
            className="input" 
            placeholder="3.4"
            style={{ fontSize: '12px', padding: '4px 6px' }}
          />
        </div>
        <button
          className="btn"
          style={{ width: '100%', fontSize: '12px', padding: '6px 8px' }}
          onClick={() => {
            const length = metersNumber(len, 0);
            if (length === null) return alert("Введите число с не более чем 1 десятичным знаком и > 0");
            addLine({ length });
            setLen(length.toFixed(1));
          }}
        >Создать линию</button>
      </div>
    </div>
  );
}

// Компонент с подсказками (компактный)
export function HelpPanel() {
  return (
    <div style={{
      borderRadius: '12px',
      backgroundColor: 'white',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      padding: '10px'
    }}>
      <h3 style={{ fontWeight: '600', marginBottom: '8px', fontSize: '13px' }}>Справка</h3>
      <div style={{ fontSize: '10px', color: '#666', lineHeight: '1.4' }}>
        <p style={{ marginBottom: '3px' }}>• Перетаскивайте объекты</p>
        <p style={{ marginBottom: '3px' }}>• Снаппинг к шагу 0.1 м</p>
        <p style={{ marginBottom: '3px' }}>• Стыковка формирует группу</p>
        <p style={{ marginBottom: '3px' }}>• ПКМ — контекстное меню</p>
        <p>• Зона удаления справа снизу</p>
      </div>
    </div>
  );
}

// Главный компонент Sidebar (объединяет все панели)
export function Sidebar() {
  return (
    <>
      <FigureCreator />
      <LineCreator />
      <HelpPanel />
    </>
  );
}