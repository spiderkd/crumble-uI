"use client";

import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ClipboardEvent,
} from "react";
import rough from "roughjs";
import { cn } from "@/lib/utils";
import {
  CrumbleContext,
  getRoughOptions,
  resolveRoughVars,
  stableSeed,
  type CrumbleColorProps,
  type CrumbleTheme,
} from "@/lib/rough";

export interface OtpInputProps extends CrumbleColorProps {
  className?: string;
  disabled?: boolean;
  id?: string;
  label?: string;
  length?: number;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  theme?: CrumbleTheme;
}

function OtpCell({
  cellId,
  disabled,
  focused,
  hasValue,
  theme,
  value,
}: {
  cellId: string;
  disabled: boolean;
  focused: boolean;
  hasValue: boolean;
  theme: CrumbleTheme;
  value: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  const draw = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;

    svg.replaceChildren();
    const SIZE = 44;
    svg.setAttribute("width", String(SIZE));
    svg.setAttribute("height", String(SIZE));
    svg.setAttribute("viewBox", `0 0 ${SIZE} ${SIZE}`);

    const rc = rough.svg(svg);
    const stroke = disabled
      ? "var(--cr-stroke-muted)"
      : focused
        ? "var(--cr-stroke)"
        : hasValue
          ? "var(--cr-stroke)"
          : "var(--cr-stroke-muted)";

    svg.appendChild(
      rc.rectangle(1, 1, SIZE - 2, SIZE - 2, getRoughOptions(theme, focused ? "interactive" : "border", {
        fill: "none",
        seed: stableSeed(cellId),
        stroke,
      })),
    );
  }, [cellId, disabled, focused, hasValue, theme]);

  useEffect(() => {
    const id = requestAnimationFrame(() => draw());
    return () => cancelAnimationFrame(id);
  }, [draw]);

  return (
    <div className="relative" style={{ width: 44, height: 44 }}>
      <svg ref={svgRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-visible" />
      <span className="absolute inset-0 flex items-center justify-center text-base font-mono font-medium text-foreground select-none">
        {value ? "•" : null}
      </span>
    </div>
  );
}

export function OtpInput({
  className,
  disabled = false,
  fill,
  id,
  label,
  length = 6,
  onChange,
  onComplete,
  stroke,
  strokeMuted,
  theme: themeProp,
}: OtpInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(""));
  const [focusIndex, setFocusIndex] = useState(-1);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const otpId = id ?? "otp";
  const { theme: contextTheme } = useContext(CrumbleContext);
  const theme = themeProp ?? contextTheme;
  const roughStyle = resolveRoughVars({ stroke, strokeMuted, fill });

  const updateDigits = (next: string[]) => {
    setDigits(next);
    const val = next.join("");
    onChange?.(val);
    if (val.length === length && next.every((d) => d !== "")) {
      onComplete?.(val);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      const next = [...digits];
      if (next[index]) {
        next[index] = "";
        updateDigits(next);
      } else if (index > 0) {
        next[index - 1] = "";
        updateDigits(next);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleInput = (raw: string, index: number) => {
    const char = raw.replace(/\D/g, "").slice(-1);
    if (!char) return;
    const next = [...digits];
    next[index] = char;
    updateDigits(next);
    if (index < length - 1) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length - index);
    if (!pasted) return;
    const next = [...digits];
    for (let i = 0; i < pasted.length; i++) next[index + i] = pasted[i];
    updateDigits(next);
    const lastFilled = Math.min(index + pasted.length, length - 1);
    inputRefs.current[lastFilled]?.focus();
  };

  return (
    <div className={cn("flex flex-col gap-2", className)} style={roughStyle}>
      {label ? (
        <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </label>
      ) : null}
      <div className="flex gap-2" role="group" aria-label={label ?? "one-time password"}>
        {Array.from({ length }, (_, i) => (
          <div key={i} className="relative">
            <OtpCell
              cellId={`${otpId}-cell-${i}`}
              disabled={disabled}
              focused={focusIndex === i}
              hasValue={!!digits[i]}
              theme={theme}
              value={digits[i]}
            />
            <input
              ref={(el) => { inputRefs.current[i] = el; }}
              id={i === 0 ? otpId : undefined}
              type="text"
              inputMode="numeric"
              maxLength={1}
              disabled={disabled}
              value={digits[i]}
              onFocus={() => setFocusIndex(i)}
              onBlur={() => setFocusIndex(-1)}
              onChange={(e) => handleInput(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onPaste={(e) => handlePaste(e, i)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-text"
              aria-label={`digit ${i + 1}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
