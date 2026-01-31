"use client";

import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import type { ToolUIPart } from "ai";
import { CloudSun, MapPin, Thermometer } from "lucide-react";

export interface WeatherToolCallProps {
  part: ToolUIPart;
}

export const WeatherToolCall = ({ part }: WeatherToolCallProps) => {
  const input = part.input as { location?: string } | undefined;
  const output = part.output as { location?: string; temperature?: number } | undefined;

  return (
    <Tool defaultOpen={false}>
      <ToolHeader
        title="Weather"
        type="tool-weather"
        state={part.state as ToolUIPart["state"]}
      />
      <ToolContent>
        {input?.location && <ToolInput input={{ location: input.location }} />}
        <ToolOutput
          output={
            output ? (
              <div className="flex items-center gap-6 p-4">
                <div className="flex items-center justify-center size-16 rounded-2xl bg-linear-to-br from-amber-400 to-orange-500 text-white shadow-lg">
                  <CloudSun className="size-8" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="size-3.5" />
                    <span className="text-sm font-medium">{output.location}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <Thermometer className="size-4 text-muted-foreground self-center" />
                    <span className="text-3xl font-bold tracking-tight">
                      {output.temperature}
                    </span>
                    <span className="text-lg text-muted-foreground">°F</span>
                  </div>
                </div>
              </div>
            ) : part.state === "output-available" ? (
              <div className="p-4 text-sm text-zinc-500">No weather data available.</div>
            ) : null
          }
          errorText={part.errorText}
        />
      </ToolContent>
    </Tool>
  );
};
