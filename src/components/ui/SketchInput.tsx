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
  onKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void;
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
  autoFocus?: boolean;
  style?: React.CSSProperties;
}

export const SketchInput = React.forwardRef<
  HTMLElement & { focus?: () => void; blur?: () => void; value?: string },
  SketchInputProps
>(function SketchInput(
  {
    value,
    onChange,
    onKeyDown,
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
    autoFocus,
    style,
  },
  fwdRef
) {
  const localRef = useRef<HTMLElement & { focus?: () => void; blur?: () => void; value?: string }>(null);
  const ref = (fwdRef as React.RefObject<HTMLElement & { focus?: () => void; blur?: () => void; value?: string }>) || localRef;

  // Sync value from React → custom element
  useEffect(() => {
    const el = ref.current;
    if (el && value !== undefined && el.value !== value) {
      el.value = value;
    }
  }, [value, ref]);

  // Handle autoFocus
  useEffect(() => {
    if (autoFocus && ref.current?.focus) {
      ref.current.focus();
    }
  }, [autoFocus, ref]);

  // Listen for input and keydown events
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleInput = () => {
      onChange?.(el.value ?? "");
    };
    const handleFocus = () => onFocus?.();
    const handleBlur = () => onBlur?.();
    const handleKeyDown = (e: Event) => {
      const ke = e as unknown as React.KeyboardEvent<HTMLElement>;
      onKeyDown?.(ke);
      if ((e as KeyboardEvent).key === "Enter") {
        const form = el.closest("form");
        if (form) {
          form.requestSubmit();
        }
      }
    };

    el.addEventListener("input", handleInput);
    el.addEventListener("focus", handleFocus, true);
    el.addEventListener("blur", handleBlur, true);
    el.addEventListener("keydown", handleKeyDown);
    return () => {
      el.removeEventListener("input", handleInput);
      el.removeEventListener("focus", handleFocus, true);
      el.removeEventListener("blur", handleBlur, true);
      el.removeEventListener("keydown", handleKeyDown);
    };
  }, [onChange, onFocus, onBlur, onKeyDown, ref]);

  // Sync disabled
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (disabled) el.setAttribute("disabled", "");
    else el.removeAttribute("disabled");
  }, [disabled, ref]);

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
});

export default SketchInput;
