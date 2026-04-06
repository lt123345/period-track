import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const sql = getDb();
  const rows = await sql`SELECT id, date, notes FROM periods ORDER BY date DESC`;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { date, notes } = await req.json();
  if (!date) {
    return NextResponse.json({ error: "date is required" }, { status: 400 });
  }
  const sql = getDb();
  const rows = await sql`
    INSERT INTO periods (date, notes) VALUES (${date}, ${notes || ''})
    ON CONFLICT (date) DO UPDATE SET notes = ${notes || ''}
    RETURNING id, date, notes
  `;
  return NextResponse.json(rows[0]);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  const sql = getDb();
  await sql`DELETE FROM periods WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
