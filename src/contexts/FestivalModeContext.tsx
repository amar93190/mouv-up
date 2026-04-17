import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

type FestivalModeContextValue = {
  festivalMode: boolean;
  setFestivalMode: (value: boolean) => void;
  toggleFestivalMode: () => void;
};

const STORAGE_KEY = "solimouv:festival-mode";

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
