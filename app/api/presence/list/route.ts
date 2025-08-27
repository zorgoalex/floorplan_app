import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function GET() {
  try {
    if (!(process.env.KV_URL && process.env.KV_REST_API_TOKEN))
      return NextResponse.json({ users: [] });

    const ids = await kv.smembers<string[]>("presence:online");
    const now = Date.now();
    const users: string[] = [];
    for (const id of ids) {
      const data = await kv.hgetall<Record<string, string>>(`presence:user:${id}`);
      if (!data) continue;
      const ts = Number(data.ts ?? 0);
      if (now - ts <= 45000) {
        if (data.name) users.push(data.name);
        await kv.expire(`presence:user:${id}`, 60);
      } else {
        await kv.del(`presence:user:${id}`);
        await kv.srem("presence:online", id);
      }
    }
    users.sort((a,b)=>a.localeCompare(b));
    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ users: [] });
  }
}
