import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    if (process.env.KV_URL && process.env.KV_REST_API_TOKEN && id) {
      await kv.del(`presence:user:${id}`);
      await kv.srem("presence:online", id);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
