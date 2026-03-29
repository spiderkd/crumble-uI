"use client";

import { useState } from "react";
import { Button } from "@/registry/new-york/ui/button";
import { Card } from "@/registry/new-york/ui/card";
import { Progress } from "@/registry/new-york/ui/progress";
import {
  Timeline,
  TimelineItem,
  type TimelineStatus,
} from "@/registry/new-york/ui/timeline";

export interface OnboardingStep {
  description: string;
  title: string;
}

export interface OnboardingStepperBlockProps {
  onComplete?: () => void;
  onStepChange?: (stepIndex: number) => void;
  steps?: OnboardingStep[];
  title?: string;
}

const DEFAULT_STEPS: OnboardingStep[] = [
  {
    title: "Create your account",
    description: "Enter your email and set a password.",
  },
  {
    title: "Pick a theme",
    description: "Choose between pencil, ink, or crayon.",
  },
  {
    title: "Install components",
    description: "Run the CLI to copy components into your project.",
  },
  {
    title: "You're all set!",
    description: "Start building with byDefaultHuman.",
  },
];

function getStepStatus(stepIndex: number, currentStep: number): TimelineStatus {
  if (stepIndex < currentStep) return "complete";
  if (stepIndex === currentStep) return "active";
  return "pending";
}

export function OnboardingStepperBlock({
  onComplete,
  onStepChange,
  steps = DEFAULT_STEPS,
  title = "Get started",
}: OnboardingStepperBlockProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const safeMaxIndex = Math.max(steps.length - 1, 0);
  const progress = safeMaxIndex === 0 ? 100 : Math.round((currentStep / safeMaxIndex) * 100);
  const isFirst = currentStep === 0;
  const isLast = currentStep >= safeMaxIndex;

  const goToStep = (nextStep: number) => {
    setCurrentStep(nextStep);
    onStepChange?.(nextStep);
  };

  return (
    <Card padding={28} style={{ overflow: "visible" }} className="w-full max-w-sm">
      <p className="mb-5 text-sm font-semibold">{title}</p>

      <Progress
        className="mb-6 w-full"
        formatValue={(value) => `${value}%`}
        label="Setup progress"
        showValue
        value={progress}
      />

      <Timeline>
        {steps.map((step, index) => (
          <TimelineItem
            key={step.title}
            description={step.description}
            isLast={index === steps.length - 1}
            status={getStepStatus(index, currentStep)}
            title={step.title}
          />
        ))}
      </Timeline>

      <div className="mt-6 flex justify-between gap-3">
        <Button
          disabled={isFirst}
          onClick={() => goToStep(Math.max(0, currentStep - 1))}
          size="sm"
          variant="ghost"
        >
          Back
        </Button>
        <Button
          onClick={() => {
            if (isLast) {
              onComplete?.();
              return;
            }
            goToStep(Math.min(safeMaxIndex, currentStep + 1));
          }}
          size="sm"
        >
          {isLast ? "Done" : "Next"}
        </Button>
      </div>
    </Card>
  );
}
