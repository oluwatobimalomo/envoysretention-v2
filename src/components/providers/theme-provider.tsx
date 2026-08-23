"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useServerInsertedHTML } from "next/navigation";

/**
 * Minimal drop-in replacement for `next-themes`. next-themes hasn't been
 * updated since March 2025 and injects its no-flash-of-wrong-theme script
 * as a <script> tag rendered inside a Client Component — a pattern React
 * 19 now explicitly warns about ("Encountered a script tag while
 * rendering React component"). The warning is cosmetic (theme switching
 * still works correctly either way), but it shows as a persistent red
 * error in the dev overlay on every page load, which isn't something we
 * want to just live with.
 *
 * This does the same job — read the saved theme before paint, apply the
 * 'dark' class, avoid a flash — but injects that startup script via
 * Next.js's own `useServerInsertedHTML` hook, which writes directly into
 * the HTML stream rather than becoming part of React's reconciled
 * component tree, so it doesn't trigger the warning at all.
 */

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({ theme: "system", setTheme: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

const STORAGE_KEY = "envoys-theme";

const INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('${STORAGE_KEY}');
    var theme = stored || 'system';
    var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);
  } catch (e) {}
})();
`;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    return (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? "system";
  });

  useServerInsertedHTML(() => (
    <script dangerouslySetInnerHTML={{ __html: INIT_SCRIPT }} />
  ));

  const applyTheme = useCallback((next: Theme) => {
    const isDark = next === "dark" || (next === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  useEffect(() => {
    applyTheme(theme);
    if (theme !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [theme, applyTheme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}
