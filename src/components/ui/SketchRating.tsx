/**
 * SketchRating — React wrapper for <sakuga-rating> (Sakuga VFX).
 *
 * Five anime stars that light up consecutively with squashes, puffs,
 * wedge fans, and a hollow 'ポン' pop sound effect.
 */
import React, { useRef, useEffect } from "react";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "sakuga-rating": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          value?: number | string;
          label?: string;
          disabled?: boolean;
        },
        HTMLElement
      >;
    }
  }
}

interface SketchRatingProps {
  value?: number;
  onChange?: (val: number) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function SketchRating({
  value = 0,
  onChange,
  label = "Rating",
  disabled = false,
  className,
  style,
}: SketchRatingProps) {
  const ref = useRef<HTMLElement & { value?: number }>(null);

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
      onChange?.(el.value ?? 0);
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
    <sakuga-rating
      ref={ref}
      class={className}
      value={value}
      label={label}
      style={{
        display: "inline-flex",
        verticalAlign: "middle",
        ...style,
      }}
    />
  );
}

export default SketchRating;
