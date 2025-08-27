"use client";
import { create } from "zustand";
import { nanoid } from "nanoid";
import React from "react";
import type { Figure, Line, Group, AnyItem, ID, PointerState, ContextMenuState } from "./types";
import { field as baseField, gridLines as baseGridLines, columns as baseColumns, metersToPx, pxToMeters, useViewportScale, withinDeleteZone } from "@/lib/geometry";
import { GRID } from "@/lib/constants";

function snap(v: number, grid = GRID.step, eps = GRID.snapEps) {
  const r = Math.round(v / grid) * grid;
  const rounded = Math.round(r * 10) / 10; // keep 0.1 m precision
  if (Math.abs(rounded - v) <= eps) return rounded;
  return Math.round(v * 10) / 10; // always keep one decimal
}

function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)); }
function zTop(st: Store) { return Math.max(0, ...[...st.figures, ...st.lines, ...st.groups].map(x=>x.z ?? 0)) + 1; }

export type Store = {
  field: typeof baseField;
  gridLines: (scale: number) => { id: string; x1: number; y1: number; x2: number; y2: number }[];
  columns: (scale: number) => { id: string; cx: number; cy: number; r: number }[];

  figures: Figure[];
  lines: Line[];
  groups: Group[];
  selectedId: ID | null;
  pointer: PointerState;
  ui: { ctx: ContextMenuState; isOverDelete: boolean };

  addFigure: (opts:{width:number;height:number}) => void;
  addLine: (opts:{length:number}) => void;
  rotateLine90: (id:ID) => void;
  updateFigure: (id:ID, patch: Partial<Figure>) => void;
  setSelected: (id:ID|null, type?: AnyItem["type"]) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  renameSelected: () => void;
  pickColor: () => void;
  bringForward: () => void;
  sendBackward: () => void;
  ungroup: (id:ID) => void;

  handlePointerDown: (e: React.PointerEvent<SVGSVGElement>) => void;
  handleContextMenu: (e: React.MouseEvent<SVGSVGElement>) => void;
  drawnFigures: (scale:number)=>React.ReactNode[];
  drawnLines: (scale:number)=>React.ReactNode[];
  drawnGroups: (scale:number)=>React.ReactNode[];
};

const initialCtx: ContextMenuState = { visible:false, x:0, y:0, target:null };

