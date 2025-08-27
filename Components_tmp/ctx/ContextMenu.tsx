"use client";
import React from "react";
import { useStore } from "@/store";

export function ContextMenu() {
  const { ctx, actions } = useStore((s) => ({ ctx: s.ui.ctx, actions: s }));
  if (!ctx.visible) return null;
  return (
    <div className="fixed z-20" style={{ left: ctx.x, top: ctx.y }} onMouseDown={(e)=>e.stopPropagation()}>
      <div className="rounded-xl bg-white shadow-lg border w-56 p-1">
        {ctx.target?.type === "group" ? (<><Item onClick={() => actions.ungroup(ctx.target!.id)}>Разгруппировать</Item><Hr /></>) : null}
        <Item onClick={() => actions.renameSelected()}>Переименовать</Item>
        {ctx.target?.type !== "group" && (<Item onClick={() => actions.pickColor()}>Изменить цвет</Item>)}
        <Item onClick={() => actions.bringForward()}>Выше</Item>
        <Item onClick={() => actions.sendBackward()}>Ниже</Item>
        {ctx.target?.type !== "group" && (<Item onClick={() => actions.duplicateSelected()}>Дублировать</Item>)}
        <Item className="text-red-600" onClick={() => actions.deleteSelected()}>Удалить</Item>
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
