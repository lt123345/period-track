"use client";

import { useEffect } from "react";

async function ensureNotificationPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export async function updateBadge(daysUntil?: number | null) {
  if (!("setAppBadge" in navigator)) return;
  await ensureNotificationPermission();
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
