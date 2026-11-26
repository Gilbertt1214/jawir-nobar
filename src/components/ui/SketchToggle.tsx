/**
 * SketchToggle — React wrapper for <sakuga-toggle> (Sakuga VFX).
 *
 * A switch with hand-drawn flip animation. The knob smears across the track
 * with a splash crown, and the track floods with color.
 */
import React, { useRef, useEffect } from "react";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "sakuga-toggle": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          label?: string;
          checked?: boolean;
          name?: string;
          value?: string;
          disabled?: boolean;
        },
        HTMLElement
      >;
    }
  }
}

interface SketchToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function SketchToggle({
  checked = false,
  onChange,
  label,
  name,
  disabled = false,
  className,
  style,
}: SketchToggleProps) {
  const ref = useRef<HTMLElement & { checked?: boolean }>(null);

  // Sync checked state
  useEffect(() => {
    const el = ref.current;
    if (el && el.checked !== checked) {
      el.checked = checked;
    }
  }, [checked]);

  // Listen for change events
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleChange = () => {
      onChange?.(!!el.checked);
    };

    el.addEventListener("change", handleChange);
    return () => el.removeEventListener("change", handleChange);
  }, [onChange]);

  // Sync disabled
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (disabled) el.setAttribute("disabled", "");
    else el.removeAttribute("disabled");
  }, [disabled]);

  return (
    <sakuga-toggle
      ref={ref}
      class={className}
      label={label}
      name={name}
      style={style}
    />
  );
}

export default SketchToggle;
