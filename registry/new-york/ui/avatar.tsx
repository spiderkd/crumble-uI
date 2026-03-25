"use client";

import { useCallback, useContext, useEffect, useRef } from "react";
import rough from "roughjs";
import { cn } from "@/lib/utils";
import {
  CrumbleContext,
  getRoughOptions,
  randomSeed,
  resolveRoughVars,
  stableSeed,
  type CrumbleColorProps,
  type CrumbleTheme,
} from "@/lib/rough";

export interface AvatarProps extends CrumbleColorProps {
  animateOnHover?: boolean;
  className?: string;
  fallback?: string;
  id?: string;
  size?: number;
  src?: string;
  theme?: CrumbleTheme;
}

export interface AvatarGroupProps {
  avatars: AvatarProps[];
  className?: string;
  fill?: string;
  max?: number;
  size?: number;
  stroke?: string;
  strokeMuted?: string;
  theme?: CrumbleTheme;
}

function AvatarCircle({
  animateOnHover = true,
  className,
  fallback,
  fill,
  id,
  size = 40,
  src,
  stroke,
  strokeMuted,
  theme: themeProp,
}: AvatarProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const stableId = id ?? `avatar-${fallback ?? "user"}`;
  const { theme: contextTheme } = useContext(CrumbleContext);
  const theme = themeProp ?? contextTheme;
  const roughStyle = resolveRoughVars({ stroke, strokeMuted, fill });

  const draw = useCallback(
    (reseed = false) => {
      const svg = svgRef.current;
      if (!svg) return;

      svg.replaceChildren();
      svg.setAttribute("width", String(size));
      svg.setAttribute("height", String(size));
      svg.setAttribute("viewBox", `0 0 ${size} ${size}`);

      const rc = rough.svg(svg);
      svg.appendChild(
        rc.circle(size / 2, size / 2, size - 3, getRoughOptions(theme, "border", {
          fill: "none",
          seed: reseed ? randomSeed() : stableSeed(stableId),
          stroke: "var(--cr-stroke)",
        })),
      );
    },
    [size, stableId, theme],
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => draw());
    return () => cancelAnimationFrame(id);
  }, [draw]);

  return (
    <div
      className={cn("relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full", className)}
      style={{ ...roughStyle, width: size, height: size }}
      onMouseEnter={() => { if (animateOnHover) draw(true); }}
      onMouseLeave={() => { if (animateOnHover) draw(false); }}
    >
      {src ? (
        <img
          src={src}
          alt={fallback ?? "avatar"}
          className="h-full w-full object-cover"
          style={{ borderRadius: "50%" }}
        />
      ) : (
        <span className="text-sm font-medium text-foreground select-none">
          {fallback?.slice(0, 2).toUpperCase() ?? "?"}
        </span>
      )}
      <svg
        ref={svgRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-visible"
        style={{ width: size, height: size }}
      />
    </div>
  );
}

export function Avatar(props: AvatarProps) {
  return <AvatarCircle {...props} />;
}

export function AvatarGroup({
  avatars,
  className,
  fill,
  max = 4,
  size = 40,
  stroke,
  strokeMuted,
  theme: themeProp,
}: AvatarGroupProps) {
  const { theme: contextTheme } = useContext(CrumbleContext);
  const theme = themeProp ?? contextTheme;
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - max;
  const overlap = Math.round(size * 0.3);
  const roughStyle = resolveRoughVars({ stroke, strokeMuted, fill });

  return (
    <div
      className={cn("flex items-center", className)}
      style={{ ...roughStyle, gap: 0 }}
    >
      {visible.map((avatar, i) => (
        <div key={i} style={{ marginLeft: i === 0 ? 0 : -overlap, zIndex: i }}>
          <AvatarCircle {...avatar} size={size} theme={theme} />
        </div>
      ))}
      {overflow > 0 ? (
        <div
          className="relative inline-flex shrink-0 items-center justify-center rounded-full bg-muted"
          style={{ width: size, height: size, marginLeft: -overlap, zIndex: visible.length }}
        >
          <span className="text-xs font-medium text-muted-foreground">+{overflow}</span>
        </div>
      ) : null}
    </div>
  );
}
