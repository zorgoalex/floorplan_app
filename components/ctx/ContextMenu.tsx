"use client";
import React, { useState } from "react";
import { useStore } from "@/store";

export function ContextMenu() {
  const { ctx, actions, figures } = useStore((s) => ({ ctx: s.ui.ctx, actions: s, figures: s.figures }));
  const [showPalette, setShowPalette] = useState(false);
  if (!ctx.visible) return null;
  const locked = ctx.target?.type === 'figure' && figures.find(f=>f.id===ctx.target!.id)?.locked;
  return (
    <div 
      style={{ position: 'fixed', zIndex: 1000, left: ctx.x, top: ctx.y }} 
      onMouseDown={(e)=>e.stopPropagation()}
      onContextMenu={(e)=>{ e.preventDefault(); e.stopPropagation(); }}
    >
      <div
        className="rounded-xl bg-white shadow-lg border w-56 p-1"
        style={{
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          padding: '6px',
          minWidth: '220px'
        }}
      >
        {ctx.target?.type === "group" ? (<><Item onClick={() => actions.ungroup(ctx.target!.id)}>Разгруппировать</Item><Hr /></>) : null}
        {!locked && (<Item onClick={() => actions.renameSelected()}>Переименовать</Item>)}
        {!locked && ctx.target?.type !== "group" && (
          <>
            <Item onClick={() => setShowPalette(v=>!v)}>Изменить цвет</Item>
            {showPalette && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 18px)', gap: 6, padding: '6px 8px' }}>
                {PALETTE.map((c) => (
                  <button
                    key={c}
                    onClick={(e)=>{
                      e.stopPropagation();
                      if (ctx.target?.type === 'figure' && !locked) {
                        actions.updateFigure(ctx.target.id, { color: c });
                        setShowPalette(false);
                        actions.setSelected(ctx.target.id, 'figure'); // закроет меню
                      }
                    }}
                    title={c}
                    style={{ width: 18, height: 18, borderRadius: 4, border: '1px solid #e5e7eb', backgroundColor: c, cursor: 'pointer' }}
                  />
                ))}
              </div>
            )}
          </>
        )}
        <Item onClick={() => actions.bringForward()}>Выше</Item>
        <Item onClick={() => actions.sendBackward()}>Ниже</Item>
        {!locked && ctx.target?.type !== "group" && (<Item onClick={() => actions.duplicateSelected()}>Дублировать</Item>)}
        {!locked && (<Item className="text-red-600" onClick={() => actions.deleteSelected()}>Удалить</Item>)}
      </div>
    </div>
  );
}

function Item({ children, onClick, className }:{children:React.ReactNode; onClick:()=>void; className?:string}){
  return (
    <button className={`w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-100 ${className ?? ""}`} onClick={onClick}>{children}</button>
  );
}
function Hr(){return <div className="my-1 border-t"/>}

const PALETTE = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
  "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899", "#f43f5e", "#6b7280", "#94a3b8", "#111827"
];
