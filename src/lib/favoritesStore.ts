import { useState, useEffect } from "react";

export interface QuickAppRef {
  id: string;
  title: string;
  url: string;
  category?: string;
  ts: number;
}

const PIN_KEY = "prism_pinned_apps_v1";
const REC_KEY = "prism_recent_apps_v1";

function readList(key: string): QuickAppRef[] {
  try {
    const arr = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeList(key: string, items: QuickAppRef[]) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {}
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("prism-favs-updated"));
  }
}

export function isAppPinned(id: string): boolean {
  return readList(PIN_KEY).some((x) => x.id === id);
}

export function togglePinApp(item: Omit<QuickAppRef, "ts">) {
  const list = readList(PIN_KEY);
  const exists = list.some((x) => x.id === item.id);
  const next = exists
    ? list.filter((x) => x.id !== item.id)
    : [{ ...item, ts: Date.now() }, ...list].slice(0, 12);
  writeList(PIN_KEY, next);
  return !exists;
}

export function recordRecentApp(item: Omit<QuickAppRef, "ts">) {
  if (!item.id || !item.url) return;
  const list = readList(REC_KEY).filter((x) => x.id !== item.id);
  const next = [{ ...item, ts: Date.now() }, ...list].slice(0, 8);
  writeList(REC_KEY, next);
}

export function useFavoritesAndRecents() {
  const [pinned, setPinned] = useState<QuickAppRef[]>(() => (typeof window !== "undefined" ? readList(PIN_KEY) : []));
  const [recent, setRecent] = useState<QuickAppRef[]>(() => (typeof window !== "undefined" ? readList(REC_KEY) : []));

  useEffect(() => {
    const sync = () => {
      setPinned(readList(PIN_KEY));
      setRecent(readList(REC_KEY));
    };
    window.addEventListener("prism-favs-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("prism-favs-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { pinned, recent };
}
