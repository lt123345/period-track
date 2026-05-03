"use client";

import { useEffect } from "react";

export async function updateBadge() {
  if (!("setAppBadge" in navigator)) return;
  try {
    const res = await fetch("/api/prediction");
    const data = await res.json();
    if (data.daysUntil != null) {
      navigator.setAppBadge(Math.max(0, data.daysUntil));
    } else {
      navigator.clearAppBadge();
    }
  } catch {
    // offline or fetch failed — leave badge as-is
  }
}

export default function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }
    updateBadge();
  }, []);
  return null;
}
