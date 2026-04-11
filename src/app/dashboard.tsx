"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Period {
  id: number;
  date: string;
  notes: string;
}

interface Prediction {
  averageCycle: number | null;
  predictedDate: string | null;
  daysUntil: number | null;
}

export default function Dashboard({
  initialPeriods,
  initialPrediction,
}: {
  initialPeriods: Period[];
  initialPrediction: Prediction;
}) {
  const router = useRouter();
  const [newDate, setNewDate] = useState(() => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Shanghai" }));
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const periods = initialPeriods;
  const prediction = initialPrediction;

  async function addPeriod() {
    if (!newDate) return;
    await fetch("/api/periods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: newDate }),
    });
    setNewDate("");
    router.refresh();
  }

  async function deletePeriod(id: number) {
    await fetch("/api/periods", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-pink-50 dark:bg-zinc-900 p-6">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-pink-700 dark:text-pink-300">
            经期记录
          </h1>
          <button
            onClick={() => router.refresh()}
            className="p-2 text-pink-600 hover:bg-pink-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
          </button>
        </div>

        {!online && (
          <div className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 rounded-xl px-4 py-3 text-sm text-center">
            当前处于离线模式，无法添加或删除记录
          </div>
        )}

        {/* Add Record */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200 mb-4">
            添加记录
          </h2>
          <div className="flex gap-2">
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="flex-1 px-3 py-2 border border-zinc-200 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200"
            />
            <button
              onClick={addPeriod}
              disabled={!online}
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              添加
            </button>
          </div>
        </div>

        {/* Prediction Card */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200 mb-4">
            预测
          </h2>
          {prediction.averageCycle ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">
                  平均周期
                </span>
                <span className="font-medium">
                  {prediction.averageCycle} 天
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">
                  预计下次
                </span>
                <span className="font-medium">{prediction.predictedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">
                  距今
                </span>
                <span
                  className={`font-bold text-lg ${
                    prediction.daysUntil !== null && prediction.daysUntil <= 3
                      ? "text-red-500"
                      : "text-pink-600 dark:text-pink-400"
                  }`}
                >
                  {prediction.daysUntil !== null && prediction.daysUntil <= 0
                    ? `已超期 ${Math.abs(prediction.daysUntil)} 天`
                    : `${prediction.daysUntil} 天`}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-zinc-400">至少需要 2 条记录才能预测</p>
          )}
        </div>

        {/* History */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200 mb-4">
            历史记录（{periods.length} 条）
          </h2>
          {periods.length > 0 ? (() => {
            const diffs = periods.slice(0, -1).map((p, i) =>
              Math.round((new Date(p.date).getTime() - new Date(periods[i + 1].date).getTime()) / (1000 * 60 * 60 * 24))
            );
            const maxDays = Math.max(31, ...diffs);
            return <ul className="space-y-2">
              {periods.map((p, i) => {
                const nextDate =
                  i < periods.length - 1 ? periods[i + 1].date : null;
                const diff = nextDate
                  ? Math.round(
                      (new Date(p.date).getTime() -
                        new Date(nextDate).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                  : null;

                const barWidth = diff !== null ? (diff / maxDays) * 100 : 0;

                return (
                  <li
                    key={p.id}
                    className="relative flex items-center gap-3 py-2 border-b border-zinc-100 dark:border-zinc-700 last:border-0"
                  >
                    {diff !== null && (
                      <div
                        className="absolute left-0 top-0 bottom-0 bg-pink-100 dark:bg-pink-900/30 rounded-r"
                        style={{ width: `${barWidth}%` }}
                      />
                    )}
                    <span className="relative w-2 h-2 rounded-full bg-pink-400" />
                    <span className="relative text-zinc-700 dark:text-zinc-300">
                      {p.date.slice(0, 10)}
                    </span>
                    <div className="flex-1" />
                    {diff !== null && (
                      <span className="relative text-xs text-zinc-400 ml-auto mr-2">
                        {diff} 天
                      </span>
                    )}
                    <button
                      onClick={() => { if (confirm("确定删除这条记录？")) deletePeriod(p.id); }}
                      disabled={!online}
                      className="relative text-xs text-red-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      删除
                    </button>
                  </li>
                );
              })}
            </ul>;
          })() : (
            <p className="text-zinc-400">暂无记录</p>
          )}
        </div>
      </div>
    </div>
  );
}
