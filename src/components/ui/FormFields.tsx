"use client";

import { cn } from "@/lib/utils";
import * as RadixSlider from "@radix-ui/react-slider";

interface SliderFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  minLabel?: string;
  maxLabel?: string;
  description?: string;
  className?: string;
}

export function SliderField({
  label,
  value,
  onChange,
  min = 1,
  max = 10,
  step = 1,
  minLabel,
  maxLabel,
  description,
  className,
}: SliderFieldProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-deep-charcoal">{label}</label>
        <span className="text-sm font-semibold text-soft-gold bg-brand-50 px-2.5 py-0.5 rounded-lg">
          {value}
        </span>
      </div>

      {description && (
        <p className="text-xs text-slate-calm">{description}</p>
      )}

      <RadixSlider.Root
        className="relative flex items-center select-none touch-none w-full h-7"
        value={[value]}
        onValueChange={(vals) => onChange(vals[0])}
        min={min}
        max={max}
        step={step}
      >
        <RadixSlider.Track className="bg-stone-200 relative grow rounded-full h-2">
          <RadixSlider.Range
            className="absolute bg-gradient-to-r from-brand-400 to-soft-gold rounded-full h-full"
          />
        </RadixSlider.Track>
        <RadixSlider.Thumb
          className="block w-6 h-6 bg-white border-2 border-soft-gold rounded-full shadow-sm
                     focus:outline-none focus:ring-2 focus:ring-soft-gold focus:ring-offset-1
                     hover:scale-110 transition-transform duration-150 cursor-pointer"
          aria-label={label}
        />
      </RadixSlider.Root>

      {(minLabel || maxLabel) && (
        <div className="flex justify-between">
          <span className="text-xs text-slate-calm">{minLabel}</span>
          <span className="text-xs text-slate-calm">{maxLabel}</span>
        </div>
      )}
    </div>
  );
}

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  description?: string;
  className?: string;
}

export function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix,
  suffix,
  description,
  className,
}: NumberInputProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="label-field">{label}</label>
      {description && <p className="text-xs text-slate-calm">{description}</p>}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-sm font-medium text-slate-calm">{prefix}</span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            if (!isNaN(val)) onChange(val);
          }}
          min={min}
          max={max}
          step={step}
          className={cn(
            "input-field",
            prefix && "pl-8",
            suffix && "pr-12"
          )}
        />
        {suffix && (
          <span className="absolute right-3 text-sm text-slate-calm">{suffix}</span>
        )}
      </div>
    </div>
  );
}
