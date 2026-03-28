"use client";

/**
 * Crumble — Waitlist / Coming Soon Page Template
 * Countdown timer with rough-bordered digit blocks, email capture,
 * social proof avatars, and a sketchy progress bar showing spots filled.
 *
 * Registry components: Input, Button, Badge, Avatar, AvatarGroup, Card,
 *                      Progress, RoughHighlight, RoughLine
 */

import { useEffect, useState } from "react";
import { Input } from "@/registry/new-york/ui/input";
import { Button } from "@/registry/new-york/ui/button";
import { Badge } from "@/registry/new-york/ui/badge";
import { AvatarGroup } from "@/registry/new-york/ui/avatar";
import { Card } from "@/registry/new-york/ui/card";
import { Progress } from "@/registry/new-york/ui/progress";
import { RoughHighlight } from "@/components/primitives/rough-highlight";
import { RoughLine } from "@/components/primitives/rough-line";

const LAUNCH_DATE = new Date(Date.now() + 18 * 24 * 60 * 60 * 1000); // 18 days from now
const TOTAL_SPOTS = 500;
const FILLED_SPOTS = 387;

function useCountdown(target: Date) {
  const [remaining, setRemaining] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, target.getTime() - Date.now());
      setRemaining({
        d: Math.floor(diff / 864e5),
        h: Math.floor((diff % 864e5) / 36e5),
        m: Math.floor((diff % 36e5) / 6e4),
        s: Math.floor((diff % 6e4) / 1e3),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return remaining;
}

function CountBlock({
  value,
  label,
  id,
}: {
  value: number;
  label: string;
  id: string;
}) {
  return (
    <Card
      id={id}
      padding={0}
      className="flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24"
    >
      <span className="text-[32px] sm:text-[40px] font-medium tabular-nums leading-none">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground mt-1">
        {label}
      </span>
    </Card>
  );
}

const PERKS = [
  { icon: "◎", text: "Lifetime 40% discount" },
  { icon: "◈", text: "Founding member badge" },
  { icon: "◇", text: "Early access — 2 weeks before launch" },
  { icon: "✦", text: "Direct input on the roadmap" },
];

export default function WaitlistPage() {
  const { d, h, m, s } = useCountdown(LAUNCH_DATE);
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const [count, setCount] = useState(FILLED_SPOTS);

  const handleJoin = () => {
    if (email.includes("@")) {
      setJoined(true);
      setCount((c) => c + 1);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden">
      {/* Faint grid background */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg,currentColor 0,currentColor 1px,transparent 1px,transparent 40px)," +
            "repeating-linear-gradient(90deg,currentColor 0,currentColor 1px,transparent 1px,transparent 40px)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg w-full gap-10">
        {/* Badge */}
        <Badge id="waitlist-badge" variant="outline" className="text-[11px]">
          🎉 &nbsp; Something new is coming
        </Badge>

        {/* Headline */}
        <div className="flex flex-col gap-4">
          <h1 className="text-[clamp(36px,8vw,72px)] font-medium leading-[1.04] tracking-tight">
            Crumble{" "}
            <span className="font-[family-name:var(--font-display)] italic">
              <RoughHighlight
                type="highlight"
                color="#fbbf24"
                opacity={0.32}
                animate
                id="waitlist-hl"
              >
                Pro
              </RoughHighlight>
            </span>
          </h1>
          <p className="text-[15px] leading-relaxed text-muted-foreground">
            Figma source files, premium themes, priority support, and a founding
            member discount — for the first 500 people.
          </p>
        </div>

        {/* Countdown */}
        <div className="flex flex-col items-center gap-4 w-full">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Launching in
          </p>
          <div className="flex items-center gap-3">
            <CountBlock value={d} label="Days" id="count-d" />
            <span className="text-2xl text-muted-foreground font-light">:</span>
            <CountBlock value={h} label="Hours" id="count-h" />
            <span className="text-2xl text-muted-foreground font-light">:</span>
            <CountBlock value={m} label="Mins" id="count-m" />
            <span className="text-2xl text-muted-foreground font-light">:</span>
            <CountBlock value={s} label="Secs" id="count-s" />
          </div>
        </div>

        {/* Spots progress */}
        <div className="w-full flex flex-col gap-2">
          <div className="flex justify-between text-[12px]">
            <span className="text-muted-foreground">
              {count} of {TOTAL_SPOTS} spots claimed
            </span>
            <span className="font-medium">{TOTAL_SPOTS - count} left</span>
          </div>
          <Progress id="waitlist-spots" value={count} max={TOTAL_SPOTS} />
        </div>

        <RoughLine orientation="horizontal" id="waitlist-div-1" />

        {/* Form */}
        {!joined ? (
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                id="waitlist-email"
              />
            </div>
            <Button size="lg" onClick={handleJoin}>
              Join waitlist →
            </Button>
          </div>
        ) : (
          <Card
            id="waitlist-success"
            padding={20}
            className="w-full flex items-center gap-3"
          >
            <span className="text-2xl">◎</span>
            <div className="text-left">
              <p className="text-[14px] font-medium">
                You&apos;re #{count} on the list!
              </p>
              <p className="text-[12px] text-muted-foreground">
                We&apos;ll email you the moment we launch.
              </p>
            </div>
          </Card>
        )}

        {/* Social proof */}
        <div className="flex items-center gap-3 text-[13px] text-muted-foreground">
          <AvatarGroup
            avatars={[
              { fallback: "PM", id: "wl-av1" },
              { fallback: "RN", id: "wl-av2" },
              { fallback: "ST", id: "wl-av3" },
              { fallback: "AK", id: "wl-av4" },
              { fallback: "JM", id: "wl-av5" },
            ]}
            size={26}
          />
          <span>{count} designers & engineers already waiting</span>
        </div>

        <RoughLine orientation="horizontal" id="waitlist-div-2" />

        {/* Perks */}
        <div className="w-full grid sm:grid-cols-2 gap-3">
          {PERKS.map((perk) => (
            <div
              key={perk.text}
              className="flex items-center gap-2.5 text-[13px]"
            >
              <span className="text-muted-foreground">{perk.icon}</span>
              <span>{perk.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 text-[12px] text-muted-foreground text-center">
        <span className="font-[family-name:var(--font-display)] italic text-foreground">
          crumble
        </span>
        <span className="mx-2">·</span>
        hand-drawn React UI · No spam, unsubscribe any time
      </footer>
    </main>
  );
}
