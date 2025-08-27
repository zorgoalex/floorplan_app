"use client";
import React from "react";

export function Header({ currentUser, onlineUsers, rightSlot }:{ currentUser: string; onlineUsers: string[]; rightSlot?: React.ReactNode; }) {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 10,
      width: '100%',
      borderBottom: '1px solid #e5e7eb',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        maxWidth: '1600px',
        margin: '0 auto',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '20px', fontWeight: '600' }}>Floorplan Editor</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Шаг снаппинга 0.1 м</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ fontSize: '14px' }}>
            <span style={{ fontWeight: '500' }}>Вы: </span>
            <span>{currentUser}</span>
          </div>
          <div style={{ fontSize: '14px' }}>
            <span style={{ fontWeight: '500' }}>Онлайн: </span>
            <span>{onlineUsers.join(", ")}</span>
          </div>
          {rightSlot}
        </div>
      </div>
    </header>
  );
}
