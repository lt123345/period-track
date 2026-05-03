import type { Metadata } from "next";
import { getDb } from "@/lib/db";
import Dashboard from "./dashboard";

export const dynamic = "force-dynamic";

const cstFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function formatDateCST(value: unknown): string {
  const d = value instanceof Date ? value : new Date(String(value));
  return cstFormatter.format(d).replace(/\//g, "-");
}

async function getData() {
  const sql = getDb();
  const rows = await sql`SELECT id, date, notes FROM periods ORDER BY date DESC`;
  console.log('rows', rows);
  const periods = rows.map((r) => ({
    id: r.id as number,
    date: formatDateCST(r.date),
    notes: String(r.notes) || "",
  }));

  const dates = periods.map((p) => p.date).sort();
  let averageCycle: number | null = null;
  let predictedDate: string | null = null;
  let daysUntil: number | null = null;

  if (dates.length >= 2) {
    const cycleLengths: number[] = [];
    for (let i = 1; i < dates.length; i++) {
      const diff = Math.round(
        (new Date(dates[i]).getTime() - new Date(dates[i - 1]).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      if (diff > 0 && diff < 60) cycleLengths.push(diff);
    }
    if (cycleLengths.length > 0) {
      averageCycle = Math.round(
        cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length
      );
      const last = new Date(dates[dates.length - 1]);
      last.setDate(last.getDate() + averageCycle);
      predictedDate = last.toISOString().split("T")[0];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      daysUntil = Math.round(
        (last.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
    }
  }

  return { periods, prediction: { averageCycle, predictedDate, daysUntil } };
}

export async function generateMetadata(): Promise<Metadata> {
  const { prediction } = await getData();
  const desc =
    prediction.daysUntil != null
      ? prediction.daysUntil <= 0
        ? `大姨妈已超期 ${Math.abs(prediction.daysUntil)} 天`
        : `下次大姨妈还有 ${prediction.daysUntil} 天`
      : "经期记录与预测";
  return {
    title: "经期记录",
    description: desc,
    openGraph: { title: "经期记录", description: desc },
  };
}

export default async function Home() {
  const { periods, prediction } = await getData();
  return <Dashboard initialPeriods={periods} initialPrediction={prediction} />;
}
