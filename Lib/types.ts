// lib/types.ts
export type ID = string;

export type Figure = {
  id: ID;
  type: "figure";
  name?: string;
  color: string; // fill
  x: number; // meters
  y: number; // meters
  w: number; // meters
  h: number; // meters
  z: number; // layer order
};

export type Line = {
  id: ID;
  type: "line";
  x: number; // meters
  y: number; // meters
  length: number; // meters
  z: number;
};

export type Group = {
  id: ID;
  type: "group";
  children: ID[]; // ids of figures
  z: number;
};

export type AnyItem = Figure | Line | Group;

export type PointerState = {
  draggingId?: ID;
  offsetX?: number; // meters
  offsetY?: number; // meters
  proposeDockTo?: { id: ID; edge: "left" | "right" | "top" | "bottom" } | null;
};

export type ContextMenuState = {
  visible: boolean;
  x: number;
  y: number;
  target: { id: ID; type: AnyItem["type"] } | null;
};
