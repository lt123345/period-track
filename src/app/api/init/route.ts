import { initDb } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST() {
  await initDb();
  return NextResponse.json({ ok: true, message: "Table created" });
}
