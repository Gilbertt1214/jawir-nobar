/**
 * SketchRadio — React wrapper for <sakuga-radio> (Sakuga VFX).
 *
 * A radio group with spring micro-interactions: picks wedge fans, twin puffs,
 * and a hollow 'ポン' pop sound effect.
 */
import React, { useRef, useEffect } from "react";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "sakuga-radio": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          label?: string;
          value?: string;
          disabled?: boolean;
          name?: string;
        },
        HTMLElement
      >;
    }
  }
}

interface RadioOption {
  value: string;
  label: string;
}

interface SketchRadioProps {
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function SketchRadio({
  options,
  value,
  onChange,
  label,
  name,
  disabled = false,
  className,
  style,
}: SketchRadioProps) {
  const ref = useRef<HTMLElement & { value?: string }>(null);

  useEffect(() => {
    const el = ref.current;
    if (el && value !== undefined && el.value !== value) {
      el.value = value;
    }
  }, [value]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleChange = () => {
      onChange?.(el.value || "");
    };

    el.addEventListener("change", handleChange);
    return () => el.removeEventListener("change", handleChange);
  }, [onChange]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (disabled) el.setAttribute("disabled", "");
    else el.removeAttribute("disabled");
  }, [disabled]);

  return (
    <sakuga-radio
      ref={ref}
      class={className}
      label={label}
      name={name}
      value={value}
      style={style}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </sakuga-radio>
  );
}

export default SketchRadio;
