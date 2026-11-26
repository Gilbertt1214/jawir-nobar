/**
 * SketchTooltip — React wrapper for <sakuga-tooltip> (Sakuga VFX).
 *
 * A help button with a speech-bubble hint that springs out with anime puffs.
 * Content inside replaces the "?" on the button.
 */
import React, { useRef } from "react";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "sakuga-tooltip": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          text?: string;
          label?: string;
        },
        HTMLElement
      >;
    }
  }
}

interface SketchTooltipProps {
  text: string;
  label?: string;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function SketchTooltip({
  text,
  label,
  children,
  className,
  style,
}: SketchTooltipProps) {
  return (
    <sakuga-tooltip
      text={text}
      label={label}
      class={className}
      style={style}
    >
      {children}
    </sakuga-tooltip>
  );
}

export default SketchTooltip;
