"use client";

import { cn } from "@/lib/utils";
import * as RadixSlider from "@radix-ui/react-slider";
import { AlertCircle, CheckCircle2 } from "lucide-react";

/** A contextual hint shown when value falls within [upTo] range */
export interface SliderHint {
  /** Hint shown when value <= upTo (use Infinity for the catch-all last entry) */
  upTo: number;
  text: string;
}

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
  /** Ordered array of contextual hints shown based on current value */
  hints?: SliderHint[];
  /** Research/community benchmark value — shown as a reference marker label */
  benchmark?: number;
  /** Label for the benchmark, e.g. "avg" */
  benchmarkLabel?: string;
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
  hints,
  benchmark,
  benchmarkLabel = "avg",
  className,
}: SliderFieldProps) {
  const percentage = ((value - min) / (max - min)) * 100;
  const activeHint = hints?.find((h) => value <= h.upTo)?.text ?? null;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium" style={{ color: "var(--page-text)" }}>{label}</label>
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
          aria-valuetext={activeHint ? `${value} — ${activeHint}` : `${value}${minLabel && value === min ? ` (${minLabel})` : maxLabel && value === max ? ` (${maxLabel})` : ''}`}
        />
      </RadixSlider.Root>

      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          {minLabel && <span className="text-xs text-slate-calm">{minLabel}</span>}
        </div>
        <div className="flex items-center gap-2">
          {benchmark !== undefined && (
            <span className="text-[10px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
              {benchmarkLabel}: {benchmark}
            </span>
          )}
          {maxLabel && <span className="text-xs text-slate-calm">{maxLabel}</span>}
        </div>
      </div>

      {/* Inline contextual hint */}
      {activeHint && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100">
          <span className="text-amber-500 flex-shrink-0 text-sm leading-tight mt-0.5" aria-hidden="true">ℹ</span>
          <p className="text-xs text-amber-700 leading-relaxed">{activeHint}</p>
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
  error?: string;
  success?: string;
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
  error,
  success,
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
          aria-invalid={!!error}
          aria-describedby={error ? `${label}-error` : success ? `${label}-success` : undefined}
          className={cn(
            error ? "input-field-error" : success ? "input-field-success" : "input-field",
            prefix && "pl-8",
            suffix && "pr-12"
          )}
        />
        {suffix && (
          <span className="absolute right-3 text-sm text-slate-calm">{suffix}</span>
        )}
      </div>
      {error && (
        <p id={`${label}-error`} className="field-error-message">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </p>
      )}
      {!error && success && (
        <p id={`${label}-success`} className="field-success-message">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          {success}
        </p>
      )}
    </div>
  );
}

/* ── TextInput ─────────────────────────────────────────────────────── */

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "password" | "url" | "tel";
  description?: string;
  error?: string;
  success?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  description,
  error,
  success,
  required,
  disabled,
  className,
}: TextInputProps) {
  const inputId = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={inputId} className="label-field">
        {label}
        {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
      </label>
      {description && <p className="text-xs text-slate-calm">{description}</p>}
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : success ? `${inputId}-success` : undefined}
        className={cn(
          error ? "input-field-error" : success ? "input-field-success" : "input-field"
        )}
      />
      {error && (
        <p id={`${inputId}-error`} className="field-error-message">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </p>
      )}
      {!error && success && (
        <p id={`${inputId}-success`} className="field-success-message">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          {success}
        </p>
      )}
    </div>
  );
}
