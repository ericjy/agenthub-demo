'use client';

import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import { GlobeIcon } from 'lucide-react';
import { ChatInputProps, MODELS } from './types';

export function ChatInput({
  onSubmit,
  inputValue,
  onInputChange,
  enableWebSearch,
  onToggleWebSearch,
  model,
  onModelChange,
  status,
}: ChatInputProps) {
  return (
    <PromptInput onSubmit={onSubmit} globalDrop multiple inputGroupClassName="rounded-2xl">
      <PromptInputBody>

        { /* Prompt input textarea */ }
        <PromptInputTextarea
          onChange={(e) => onInputChange(e.target.value)}
          value={inputValue}
          placeholder="Ask me anything..."
          className="px-6 py-6 text-base md:text-base"
        />
      </PromptInputBody>
      <PromptInputFooter>
        <PromptInputTools>

          { /* Action menus (add attachments, and more) */ }
          <PromptInputActionMenu>
            <PromptInputActionMenuTrigger />
            <PromptInputActionMenuContent>
              <PromptInputActionAddAttachments />
            </PromptInputActionMenuContent>
          </PromptInputActionMenu>

          { /* Web search toggle */ }
          <PromptInputButton
            variant={enableWebSearch ? 'default' : 'ghost'}
            onClick={onToggleWebSearch}
          >
            <GlobeIcon size={16} />
            <span>Search</span>
          </PromptInputButton>

          { /* Model selector */ }
          <PromptInputSelect onValueChange={onModelChange} value={model}>
            <PromptInputSelectTrigger>
              <PromptInputSelectValue />
            </PromptInputSelectTrigger>
            <PromptInputSelectContent>
              {MODELS.map((m) => (
                <PromptInputSelectItem key={m.value} value={m.value}>
                  {m.name}
                </PromptInputSelectItem>
              ))}
            </PromptInputSelectContent>
          </PromptInputSelect>

        </PromptInputTools>
        {/* Reset error status when user types new input, so submit button shows arrow instead of "X" */}
        <PromptInputSubmit
          disabled={!inputValue && !status}
          status={status === 'error' && inputValue ? 'ready' : status}
        />
      </PromptInputFooter>
    </PromptInput>
  );
}
