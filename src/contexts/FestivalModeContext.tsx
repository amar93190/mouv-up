import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

type FestivalModeContextValue = {
  festivalMode: boolean;
  setFestivalMode: (value: boolean) => void;
  toggleFestivalMode: () => void;
};

const STORAGE_KEY = "solimouv:festival-mode";
const DEFAULT_THEME_COLOR = "#ececf0";
const FESTIVAL_THEME_COLOR = "#050f4b";

const FestivalModeContext = createContext<FestivalModeContextValue | undefined>(undefined);

type FestivalModeProviderProps = {
  children: ReactNode;
};

export function FestivalModeProvider({ children }: FestivalModeProviderProps) {
  const [festivalMode, setFestivalMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(festivalMode));
  }, [festivalMode]);

  useEffect(() => {
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    const appleStatusMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    const nextColor = festivalMode ? FESTIVAL_THEME_COLOR : DEFAULT_THEME_COLOR;

    if (themeColorMeta) {
      themeColorMeta.setAttribute("content", nextColor);
    }

    // iOS standalone: keep safe-area bar visually aligned with the active mode.
    if (appleStatusMeta) {
      appleStatusMeta.setAttribute("content", festivalMode ? "black-translucent" : "default");
    }

    document.documentElement.style.backgroundColor = nextColor;
    document.body.style.backgroundColor = nextColor;
  }, [festivalMode]);

  const value = useMemo<FestivalModeContextValue>(
    () => ({
      festivalMode,
      setFestivalMode,
      toggleFestivalMode: () => setFestivalMode((prev) => !prev)
    }),
    [festivalMode]
  );

  return <FestivalModeContext.Provider value={value}>{children}</FestivalModeContext.Provider>;
}

export function useFestivalMode() {
  const context = useContext(FestivalModeContext);

  if (!context) {
    throw new Error("useFestivalMode doit être utilisé dans FestivalModeProvider.");
  }

  return context;
}
