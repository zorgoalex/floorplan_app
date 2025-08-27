// app/page.tsx

"use client";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Field } from "@/components/Field";
import { DeleteZone } from "@/components/DeleteZone";
import { ScreenshotButton } from "@/components/Screenshot";
import { ensureKVPresence, getOnlineUsers } from "@/lib/presence-client";

export default function Page() {
  const [name, setName] = useState<string | null>(null);
  const [online, setOnline] = useState<string[]>([]);
  const [kvReady, setKvReady] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("fp_username");
    if (!saved) {
      const n = prompt("Введите ваше имя (будет видно другим в онлайне):")?.trim();
      const final = n && n.length ? n : `Гость-${Math.floor(Math.random() * 999)}`;
      sessionStorage.setItem("fp_username", final);
      setName(final);
    } else setName(saved);
  }, []);

  const resetName = () => {
    sessionStorage.removeItem("fp_username");
    const n = prompt("Введите новое имя:")?.trim();
    const final = n && n.length ? n : `Гость-${Math.floor(Math.random() * 999)}`;
    sessionStorage.setItem("fp_username", final);
    setName(final);
  };

  useEffect(() => {
    let stop = () => {};
    if (name) {
      ensureKVPresence(name).then(({ ok, stopHeartbeat }) => {
        setKvReady(ok);
        stop = stopHeartbeat ?? (() => {});
      });
    }
    return () => stop();
  }, [name]);

  useEffect(() => {
    let id: any;
    async function poll() {
      if (!kvReady) return setOnline(name ? [name] : []);
      const list = await getOnlineUsers();
      setOnline(list);
    }
    poll();
    id = setInterval(poll, 5000);
    return () => clearInterval(id);
  }, [kvReady, name]);

  const headerRight = useMemo(() => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <button 
        onClick={resetName}
        style={{
          padding: '4px 8px',
          fontSize: '12px',
          borderRadius: '6px',
          border: '1px solid #d1d5db',
          backgroundColor: 'white',
          cursor: 'pointer'
        }}
      >
        Сменить имя
      </button>
      <ScreenshotButton />
    </div>
  ), [resetName]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header currentUser={name ?? ""} onlineUsers={online} rightSlot={headerRight} />
      
      {/* Основной контейнер */}
      <div style={{ flex: 1, display: 'flex', padding: '16px', gap: '16px', minHeight: 0 }}>
        
        {/* Левая область - Поле плана и инфо (85% ширины) */}
        <div style={{ 
          flex: '0 0 85%',
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px',
          minHeight: 0
        }}>
          
          {/* Имена пользователей над полем */}
          <div style={{ 
            padding: '8px 16px', 
            fontSize: '14px', 
            color: '#666',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <span>Онлайн: {online.join(", ")}</span>
          </div>
          
          {/* Поле плана (основная область) */}
          <div style={{ 
            position: 'relative', 
            flex: 1,
            minHeight: '70vh',
            borderRadius: '16px', 
            backgroundColor: 'white', 
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', 
            overflow: 'hidden'
          }}>
            <Field />
          </div>
        </div>
        
        {/* Правая колонка с панелями управления (15% ширины) */}
        <div style={{ 
          flex: '0 0 15%',
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px',
          maxWidth: '180px',
          minWidth: '160px'
        }}>
          <Sidebar />
          <DeleteZone />
        </div>
      </div>
    </div>
  );
}
