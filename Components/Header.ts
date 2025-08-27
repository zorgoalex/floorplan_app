"use client";
import React from "react";

export function Header({ currentUser, onlineUsers, rightSlot }:{ currentUser: string; onlineUsers: string[]; rightSlot?: React.ReactNode; }) {
  return (
    <header className="sticky top-0 z-10 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-xl font-semibold">Floorplan Editor</div>
          <div className="text-xs text-neutral-600">Шаг снаппинга 0.1 м</div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-sm"><span className="font-medium">Вы: </span><span>{currentUser}</span></div>
          <div className="text-sm"><span className="font-medium">Онлайн: </span><span>{onlineUsers.join(", ")}</span></div>
          {rightSlot}
        </div>
      </div>
    </header>
  );
}
