import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value: number[];
  onValueChange: (value: number[]) => void;
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, onValueChange, min = 0, max = 1, step = 0.1, disabled, ...props }, ref) => {
    return (
      <input
        type="range"
        ref={ref}
        className={cn(
          "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary disabled:cursor-not-allowed",
          className
        )}
        value={value[0]}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={(event) => onValueChange([Number(event.target.value)])}
        {...props}
      />
    );
  }
);

Slider.displayName = "Slider";