export const useStore = create<Store>((set, get) => ({
  field: baseField,
  gridLines: baseGridLines,
  columns: baseColumns,

  figures: [
    // Постоянная белая фигура: закрывает верхний правый прямоугольник (6м×16м)
    { id: "__fixed_cover__", type: "figure", name: undefined, color: "#ffffff", x: 30, y: 0, w: 6, h: 16, z: 1, locked: true }
  ],
  lines: [],
  groups: [],
  selectedId: null,
  pointer: {},
  ui: { ctx: initialCtx, isOverDelete: false },

  addFigure: ({ width, height }) => set((st) => ({
    figures: [
      ...st.figures,
      { id: nanoid(), type:"figure", name:"Фигура", color: "#74c0fc", x: 1, y: 1, w: width, h: height, z: zTop(st) }
    ]
  })),

  addLine: ({ length }) => set((st) => ({
    lines: [
      ...st.lines,
      { id: nanoid(), type:"line", x: 1, y: 1, length, angle: 0, z: zTop(st) }
    ]
  })),

  updateFigure: (id, patch) => set((st) => ({
    figures: st.figures.map(f => f.id===id ? { ...f, ...patch } : f)
  })),

  setSelected: (id, type) => set((st)=>({
    selectedId: id,
    ui: { ...st.ui, ctx: { ...st.ui.ctx, visible:false, target: id && type ? { id, type } : null } }
  })),

  deleteSelected: () => set((st)=>{
    const id = st.selectedId; if(!id) return {} as any;
    const f = st.figures.find(x=>x.id===id);
    if (f?.locked) return {} as any;
    return {
      figures: st.figures.filter(f=>f.id!==id),
      lines: st.lines.filter(l=>l.id!==id),
      groups: st.groups.filter(g=>g.id!==id),
      selectedId: null,
      ui: { ...st.ui, ctx: initialCtx }
    };
  }),

  duplicateSelected: () => set((st)=>{
    const id = st.selectedId; if(!id) return {} as any;
    const f = st.figures.find(x=>x.id===id);
    if (f) {
      const copy: Figure = { ...f, id: nanoid(), x: Math.round((f.x + 0.5)*10)/10, y: Math.round((f.y + 0.5)*10)/10, z: zTop(st) };
      return { figures: [...st.figures, copy] } as any;
    }
    const l = st.lines.find(x=>x.id===id);
    if (l) {
      const copy: Line = { ...l, id: nanoid(), x: Math.round((l.x + 0.5)*10)/10, y: Math.round((l.y + 0.5)*10)/10, z: zTop(st) };
      return { lines: [...st.lines, copy] } as any;
    }
    return {} as any;
  }),

  renameSelected: () => set((st)=>{
    const id = st.selectedId; if(!id) return {} as any;
    const f = st.figures.find(x=>x.id===id);
    if (!f) return {} as any;
    if (f.locked) return {} as any;
    const name = prompt("Название фигуры:", f.name ?? "Фигура")?.trim();
    if (!name) return {} as any;
    return { figures: st.figures.map(x=>x.id===id?{...x,name}:x) } as any;
  }),

  pickColor: () => set((st)=>{
    const id = st.selectedId; if(!id) return {} as any;
    const f = st.figures.find(x=>x.id===id);
    if (!f) return {} as any;
    if (f.locked) return {} as any;
    const color = prompt("Цвет (hex или css):", f.color) ?? f.color;
    return { figures: st.figures.map(x=>x.id===id?{...x,color}:x) } as any;
  }),

  bringForward: () => set((st)=>{
    const id = st.selectedId; if(!id) return {} as any;
    return layerChange(st, id, +1);
  }),
  sendBackward: () => set((st)=>{
    const id = st.selectedId; if(!id) return {} as any;
    return layerChange(st, id, -1);
  }),

  ungroup: (gid) => set((st)=>({ groups: st.groups.filter(g=>g.id!==gid), selectedId: null })),

  rotateLine90: (id) => set((st)=>{
    const l = st.lines.find(x=>x.id===id);
    if (!l) return {} as any;
    const angle = (l.angle ?? 0) === 0 ? 90 : 0;
    let nx = l.x, ny = l.y;
    const len = l.length;
    if ((l.angle ?? 0) === 0) {
      // horizontal -> vertical around center
      const cx = l.x + len/2;
      const cy = l.y;
      nx = Math.round(cx * 10) / 10;
      ny = Math.round((cy - len/2) * 10) / 10;
    } else {
      // vertical -> horizontal around center
      const cx = l.x;
      const cy = l.y + len/2;
      nx = Math.round((cx - len/2) * 10) / 10;
      ny = Math.round(cy * 10) / 10;
    }
    return { lines: st.lines.map(x=>x.id===id?{...x, x:nx, y:ny, angle}:x) } as any;
  }),

  handlePointerDown: (e) => {
    const target = e.target as HTMLElement;
    const svg = e.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const scale = useViewportScale();

    if (e.button === 2) {
      e.preventDefault();
      const id = target.getAttribute("data-id");
      const type = target.getAttribute("data-type") as any;
      if (id && type) {
        get().setSelected(id, type);
        set((st)=>({ ui: { ...st.ui, ctx: { visible: true, x: e.clientX, y: e.clientY, target: { id, type } } } }));
      } else {
        set((st)=>({ ui: { ...st.ui, ctx: { visible: false, x: 0, y: 0, target: null } } }));
      }
      return;
    }

    const id = target.getAttribute("data-id");
    const type = target.getAttribute("data-type") as AnyItem["type"] | null;
    const mx = pxToMeters(e.clientX - rect.left - 24, scale);
    const my = pxToMeters(e.clientY - rect.top - 24, scale);

    if (id && type) {
      get().setSelected(id, type);
      const item = getItemById(get(), id);
      if ((item as any)?.locked) return; // нельзя перетаскивать/менять постоянную фигуру
      if (item && (type === "figure" || type === "line")) {
        const offsetX = Math.round((mx - (item as any).x)*10)/10;
        const offsetY = Math.round((my - (item as any).y)*10)/10;
        set((st)=>({ pointer: { draggingId: id, offsetX, offsetY } }));
      }
    } else {
      get().setSelected(null);
    }

    const onMove = (ev: PointerEvent) => {
      const mx = pxToMeters(ev.clientX - rect.left - 24, scale);
      const my = pxToMeters(ev.clientY - rect.top - 24, scale);
      const st = get();
      const dragId = st.pointer.draggingId; if(!dragId) return;
      const item = getItemById(st, dragId) as any;
      if (!item) return;

      let nx = Math.round((mx - (st.pointer.offsetX ?? 0))*10)/10;
      let ny = Math.round((my - (st.pointer.offsetY ?? 0))*10)/10;

      nx = snap(nx); ny = snap(ny);
      nx = clamp(nx, -1000, 1000);
      ny = clamp(ny, -1000, 1000);

      if (item.type === "figure") {
        const { propose } = dockingProposal(st, dragId, nx, ny, item.w, item.h);
        set((s)=>({ pointer: { ...s.pointer, proposeDockTo: propose } }));
        set((s)=>({ figures: s.figures.map(f=>f.id===dragId?{...f,x:nx,y:ny}:f) }));
      } else if (item.type === "line") {
        set((s)=>({ lines: s.lines.map(l=>l.id===dragId?{...l,x:nx,y:ny}:l) }));
      }

      const isOverDelete = withinDeleteZone(ev.clientX, ev.clientY, rect);
      set((s)=>({ ui: { ...s.ui, isOverDelete } }));
    };

    const onUp = (ev: PointerEvent) => {
      const st = get();
      const dragId = st.pointer.draggingId; if(!dragId) return cleanup();
      const isOverDelete = withinDeleteZone(ev.clientX, ev.clientY, rect);
      if (isOverDelete) {
        const t = getTypeById(st, dragId);
        if (t === "figure") set((s)=>({ figures: s.figures.filter(f=>f.id!==dragId || (f.locked ?? false)) }));
        if (t === "line") set((s)=>({ lines: s.lines.filter(l=>l.id!==dragId) }));
        if (t === "group") set((s)=>({ groups: s.groups.filter(g=>g.id!==dragId) }));
      } else {
        const prop = st.pointer.proposeDockTo;
        if (prop && getTypeById(st, dragId) === "figure") {
          const group = doGroup(st, dragId, prop.id);
          if (group) set((s)=>group);
        }
      }
      cleanup();
    };

    const cleanup = () => {
      set((s)=>({ pointer: {}, ui: { ...s.ui, isOverDelete: false } }));
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  },

  handleContextMenu: (e) => {
    let el = e.target as HTMLElement | null;
    let id: string | null = null;
    let type: AnyItem["type"] | null = null;
    while (el) {
      id = el.getAttribute?.("data-id") ?? null;
      type = (el.getAttribute?.("data-type") as AnyItem["type"]) ?? null;
      if (id && type) break;
      el = el.parentElement;
    }
    if (id && type) {
      get().setSelected(id, type);
      set((st)=>({ ui: { ...st.ui, ctx: { visible: true, x: e.clientX, y: e.clientY, target: { id, type } } } }));
    } else {
      set((st)=>({ ui: { ...st.ui, ctx: { visible: false, x: 0, y: 0, target: null } } }));
    }
  },

  drawnFigures: (scale) => get().figures
    .sort((a,b)=>a.z-b.z)
    .map((f)=> (
      <g key={f.id}>
        <rect 
          {...(f.locked ? {} : { 'data-id': f.id, 'data-type': 'figure' })}
          x={metersToPx(f.x, scale)} 
          y={metersToPx(f.y, scale)} 
          width={metersToPx(f.w, scale)} 
          height={metersToPx(f.h, scale)} 
          fill={f.color} 
          stroke="#111" 
          strokeWidth={1} 
        />
        {f.name && (
          <text 
            {...(f.locked ? {} : { 'data-id': f.id, 'data-type': 'figure' })}
            x={metersToPx(f.x + f.w/2, scale)} 
            y={metersToPx(f.y + f.h/2, scale)} 
            textAnchor="middle" 
            dominantBaseline="middle" 
            fontSize={12} 
            fill="#d00"
          >{f.name}</text>
        )}
      </g>
    )),

  drawnLines: (scale) => get().lines
    .sort((a,b)=>a.z-b.z)
    .map((l)=> (
      <g key={l.id}>
        {((l.angle ?? 0) === 0) ? (
          <line data-id={l.id} data-type="line" x1={metersToPx(l.x, scale)} y1={metersToPx(l.y, scale)} x2={metersToPx(l.x + l.length, scale)} y2={metersToPx(l.y, scale)} stroke="#111" strokeWidth={3} />
        ) : (
          <line data-id={l.id} data-type="line" x1={metersToPx(l.x, scale)} y1={metersToPx(l.y, scale)} x2={metersToPx(l.x, scale)} y2={metersToPx(l.y + l.length, scale)} stroke="#111" strokeWidth={3} />
        )}
      </g>
    )),

  drawnGroups: (scale) => get().groups
    .sort((a,b)=>a.z-b.z)
    .map((g)=>{
      const figs = get().figures.filter(f=>g.children.includes(f.id));
      if (!figs.length) return null;
      const minX = Math.min(...figs.map(f=>f.x));
      const minY = Math.min(...figs.map(f=>f.y));
      const maxX = Math.max(...figs.map(f=>f.x + f.w));
      const maxY = Math.max(...figs.map(f=>f.y + f.h));
      return (
        <g key={g.id} data-id={g.id} data-type="group">
          <rect x={metersToPx(minX, scale)} y={metersToPx(minY, scale)} width={metersToPx(maxX-minX, scale)} height={metersToPx(maxY-minY, scale)} fill="none" stroke="#111" strokeWidth={5} />
          {figs.map(f=> (
            <rect key={f.id} x={metersToPx(f.x, scale)} y={metersToPx(f.y, scale)} width={metersToPx(f.w, scale)} height={metersToPx(f.h, scale)} fill="#ffffff" stroke="#111" strokeWidth={1} />
          ))}
        </g>
      );
    }),
}));

function getItemById(st: Store, id: ID): AnyItem | undefined {
  return st.figures.find(f=>f.id===id) || st.lines.find(l=>l.id===id) || st.groups.find(g=>g.id===id);
}
function getTypeById(st: Store, id: ID): AnyItem["type"] | null {
  if (st.figures.some(x=>x.id===id)) return "figure";
  if (st.lines.some(x=>x.id===id)) return "line";
  if (st.groups.some(x=>x.id===id)) return "group";
  return null;
}

function dockingProposal(st: Store, dragId: ID, nx: number, ny: number, w: number, h: number) {
  const eps = GRID.snapEps;
  const left = nx, right = nx + w, top = ny, bottom = ny + h;
  for (const f of st.figures) {
    if (f.id === dragId) continue;
    const L = f.x, R = f.x + f.w, T = f.y, B = f.y + f.h;
    if (Math.abs(right - L) <= eps && overlap1D(top, bottom, T, B)) return { propose: { id: f.id, edge: "left" as const } };
    if (Math.abs(left - R) <= eps && overlap1D(top, bottom, T, B)) return { propose: { id: f.id, edge: "right" as const } };
    if (Math.abs(bottom - T) <= eps && overlap1D(left, right, L, R)) return { propose: { id: f.id, edge: "top" as const } };
    if (Math.abs(top - B) <= eps && overlap1D(left, right, L, R)) return { propose: { id: f.id, edge: "bottom" as const } };
  }
  return { propose: null };
}
function overlap1D(a1:number,a2:number,b1:number,b2:number){ return Math.min(a2,b2) - Math.max(a1,b1) > 0; }

function layerChange(st: Store, id: ID, dir: 1|-1) {
  const type = getTypeById(st, id);
  if (type === "figure") return { figures: st.figures.map(f=>f.id===id?{...f,z:f.z+dir}:f) } as any;
  if (type === "line") return { lines: st.lines.map(l=>l.id===id?{...l,z:l.z+dir}:l) } as any;
  if (type === "group") return { groups: st.groups.map(g=>g.id===id?{...g,z:g.z+dir}:g) } as any;
  return {} as any;
}


// Сгруппировать две фигуры: создаёт группу с толстым внешним контуром,
// а у детей убирает названия и заливает белым (как в ТЗ).
function doGroup(st: Store, idA: ID, idB: ID) {
  const a = st.figures.find(f => f.id === idA);
  const b = st.figures.find(f => f.id === idB);
  if (!a || !b) return null;

  const gid = nanoid();
  const g: Group = {
    id: gid,
    type: "group",
    children: [a.id, b.id],
    z: Math.max(a.z, b.z) + 1,
  };

  // Удаляем name/цвет у детей группы, заливаем белым, как в спецификации
  const updatedFigures = st.figures.map(f =>
    g.children.includes(f.id) ? { ...f, name: undefined, color: "#ffffff" } : f
  );

  return {
    groups: [...st.groups, g],
    figures: updatedFigures,
    selectedId: gid,
  } as Partial<Store>;
}
