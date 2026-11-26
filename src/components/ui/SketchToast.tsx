/**
 * SketchToast — React wrapper for <sakuga-toast> (Sakuga VFX).
 *
 * A notification that streaks in from the left with anime dust effects.
 * Position it fixed in a corner. Call show(message) to display.
 */
import React, { useRef, useEffect, useImperativeHandle, forwardRef } from "react";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "sakuga-toast": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          duration?: number | string;
          message?: string;
        },
        HTMLElement
      >;
    }
  }
}

export interface SketchToastHandle {
  show: (message?: string) => void;
  hide: () => void;
}

interface SketchToastProps {
  duration?: number;
  message?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const SketchToast = forwardRef<SketchToastHandle, SketchToastProps>(
  ({ duration = 2.6, message, className, style }, fwdRef) => {
    const ref = useRef<HTMLElement & { show?: (m?: string) => void; hide?: () => void }>(null);

    useImperativeHandle(fwdRef, () => ({
      show: (msg?: string) => ref.current?.show?.(msg),
      hide: () => ref.current?.hide?.(),
    }));

    return (
      <sakuga-toast
        ref={ref}
        class={className}
        duration={duration}
        message={message}
        style={{
          position: "fixed",
          left: "24px",
          bottom: "24px",
          zIndex: 9999,
          ...style,
        }}
      />
    );
  }
);

SketchToast.displayName = "SketchToast";
export default SketchToast;
