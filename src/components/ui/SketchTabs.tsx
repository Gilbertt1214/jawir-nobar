/**
 * SketchTabs — React wrapper for <sakuga-tabs> (Sakuga VFX).
 *
 * Renders hand-drawn animated tabs. The raised tab slides with stretching effects.
 * Tabs are defined via children <option> elements.
 */
import React, { useRef, useEffect } from "react";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "sakuga-tabs": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          label?: string;
          selected?: number | string;
        },
        HTMLElement
      >;
    }
  }
}

interface Tab {
  value: string;
  label: string;
}

interface SketchTabsProps {
  tabs: Tab[];
  selected?: string;
  onSelect?: (value: string, index: number) => void;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function SketchTabs({
  tabs,
  selected,
  onSelect,
  label,
  className,
  style,
}: SketchTabsProps) {
  const ref = useRef<HTMLElement & { selected?: number; value?: string }>(null);

  // Sync selected index from React → custom element
  useEffect(() => {
    const el = ref.current;
    if (!el || selected === undefined) return;
    const idx = tabs.findIndex((t) => t.value === selected);
    if (idx >= 0 && el.selected !== idx) {
      el.selected = idx;
    }
  }, [selected, tabs]);

  // Listen for change events
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && onSelect) {
        onSelect(detail.value, detail.index);
      }
    };

    el.addEventListener("change", handleChange);
    return () => el.removeEventListener("change", handleChange);
  }, [onSelect]);

  return (
    <sakuga-tabs ref={ref} class={className} label={label} style={style}>
      {tabs.map((tab) => (
        <option key={tab.value} value={tab.value}>
          {tab.label}
        </option>
      ))}
    </sakuga-tabs>
  );
}

export default SketchTabs;
