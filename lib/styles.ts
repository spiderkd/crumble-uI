import type { CSSProperties } from "react";

export const labelStyle: CSSProperties = {
  color: "hsl(var(--muted-foreground))",
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

export const errorStyle: CSSProperties = {
  color: "hsl(var(--destructive))",
  fontSize: 12,
};

export const svgOverlay: CSSProperties = {
  inset: 0,
  overflow: "visible",
  pointerEvents: "none",
  position: "absolute",
};
