"use client";
import React, { useRef } from "react";
import { GRID, STROKES, COLUMN_DIAM } from "@/lib/constants";
import { metersToPx, useViewportScale } from "@/lib/geometry";
import { useStore } from "@/store";
import { ContextMenu } from "@/components/ctx/ContextMenu";

export function Field() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const scale = useViewportScale();
  const { field, gridLines, columns, handlePointerDown, drawnFigures, drawnLines, drawnGroups } = useStore((s)=>({
    field: s.field,
    gridLines: s.gridLines,
    columns: s.columns,
    handlePointerDown: s.handlePointerDown,
    drawnFigures: s.drawnFigures,
    drawnLines: s.drawnLines,
    drawnGroups: s.drawnGroups,
  }));

  const wPx = metersToPx(field.width, scale);
  const hPx = metersToPx(field.height, scale);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <svg 
        ref={svgRef} 
        id="floorplan-svg" 
        style={{ width: '100%', height: '100%' }}
        onContextMenu={(e)=>e.preventDefault()} 
        onPointerDown={(e) => handlePointerDown(e)}
        viewBox={`0 0 ${wPx + 48} ${hPx + 48}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <rect x={0} y={0} width="100%" height="100%" fill="#f8fafc" />
        <g transform={`translate(24,24)`}>
          <g>
            {gridLines(scale).map((l) => (
              <line key={l.id} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#d3d3d3" strokeWidth={1} />
            ))}
          </g>
          <g>
            {field.blocks.map((b) => {
              // Специальный 6-й блок (имитация отсутствия)
              if ((b as any).special) {
                const x = metersToPx(b.x, scale);
                const y = metersToPx(b.y, scale);
                const w = metersToPx(b.w, scale);
                const h = metersToPx(b.h, scale);
                
                return (
                  <g key={b.id}>
                    {/* Белый фон */}
                    <rect x={x} y={y} width={w} height={h} fill="white" stroke="none" />
                    {/* Жирные левая и нижняя границы */}
                    <line x1={x} y1={y} x2={x} y2={y + h} stroke="#000" strokeWidth={STROKES.thick} />
                    <line x1={x} y1={y + h} x2={x + w} y2={y + h} stroke="#000" strokeWidth={STROKES.thick} />
                    {/* Белые правая и верхняя границы (сливаются с фоном) */}
                    <line x1={x + w} y1={y} x2={x + w} y2={y + h} stroke="white" strokeWidth={2} />
                    <line x1={x} y1={y} x2={x + w} y2={y} stroke="white" strokeWidth={2} />
                  </g>
                );
              }
              
              // Обычные блоки
              return (
                <rect 
                  key={b.id} 
                  x={metersToPx(b.x, scale)} 
                  y={metersToPx(b.y, scale)} 
                  width={metersToPx(b.w, scale)} 
                  height={metersToPx(b.h, scale)} 
                  fill="none" 
                  stroke="#d3d3d3" 
                  strokeWidth={2} 
                />
              );
            })}
          </g>
          <g>
            {columns(scale).map((c) => (
              <ellipse 
                key={c.id} 
                cx={c.cx} 
                cy={c.cy} 
                rx={metersToPx(COLUMN_DIAM, scale)} 
                ry={metersToPx(COLUMN_DIAM, scale)} 
                fill="#9aa0a6" 
              />
            ))}
          </g>
          <g>{drawnGroups(scale)}</g>
          <g>{drawnFigures(scale)}</g>
          <g>{drawnLines(scale)}</g>
          <rect x={0} y={0} width={wPx} height={hPx} fill="none" stroke="#000" strokeWidth={STROKES.thick} />
        </g>
      </svg>
      <ContextMenu />
    </div>
  );
}
