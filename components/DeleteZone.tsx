"use client";
import React from "react";
import { useStore } from "@/store";

// Компонент зоны удаления для сайдбара (справа)
export function DeleteZone() {
  const isOverDelete = useStore((s) => s.ui.isOverDelete);
  return (
    <div style={{
      borderRadius: '12px',
      backgroundColor: 'white',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      padding: '10px'
    }}>
      <div style={{
        borderRadius: '8px',
        border: `1px solid ${isOverDelete ? '#ef4444' : '#d1d5db'}`,
        padding: '8px 6px',
        textAlign: 'center',
        fontSize: '12px',
        backgroundColor: isOverDelete ? '#fef2f2' : 'transparent',
        color: isOverDelete ? '#dc2626' : '#374151',
        transition: 'all 0.2s'
      }}>
        Зона удаления
      </div>
      <p style={{
        fontSize: '10px',
        color: '#9ca3af',
        marginTop: '4px',
        textAlign: 'center',
        lineHeight: '1.3'
      }}>
        Перетащите объект для удаления
      </p>
    </div>
  );
}

// Оригинальная зона удаления для поля (deprecated, заменена на сайдбар)
export function FieldDeleteZone() {
  const isOverDelete = useStore((s) => s.ui.isOverDelete);
  return (
    <div className="absolute right-4 bottom-4">
      <div className={`rounded-xl border px-4 py-2 text-sm shadow-sm bg-white ${isOverDelete ? "border-red-500 text-red-600" : "border-neutral-300 text-neutral-700"}`}>
        Зона удаления
      </div>
    </div>
  );
}
