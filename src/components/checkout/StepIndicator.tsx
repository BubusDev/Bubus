import { Check } from "lucide-react";
import React from "react";

const STEPS = ["Kapcsolat", "Szállítás", "Fizetés"];

type StepIndicatorProps = {
  currentStep: number;
};

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEPS.map((label, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition
                ${currentStep > i
                  ? "bg-[#1a1a1a] border-[#1a1a1a] text-white"
                  : currentStep === i
                    ? "bg-[#1a1a1a] border-[#1a1a1a] text-white"
                    : "border-[#ccc] text-[#aaa]"
                }`}
            >
              {currentStep > i ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={`text-xs ${currentStep === i ? "font-semibold text-[#1a1a1a]" : "text-[#aaa]"}`}
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`h-px w-16 mb-5 mx-2 transition ${currentStep > i ? "bg-[#1a1a1a]" : "bg-[#ddd]"}`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
