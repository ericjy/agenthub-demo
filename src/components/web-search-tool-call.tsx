"use client";

import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import type { ToolUIPart } from "ai";

export interface WebSearchToolCallProps {
  part: ToolUIPart;
}

export const WebSearchToolCall = ({ part }: WebSearchToolCallProps) => {
  const output = part.output as any;
  const action = output?.action;
  const sources = output?.sources as any[];

  return (
    <Tool defaultOpen={false}>
      <ToolHeader
        title="Web Search"
        type="tool-web_search"
        state={part.state as ToolUIPart["state"]}
      />
      <ToolContent className="bg-none!">
        {action?.query && <ToolInput input={{ query: action.query }} />}
        <ToolOutput
          className="bg-transparent!"
          output={
            sources && sources.length > 0 ? (
              <div className="flex flex-col gap-2 px-5">
                <div className="flex items-center gap-2 px-2">
                  <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
                  <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 py-2">
                    Sources
                  </h5>
                  <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
                </div>
                <div className="flex flex-col gap-2.5">
                  {sources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/source flex flex-col gap-2 rounded-xl border p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors truncate"
                    >
                      <div className="flex items-start justify-between gap-4">
                        {source.url}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ) : part.state === "output-available" ? (
              <div className="p-4 text-sm text-zinc-500">No sources found.</div>
            ) : null
          }
          errorText={part.errorText}
        />
      </ToolContent>
    </Tool>
  );
};
