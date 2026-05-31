"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

type LayoutMode = "grid" | "side";

interface LayoutContextValue {
  mode: LayoutMode;
  toggle: () => void;
  favorites: Set<string>;
  toggleFavorite: (slug: string) => void;
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<LayoutMode>("grid");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem("tinker-layout");
      if (saved === "side" || saved === "grid") setMode(saved);
    } catch {}
    try {
      const saved = localStorage.getItem("tinker-favorites");
      if (saved) setFavorites(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  const toggle = useCallback(() => {
    setMode((prev) => {
      const next = prev === "grid" ? "side" : "grid";
      try { localStorage.setItem("tinker-layout", next); } catch {}
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((slug: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      try { localStorage.setItem("tinker-favorites", JSON.stringify(Array.from(next))); } catch {}
      return next;
    });
  }, []);

  return (
    <LayoutContext.Provider value={{ mode, toggle, favorites, toggleFavorite }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error("useLayout must be used inside LayoutProvider");
  return ctx;
}
