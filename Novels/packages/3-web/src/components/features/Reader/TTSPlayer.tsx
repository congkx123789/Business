"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useTTS } from "@/lib/hooks/useTTS";

interface TTSPlayerProps {
  text?: string;
  disabled?: boolean;
}

const VOICES = [
  { id: "default", label: "Default" },
  { id: "narrator_female", label: "Female" },
  { id: "narrator_male", label: "Male" },
  { id: "dramatic", label: "Dramatic" },
];

const EMOTIONS = [
  { id: "calm", label: "Calm" },
  { id: "dramatic", label: "Dramatic" },
  { id: "cheerful", label: "Cheerful" },
  { id: "serious", label: "Serious" },
];

export const TTSPlayer: React.FC<TTSPlayerProps> = ({ text = "", disabled }) => {
  const { state, play, stop } = useTTS();
  const [voice, setVoice] = useState("default");
  const [emotion, setEmotion] = useState("calm");
  const [speed, setSpeed] = useState([1]);

  const handlePlay = () => {
    if (!text.trim() || disabled) return;
    play({
      text,
      voice,
      emotion,
      speed: speed[0],
    });
  };

  return (
    <div className="rounded-2xl border border-border bg-background/80 p-4 shadow-lg backdrop-blur">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-1 flex-wrap gap-3">
          <select
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={voice}
            onChange={(event) => setVoice(event.target.value)}
          >
            {VOICES.map((voiceOption) => (
              <option key={voiceOption.id} value={voiceOption.id}>
                Voice: {voiceOption.label}
              </option>
            ))}
          </select>

          <select
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={emotion}
            onChange={(event) => setEmotion(event.target.value)}
          >
            {EMOTIONS.map((emotionOption) => (
              <option key={emotionOption.id} value={emotionOption.id}>
                Emotion: {emotionOption.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Speed</span>
          <div className="w-32">
            <Slider
              disabled={disabled}
              min={0.5}
              max={2}
              step={0.1}
              value={speed}
              onValueChange={setSpeed}
            />
          </div>
          <span className="text-xs text-muted-foreground">{speed[0].toFixed(1)}x</span>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            onClick={handlePlay} 
            disabled={disabled || state.isLoading}
            data-tts-play
          >
            {state.isLoading ? "Generating…" : state.isPlaying ? "Playing…" : "Play"}
          </Button>
          {state.isPlaying && (
            <Button size="sm" variant="ghost" onClick={stop} data-tts-stop>
              Stop
            </Button>
          )}
        </div>
      </div>
      {state.error && <p className="mt-3 text-xs text-destructive">{state.error}</p>}
    </div>
  );
};


