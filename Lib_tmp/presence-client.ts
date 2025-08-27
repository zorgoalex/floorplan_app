// lib/presence-client.ts
export async function ensureKVPresence(name: string): Promise<{ ok: boolean; stopHeartbeat?: () => void }>{
  try {
    const r = await fetch("/api/presence/register", { method: "POST", body: JSON.stringify({ name }) });
    if (!r.ok) return { ok: false };
    const { id } = await r.json();
    const hb = setInterval(() => {
      fetch("/api/presence/heartbeat", { method: "POST", body: JSON.stringify({ id }) });
    }, 15000);
    const stop = () => {
      clearInterval(hb);
      fetch("/api/presence/unregister", { method: "POST", body: JSON.stringify({ id }) });
    };
    if (typeof window !== "undefined") window.addEventListener("beforeunload", stop);
    return { ok: true, stopHeartbeat: stop };
  } catch {
    return { ok: false };
  }
}

export async function getOnlineUsers(): Promise<string[]> {
  try {
    const r = await fetch("/api/presence/list", { cache: "no-store" });
    if (!r.ok) return [];
    const { users } = await r.json();
    return users as string[];
  } catch { return []; }
}
