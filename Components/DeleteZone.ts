"use client";
import React from "react";
import { useStore } from "@/store";

export function DeleteZone() {
  const isOverDelete = useStore((s) => s.ui.isOverDelete);
  return (
    <div className="absolute right-4 bottom-4">
      <div className={`rounded-xl border px-4 py-2 text-sm shadow-sm bg-white ${isOverDelete ? "border-red-500 text-red-600" : "border-neutral-300 text-neutral-700"}`}>
        Зона удаления
      </div>
    </div>
  );
}
