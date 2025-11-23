// Reading settings drawer/panel
"use client";

import React, { useState, useEffect } from "react";
import { useReaderUIStore } from "@/store/reader-ui-store";
import { useReadingPreferences, useUpdateReadingPreferences } from "@/lib/hooks/useReadingPreferences";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { BACKGROUND_PRESETS, FONT_FAMILIES } from "./reader-presets";

interface ReadingSettingsPanelProps {
  open: boolean;
}

export const ReadingSettingsPanel: React.FC<ReadingSettingsPanelProps> = ({ open }) => {
  const { closeSettings } = useReaderUIStore();
  const { data: preferences } = useReadingPreferences();
  const updatePreferences = useUpdateReadingPreferences();

  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.7);
  const [backgroundColor, setBackgroundColor] = useState("#0f172a");
  const [textColor, setTextColor] = useState("#e2e8f0");
  const [readingMode, setReadingMode] = useState<"scroll" | "page-turn">("scroll");
  const [fontFamily, setFontFamily] = useState("var(--font-sans)");
  const [brightness, setBrightness] = useState([1]);
  const [tapToToggleControls, setTapToToggleControls] = useState(true);
  const [autoHideControls, setAutoHideControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState(4000);

  useEffect(() => {
    if (preferences) {
      setFontSize(preferences.fontSize ?? 16);
      setLineHeight(preferences.lineHeight ?? 1.7);
      setBackgroundColor(preferences.backgroundColor ?? "#0f172a");
      setTextColor(preferences.textColor ?? "#e2e8f0");
      setReadingMode(preferences.readingMode ?? "scroll");
      setFontFamily(preferences.fontFamily ?? "var(--font-sans)");
      setBrightness([preferences.brightness ?? 1]);
      setTapToToggleControls(preferences.tapToToggleControls ?? true);
      setAutoHideControls(preferences.autoHideControls ?? true);
      setControlsTimeout(preferences.controlsTimeout ?? 4000);
    }
  }, [preferences]);

  const handleApply = async () => {
    await updatePreferences.mutateAsync({
      fontSize,
      lineHeight,
      backgroundColor,
      textColor,
      readingMode,
      fontFamily,
      brightness: brightness[0],
      tapToToggleControls,
      autoHideControls,
      controlsTimeout,
    });
    closeSettings();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <div className="h-full w-full max-w-md bg-background border-l border-border shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="text-lg font-semibold">Reading Settings</h3>
          <Button variant="ghost" size="sm" onClick={closeSettings}>
            Close
          </Button>
        </div>
        <div className="space-y-6 p-6 text-sm">
          <div>
            <label className="mb-2 block text-sm font-medium">Font Size ({fontSize}px)</label>
            <input
              type="range"
              min={12}
              max={28}
              value={fontSize}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setFontSize(Number(event.target.value))
              }
              className="w-full"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">
              Line Height ({lineHeight.toFixed(1)})
            </label>
            <input
              type="range"
              min={1.2}
              max={2}
              step={0.1}
              value={lineHeight}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setLineHeight(Number(event.target.value))
              }
              className="w-full"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Font Family</label>
            <select
              className="w-full rounded-md border border-border bg-background px-3 py-2"
              value={fontFamily}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                setFontFamily(event.target.value)
              }
            >
              {FONT_FAMILIES.map((font) => (
                <option key={font.id} value={font.id}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Background</label>
              <Input
                type="color"
                value={backgroundColor}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setBackgroundColor(event.target.value)
                }
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Text Color</label>
              <Input
                type="color"
                value={textColor}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setTextColor(event.target.value)
                }
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Brightness ({brightness[0].toFixed(2)})</label>
            <Slider min={0.6} max={1.2} step={0.01} value={brightness} onValueChange={setBrightness} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Presets</label>
            <div className="flex flex-wrap gap-2">
              {BACKGROUND_PRESETS.map((preset) => (
                <Button
                  key={preset.id}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBackgroundColor(preset.backgroundColor);
                    setTextColor(preset.textColor);
                  }}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Reading Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={readingMode === "scroll" ? "default" : "outline"}
                onClick={() => setReadingMode("scroll")}
              >
                Scroll
              </Button>
              <Button
                variant={readingMode === "page-turn" ? "default" : "outline"}
                onClick={() => setReadingMode("page-turn")}
              >
                Page Turn
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Tap to toggle controls</p>
                <p className="text-xs text-muted-foreground">Tap center to show/hide toolbars</p>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={tapToToggleControls}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setTapToToggleControls(event.target.checked)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-hide controls</p>
                <p className="text-xs text-muted-foreground">Hide toolbars after inactivity</p>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={autoHideControls}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setAutoHideControls(event.target.checked)
                }
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Controls Timeout ({(controlsTimeout / 1000).toFixed(1)}s)
              </label>
              <Input
                type="number"
                min={1000}
                max={10000}
                value={controlsTimeout}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setControlsTimeout(Number(event.target.value))
                }
              />
            </div>
          </div>
          <Button onClick={handleApply} disabled={updatePreferences.isPending} className="w-full">
            {updatePreferences.isPending ? "Saving..." : "Apply Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
};

