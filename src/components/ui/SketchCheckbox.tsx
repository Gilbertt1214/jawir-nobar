/**
 * SketchCheckbox — React wrapper for <sakuga-checkbox> (Sakuga VFX).
 *
 * An anime-style checkbox where ticking triggers two crescent slashes, flying shards,
 * an animated drawing checkmark, and a dotted 'ズザッ' manga sound effect.
 */
import React, { useRef, useEffect } from "react";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "sakuga-checkbox": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          checked?: boolean;
          disabled?: boolean;
          value?: string;
          name?: string;
        },
        HTMLElement
      >;
    }
  }
}

interface SketchCheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  children?: React.ReactNode;
  value?: string;
  name?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function SketchCheckbox({
  checked = false,
  onChange,
  disabled = false,
  children,
  value,
  name,
  className,
  style,
}: SketchCheckboxProps) {
  const ref = useRef<HTMLElement & { checked?: boolean }>(null);

  useEffect(() => {
    const el = ref.current;
    if (el && el.checked !== checked) {
      el.checked = checked;
    }
  }, [checked]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleChange = () => {
      onChange?.(!!el.checked);
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
    <sakuga-checkbox
      ref={ref}
      class={className}
      value={value}
      name={name}
      style={{
        display: "inline-flex",
        verticalAlign: "middle",
        cursor: disabled ? "not-allowed" : "pointer",
        ...style,
      }}
    >
      {children}
    </sakuga-checkbox>
  );
}

export default SketchCheckbox;
