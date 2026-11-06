"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { clampQuantity } from "@/lib/quantity";

type QuantityStepperProps = {
  value: number;
  max: number;
  onChange: (quantity: number) => void;
  label?: string;
};

/**
 * − [n] + control limited to 1..max. Typing is allowed; the value is
 * corrected to a whole number in range when the field loses focus.
 */
export function QuantityStepper({ value, max, onChange, label = "Quantity" }: QuantityStepperProps) {
  const inputId = useId();
  // While typing, the field may briefly hold "" or an out-of-range number.
  const [draft, setDraft] = useState<string | null>(null);

  function commit(next: number) {
    setDraft(null);
    onChange(clampQuantity(next, max));
  }

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-caption font-medium">
        {label}
      </label>
      <div className="inline-flex items-center gap-1 rounded-full border border-input bg-card p-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => commit(value - 1)}
          disabled={value <= 1}
          aria-label="Decrease quantity"
        >
          <MinusIcon aria-hidden="true" />
        </Button>
        <input
          id={inputId}
          type="number"
          inputMode="numeric"
          min={1}
          max={max}
          step={1}
          value={draft ?? String(value)}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => commit(Number(draft ?? value))}
          onKeyDown={(event) => {
            if (event.key === "Enter") commit(Number(draft ?? value));
          }}
          className="h-11 w-12 [appearance:textfield] bg-transparent text-center text-base font-medium outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => commit(value + 1)}
          disabled={value >= max}
          aria-label="Increase quantity"
        >
          <PlusIcon aria-hidden="true" />
        </Button>
      </div>
      <p className="text-caption text-muted-foreground">Up to {max} available.</p>
    </div>
  );
}
