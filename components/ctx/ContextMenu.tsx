"use client";
import React from "react";
import { useStore } from "@/store";

export function ContextMenu() {
  const { ctx, actions, figures } = useStore((s) => ({ ctx: s.ui.ctx, actions: s, figures: s.figures }));
  if (!ctx.visible) return null;
  const locked = ctx.target?.type === 'figure' && figures.find(f=>f.id===ctx.target!.id)?.locked;
  return (
    <div style={{ position: 'fixed', zIndex: 1000, left: ctx.x, top: ctx.y }} onMouseDown={(e)=>e.stopPropagation()}>
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
        {!locked && ctx.target?.type !== "group" && (<Item onClick={() => actions.pickColor()}>Изменить цвет</Item>)}
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
