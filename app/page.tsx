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

  const headerRight = useMemo(() => (<div className="flex items-center gap-2"><ScreenshotButton /></div>), []);

  return (
    <div className="flex flex-col h-dvh">
      <Header currentUser={name ?? ""} onlineUsers={online} rightSlot={headerRight} />
      {/* Изменения ниже: контейнер теперь relative, а Sidebar и DeleteZone позиционируются абсолютно */}
      <div className="relative flex-1 p-4 max-w-[1600px] mx-auto w-full">
        <div className="h-full rounded-2xl bg-white shadow-sm p-3 overflow-hidden">
          <Field />
        </div>
        <Sidebar />
        <DeleteZone />
      </div>
    </div>
  );
}
