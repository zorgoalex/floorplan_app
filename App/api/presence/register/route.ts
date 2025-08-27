import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    const id = nanoid();
    if (process.env.KV_URL && process.env.KV_REST_API_TOKEN) {
      const key = `presence:user:${id}`;
      await kv.hset(key, { name, ts: Date.now().toString() });
      await kv.expire(key, 60);
      await kv.sadd("presence:online", id);
    }
    return NextResponse.json({ id });
  } catch (e) {
    return NextResponse.json({ id: null }, { status: 200 });
  }
}
