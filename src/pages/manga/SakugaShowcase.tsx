import React, { useState, useRef } from "react";
import {
  SketchButton,
  SketchInput,
  SketchTabs,
  SketchToggle,
  SketchCheckbox,
  SketchRadio,
  SketchSlider,
  SketchRating,
  SketchProgress,
  SketchToast,
  SketchToastHandle,
  SketchTooltip,
} from "@/components/ui/sakuga";
import { toast } from "sonner";
import { Sparkles, Check, Copy, ExternalLink, Flame } from "lucide-react";

interface ControlCardProps {
  title: string;
  tag: string;
  instruction: string;
  children: React.ReactNode;
  info?: React.ReactNode;
  slug: string;
}

function ControlCard({ title, tag, instruction, children, info, slug }: ControlCardProps) {
  const [copied, setCopied] = useState(false);

  const copyInstall = () => {
    navigator.clipboard.writeText(`npx shadcn add finktheartist/sakuga-vfx/${slug}`);
    toast.success(`Copied install command for ${slug}!`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyPrompt = () => {
    const promptText = `Please add the Sakuga VFX <sakuga-${slug}> component with solid manga styling and Patrick Hand font.`;
    navigator.clipboard.writeText(promptText);
    toast.success(`Copied AI prompt for ${slug}!`);
  };

  return (
    <div className="flex flex-col justify-between rounded-2xl border-[2.5px] border-[#0f172a] dark:border-zinc-700 bg-card p-6 shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#0f172a] dark:hover:shadow-[6px_6px_0px_#000000] transition-all min-h-[380px]">
      <div>
        <div className="flex items-baseline gap-2 mb-1">
          <h3 className="text-xl font-bold text-foreground tracking-wide">{title}</h3>
          <span className="text-sm font-semibold text-muted-foreground font-mono">
            &lt;{tag}&gt;
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-6 font-medium">{instruction}</p>

        {/* Component Display Box */}
        <div className="flex flex-col items-center justify-center min-h-[140px] py-4 px-2">
          {children}
          {info && <div className="mt-4 text-xs font-semibold text-muted-foreground">{info}</div>}
        </div>
      </div>

      {/* Action Buttons (Docs, Copy Install, Copy Prompt) */}
      <div className="pt-4 border-t border-dashed border-border/80 flex flex-wrap gap-2">
        <button
          onClick={() => window.open(`https://sakuga-vfx.vercel.app/gallery/`, "_blank")}
          className="text-xs px-2.5 py-1.5 rounded-md border border-[#0f172a]/40 dark:border-zinc-600 bg-secondary hover:bg-primary hover:text-primary-foreground font-bold transition-all shadow-[1.5px_1.5px_0px_#0f172a] dark:shadow-[1.5px_1.5px_0px_#000]"
        >
          Docs and demo
        </button>
        <button
          onClick={copyInstall}
          className="text-xs px-2.5 py-1.5 rounded-md border border-[#0f172a]/40 dark:border-zinc-600 bg-secondary hover:bg-primary hover:text-primary-foreground font-bold transition-all shadow-[1.5px_1.5px_0px_#0f172a] dark:shadow-[1.5px_1.5px_0px_#000] flex items-center gap-1"
        >
          {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
          Copy install
        </button>
        <button
          onClick={copyPrompt}
          className="text-xs px-2.5 py-1.5 rounded-md border border-[#0f172a]/40 dark:border-zinc-600 bg-secondary hover:bg-primary hover:text-primary-foreground font-bold transition-all shadow-[1.5px_1.5px_0px_#0f172a] dark:shadow-[1.5px_1.5px_0px_#000]"
        >
          Copy a prompt for your agent
        </button>
      </div>
    </div>
  );
}

export default function SakugaShowcase() {
  const [sliderVal, setSliderVal] = useState(40);
  const [activeTab, setActiveTab] = useState("Settings");
  const [toggleState, setToggleState] = useState(false);
  const [checkboxState, setCheckboxState] = useState(false);
  const [radioState, setRadioState] = useState("a");
  const [ratingVal, setRatingVal] = useState(5);
  const [inputValue, setInputValue] = useState("");
  const [progressDone, setProgressDone] = useState(false);

  const toastRef = useRef<SketchToastHandle>(null);

  const handleSaveToast = () => {
    toastRef.current?.show("Saved! ドン!");
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Toast Host */}
      <SketchToast ref={toastRef} duration={3} />

      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border-2 border-[#0f172a] dark:border-zinc-600 bg-accent text-accent-foreground font-bold text-sm mb-3 shadow-[2px_2px_0px_#0f172a]">
          <Flame className="w-4 h-4 text-red-500 animate-pulse" />
          Manga Theme & Patrick Hand Font
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight flex items-center gap-3">
          Sakuga VFX
          <span className="text-2xl text-red-500 select-none manga-sfx">ドン!</span>
        </h1>
        <p className="mt-3 text-lg sm:text-xl text-muted-foreground max-w-3xl font-medium leading-relaxed">
          Twelve ordinary controls that react like anime: squash and overshoot on springs,
          and drawn effects (smoke, impact bursts, splashes, slashes) with manga sound-effect
          lettering. Each one styled solid with 100% Patrick Hand font.
        </p>

        <div className="flex flex-wrap items-center gap-3 mt-5">
          <a
            href="https://github.com/finktheartist/sakuga-vfx"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border-2 border-[#0f172a] dark:border-zinc-700 bg-secondary hover:bg-primary hover:text-primary-foreground font-bold text-sm shadow-[2.5px_2.5px_0px_#0f172a] dark:shadow-[2.5px_2.5px_0px_#000] transition-all"
          >
            The repo on GitHub <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://x.com/crtvTeknologist"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border-2 border-[#0f172a] dark:border-zinc-700 bg-secondary hover:bg-primary hover:text-primary-foreground font-bold text-sm shadow-[2.5px_2.5px_0px_#0f172a] dark:shadow-[2.5px_2.5px_0px_#000] transition-all"
          >
            @crtvTeknologist on X <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Grid of 12 Controls (Exactly like the Sakuga VFX screenshot) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Primary Button */}
        <ControlCard
          title="Primary button"
          tag="sakuga-button"
          instruction="Click it."
          slug="button"
        >
          <SketchButton onClick={() => toast.success("Impact frame triggered! 💥")}>
            Confirm
          </SketchButton>
        </ControlCard>

        {/* 2. Secondary Button */}
        <ControlCard
          title="Secondary button"
          tag="sakuga-button"
          instruction="Click it."
          slug="button"
        >
          <SketchButton variant="secondary" onClick={() => toast("Secondary action!")}>
            Cancel
          </SketchButton>
        </ControlCard>

        {/* 3. Toggle */}
        <ControlCard
          title="Toggle"
          tag="sakuga-toggle"
          instruction="Flip it, then flip it back."
          slug="toggle"
          info={<span>State: {toggleState ? "ON (Active)" : "OFF"}</span>}
        >
          <SketchToggle
            checked={toggleState}
            onChange={(checked) => setToggleState(checked)}
          />
        </ControlCard>

        {/* 4. Slider */}
        <ControlCard
          title="Slider"
          tag="sakuga-slider"
          instruction="Drag it fast, and let go while it is moving."
          slug="slider"
          info={<span>change: {sliderVal}%</span>}
        >
          <div className="w-full max-w-[260px]">
            <SketchSlider
              value={sliderVal}
              unit="%"
              onChange={(val) => setSliderVal(val)}
            />
          </div>
        </ControlCard>

        {/* 5. Checkbox */}
        <ControlCard
          title="Checkbox"
          tag="sakuga-checkbox"
          instruction="Tick it."
          slug="checkbox"
        >
          <SketchCheckbox
            checked={checkboxState}
            onChange={(checked) => setCheckboxState(checked)}
          >
            Remember me
          </SketchCheckbox>
        </ControlCard>

        {/* 6. Radio */}
        <ControlCard
          title="Radio"
          tag="sakuga-radio"
          instruction="Pick the other one."
          slug="radio"
        >
          <SketchRadio
            options={[
              { value: "a", label: "Option A" },
              { value: "b", label: "Option B" },
            ]}
            value={radioState}
            onChange={(val) => setRadioState(val)}
          />
        </ControlCard>

        {/* 7. Text Input */}
        <ControlCard
          title="Text input"
          tag="sakuga-input"
          instruction="Click it and type."
          slug="input"
        >
          <div className="w-full max-w-[260px]">
            <SketchInput
              placeholder="Type something"
              value={inputValue}
              onChange={(val) => setInputValue(val)}
            />
          </div>
        </ControlCard>

        {/* 8. Tabs */}
        <ControlCard
          title="Tabs"
          tag="sakuga-tabs"
          instruction="Pick another tab, or use the arrow keys."
          slug="tabs"
          info={<span>Tab: {activeTab}</span>}
        >
          <SketchTabs
            tabs={[
              { value: "Home", label: "Home" },
              { value: "Profile", label: "Profile" },
              { value: "Settings", label: "Settings" },
            ]}
            selected={activeTab}
            onSelect={(val) => setActiveTab(val)}
          />
        </ControlCard>

        {/* 9. Rating */}
        <ControlCard
          title="Rating"
          tag="sakuga-rating"
          instruction="Give it five."
          slug="rating"
        >
          <SketchRating
            value={ratingVal}
            onChange={(val) => {
              setRatingVal(val);
              if (val === 5) toast.success("5 Stars! Anime burst activated! 🌟");
            }}
          />
        </ControlCard>

        {/* 10. Progress */}
        <ControlCard
          title="Progress"
          tag="sakuga-progress"
          instruction="It plays a load by itself, in surges. Click it to start again."
          slug="progress"
          info={<span>{progressDone ? "sakuga:done ✔" : "Loading surges..."}</span>}
        >
          <div className="w-full max-w-[260px]">
            <SketchProgress
              demo
              onDone={() => setProgressDone(true)}
            />
          </div>
        </ControlCard>

        {/* 11. Toast */}
        <ControlCard
          title="Toast"
          tag="sakuga-toast"
          instruction="Press Save."
          slug="toast"
        >
          <SketchButton onClick={handleSaveToast}>
            Save
          </SketchButton>
        </ControlCard>

        {/* 12. Tooltip */}
        <ControlCard
          title="Tooltip"
          tag="sakuga-tooltip"
          instruction="Hover, focus or tap the button."
          slug="tooltip"
        >
          <SketchTooltip text="Anime spring hint with smoke puffs! 💨">
            ?
          </SketchTooltip>
        </ControlCard>
      </div>

      {/* Footer Banner */}
      <div className="mt-12 p-6 rounded-2xl border-[2.5px] border-[#0f172a] dark:border-zinc-700 bg-card shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#000000] text-center">
        <p className="text-sm font-semibold text-muted-foreground leading-relaxed">
          Effects are drawn on one canvas over the page and switch off for{" "}
          <code className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono">
            prefers-reduced-motion
          </code>
          . Every colour is a{" "}
          <code className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono">
            --sk-*
          </code>{" "}
          variable you can override. All rendered with the hand-drawn{" "}
          <span className="font-bold text-foreground">Patrick Hand font</span> and solid manga theme.
        </p>
      </div>
    </div>
  );
}
