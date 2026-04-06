import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const sql = getDb();
  const rows = await sql`SELECT date FROM periods ORDER BY date ASC`;
  const dates = rows.map((r) => (r.date as string).split("T")[0]);

  if (dates.length < 2) {
    return NextResponse.json({
      averageCycle: null,
      predictedDate: null,
      daysUntil: null,
      message: "Need at least 2 records to predict",
    });
  }

  const cycleLengths: number[] = [];
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = Math.round(
      (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff > 0 && diff < 60) {
      cycleLengths.push(diff);
    }
  }

  if (cycleLengths.length === 0) {
    return NextResponse.json({
      averageCycle: null,
      predictedDate: null,
      daysUntil: null,
      message: "Cannot calculate cycle length",
    });
  }

  const averageCycle = Math.round(
    cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length
  );

  const lastDate = new Date(dates[dates.length - 1]);
  const predictedDate = new Date(lastDate);
  predictedDate.setDate(predictedDate.getDate() + averageCycle);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysUntil = Math.round(
    (predictedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  return NextResponse.json({
    averageCycle,
    predictedDate: predictedDate.toISOString().split("T")[0],
    daysUntil,
    records: dates.length,
  });
}
