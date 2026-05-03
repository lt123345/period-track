"use client";

import { useEffect } from "react";

export function updateBadge(daysUntil?: number | null) {
  if (!("setAppBadge" in navigator)) return;
  try {
    if (daysUntil != null) {
      navigator.setAppBadge(Math.max(0, daysUntil));
    } else {
      navigator.clearAppBadge();
    }
  } catch {
    // badge API not supported or failed
  }
}

export default function RegisterSW({ daysUntil }: { daysUntil?: number | null }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }
    updateBadge(daysUntil);
  }, [daysUntil]);
  return null;
}
