/**
 * SketchInput — React wrapper for <sakuga-input> (Sakuga VFX).
 *
 * Renders a hand-drawn text input that kicks up anime dust on keystrokes.
 * Attributes: label, placeholder, value, type, autocomplete, name, disabled.
 */
import React, { useRef, useEffect, useCallback } from "react";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "sakuga-input": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          label?: string;
          placeholder?: string;
          value?: string;
          type?: string;
          autocomplete?: string;
          name?: string;
          disabled?: boolean;
        },
        HTMLElement
      >;
    }
  }
}

interface SketchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  label?: string;
  type?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
  maxLength?: number;
  autoComplete?: string;
  style?: React.CSSProperties;
}

export function SketchInput({
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  label,
  type = "text",
  name,
  disabled = false,
  className,
  maxLength,
  autoComplete,
  style,
}: SketchInputProps) {
  const ref = useRef<HTMLElement & { value?: string }>(null);

  // Sync value from React → custom element
  useEffect(() => {
    const el = ref.current;
    if (el && value !== undefined && el.value !== value) {
      el.value = value;
    }
  }, [value]);

  // Listen for input events from the shadow-DOM <input>
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleInput = () => {
      onChange?.(el.value ?? "");
    };
    const handleFocus = () => onFocus?.();
    const handleBlur = () => onBlur?.();

    el.addEventListener("input", handleInput);
    el.addEventListener("focus", handleFocus, true);
    el.addEventListener("blur", handleBlur, true);
    return () => {
      el.removeEventListener("input", handleInput);
      el.removeEventListener("focus", handleFocus, true);
      el.removeEventListener("blur", handleBlur, true);
    };
  }, [onChange, onFocus, onBlur]);

  // Sync disabled
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (disabled) el.setAttribute("disabled", "");
    else el.removeAttribute("disabled");
  }, [disabled]);

  return (
    <sakuga-input
      ref={ref}
      class={className}
      label={label}
      placeholder={placeholder}
      type={type}
      name={name}
      autocomplete={autoComplete}
      style={style}
    />
  );
}

export default SketchInput;
