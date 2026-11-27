/**
 * SketchProgress — React wrapper for <sakuga-progress> (Sakuga VFX).
 *
 * An anime progress bar ridden by a storm cloud, trailing dust speed lines,
 * ground pebble physics, and a full impact burst with 'ドン!' on completion.
 */
import React, { useRef, useEffect, useImperativeHandle, forwardRef } from "react";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "sakuga-progress": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          value?: number | string;
          label?: string;
          demo?: boolean;
        },
        HTMLElement
      >;
    }
  }
}

export interface SketchProgressHandle {
  set: (n: number, instant?: boolean) => void;
  reset: () => void;
}

interface SketchProgressProps {
  value?: number; // 0 to 1
  label?: string;
  demo?: boolean;
  onDone?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const SketchProgress = forwardRef<SketchProgressHandle, SketchProgressProps>(
  ({ value, label = "Loading", demo = false, onDone, className, style }, fwdRef) => {
    const ref = useRef<
      HTMLElement & {
        set?: (n: number, instant?: boolean) => void;
        reset?: () => void;
      }
    >(null);

    useImperativeHandle(fwdRef, () => ({
      set: (n: number, instant?: boolean) => ref.current?.set?.(n, instant),
      reset: () => ref.current?.reset?.(),
    }));

    useEffect(() => {
      const el = ref.current;
      if (el && value !== undefined && el.set) {
        el.set(value);
      }
    }, [value]);

    useEffect(() => {
      const el = ref.current;
      if (!el || !onDone) return;

      const handleDone = () => onDone();
      el.addEventListener("sakuga:done", handleDone);
      return () => el.removeEventListener("sakuga:done", handleDone);
    }, [onDone]);

    return (
      <sakuga-progress
        ref={ref}
        class={className}
        label={label}
        {...(demo ? { demo: true } : {})}
        style={{
          display: "block",
          ...style,
        }}
      />
    );
  }
);

SketchProgress.displayName = "SketchProgress";
export default SketchProgress;
