/**
 * SketchButton — React wrapper for <sakuga-button> (Sakuga VFX).
 *
 * Renders a hand-drawn style button with anime impact VFX on click.
 * Forwards children, onClick, disabled, className, and type.
 * Keyboard Enter/Space works because <sakuga-button> hosts a real <button> in shadow DOM.
 */
import React, { useRef, useEffect, useCallback } from "react";

// Declare the custom element for JSX (React 18 IntrinsicElements)
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "sakuga-button": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          variant?: "secondary";
          type?: "button" | "submit" | "reset";
          disabled?: boolean;
        },
        HTMLElement
      >;
    }
  }
}

interface SketchButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent | Event) => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  variant?: "secondary";
  /** Extra inline styles on the host element */
  style?: React.CSSProperties;
}

export function SketchButton({
  children,
  onClick,
  disabled = false,
  className,
  type = "button",
  variant,
  style,
}: SketchButtonProps) {
  const ref = useRef<HTMLElement>(null);

  // Forward click events from the shadow-DOM <button> to the React handler
  useEffect(() => {
    const el = ref.current;
    if (!el || !onClick) return;

    const handler = (e: Event) => {
      onClick(e);
    };

    el.addEventListener("click", handler);
    return () => el.removeEventListener("click", handler);
  }, [onClick]);

  // Sync the disabled attribute imperatively (boolean attributes need toggling)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (disabled) {
      el.setAttribute("disabled", "");
    } else {
      el.removeAttribute("disabled");
    }
  }, [disabled]);

  return (
    <sakuga-button
      ref={ref}
      class={className}
      type={type}
      {...(variant ? { variant } : {})}
      style={style}
    >
      {children}
    </sakuga-button>
  );
}

export default SketchButton;
