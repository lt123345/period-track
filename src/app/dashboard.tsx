"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
  const [newDate, setNewDate] = useState("");

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
        <h1 className="text-2xl font-bold text-pink-700 dark:text-pink-300">
          Period Tracker
        </h1>

        {/* Add Record */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200 mb-4">
            Add Record
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
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Prediction Card */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200 mb-4">
            Prediction
          </h2>
          {prediction.averageCycle ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">
                  Average Cycle
                </span>
                <span className="font-medium">
                  {prediction.averageCycle} days
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">
                  Next Predicted
                </span>
                <span className="font-medium">{prediction.predictedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">
                  Days Until
                </span>
                <span
                  className={`font-bold text-lg ${
                    prediction.daysUntil !== null && prediction.daysUntil <= 3
                      ? "text-red-500"
                      : "text-pink-600 dark:text-pink-400"
                  }`}
                >
                  {prediction.daysUntil !== null && prediction.daysUntil <= 0
                    ? `Overdue by ${Math.abs(prediction.daysUntil)} days`
                    : `${prediction.daysUntil} days`}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-zinc-400">Need at least 2 records to predict.</p>
          )}
        </div>

        {/* History */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-700 dark:text-zinc-200 mb-4">
            History ({periods.length} records)
          </h2>
          {periods.length > 0 ? (
            <ul className="space-y-2">
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

                return (
                  <li
                    key={p.id}
                    className="flex items-center gap-3 py-2 border-b border-zinc-100 dark:border-zinc-700 last:border-0"
                  >
                    <span className="w-2 h-2 rounded-full bg-pink-400" />
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {p.date}
                    </span>
                    {diff !== null && (
                      <span className="text-xs text-zinc-400 ml-auto mr-2">
                        {diff} days
                      </span>
                    )}
                    <button
                      onClick={() => deletePeriod(p.id)}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-zinc-400">No records yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
