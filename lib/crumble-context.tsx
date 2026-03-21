"use client";

import {
  createContext,
  useEffect,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import {
  getCrumbleConfig,
  type CrumbleConfig,
  type CrumbleTheme,
} from "@/lib/rough";

export interface CrumbleContextValue extends CrumbleConfig {
  setTheme: (theme: CrumbleTheme) => void;
}

const noopSetTheme = () => {};

export const CrumbleContext = createContext<CrumbleContextValue>({
  ...getCrumbleConfig(),
  setTheme: noopSetTheme,
});

export function CrumbleProvider({
  children,
  theme,
  animateOnMount,
  animateOnHover,
}: PropsWithChildren<Partial<CrumbleConfig>>) {
  const config = getCrumbleConfig();
  const resolvedTheme = theme ?? config.theme;
  const resolvedAnimateOnMount = animateOnMount ?? config.animateOnMount;
  const resolvedAnimateOnHover = animateOnHover ?? config.animateOnHover;
  const [currentTheme, setCurrentTheme] = useState(resolvedTheme);

  useEffect(() => {
    setCurrentTheme(resolvedTheme);
  }, [resolvedTheme]);

  const value = useMemo(
    () => ({
      animateOnHover: resolvedAnimateOnHover,
      animateOnMount: resolvedAnimateOnMount,
      setTheme: setCurrentTheme,
      theme: currentTheme,
    }),
    [resolvedAnimateOnHover, resolvedAnimateOnMount, currentTheme],
  );

  return (
    <CrumbleContext.Provider value={value}>
      <div data-crumble-theme={currentTheme}>{children}</div>
    </CrumbleContext.Provider>
  );
}

export function useCrumble() {
  const context = useContext(CrumbleContext);

  if (context.setTheme === noopSetTheme) {
    return {
      ...getCrumbleConfig(),
      setTheme: noopSetTheme,
    };
  }

  return context;
}
