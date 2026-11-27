/**
 * SketchSlider — React wrapper for <sakuga-slider> (Sakuga VFX).
 *
 * An anime spring slider with a drifting cloud, dynamic angle-leaning tooltip bubble,
 * speed lines, chips, and 'シュッ' sound effects when dragged fast.
 */
import React, { useRef, useEffect } from "react";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "sakuga-slider": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          value?: number | string;
          min?: number | string;
          max?: number | string;
          step?: number | string;
          disabled?: boolean;
          label?: string;
          unit?: string;
        },
        HTMLElement
      >;
    }
  }
}

interface SketchSliderProps {
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  unit?: string;
  onChange?: (val: number) => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function SketchSlider({
  value = 50,
  min = 0,
  max = 100,
  step = 1,
  label = "Slider",
  unit = "%",
  onChange,
  disabled = false,
  className,
  style,
}: SketchSliderProps) {
  const ref = useRef<HTMLElement & { value?: string; valueAsNumber?: number }>(null);

  useEffect(() => {
    const el = ref.current;
    if (el && value !== undefined && el.valueAsNumber !== value) {
      el.value = String(value);
    }
  }, [value]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleInput = () => {
      onChange?.(el.valueAsNumber ?? (Number(el.value) || 0));
    };

    el.addEventListener("input", handleInput);
    el.addEventListener("change", handleInput);
    return () => {
      el.removeEventListener("input", handleInput);
      el.removeEventListener("change", handleInput);
    };
  }, [onChange]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (disabled) el.setAttribute("disabled", "");
    else el.removeAttribute("disabled");
  }, [disabled]);

  return (
    <sakuga-slider
      ref={ref}
      class={className}
      value={value}
      min={min}
      max={max}
      step={step}
      label={label}
      unit={unit}
      style={{
        display: "block",
        ...style,
      }}
    />
  );
}

export default SketchSlider;
