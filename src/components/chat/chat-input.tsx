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
    <PromptInput onSubmit={onSubmit} globalDrop multiple>
      <PromptInputBody>
        <PromptInputTextarea
          onChange={(e) => onInputChange(e.target.value)}
          value={inputValue}
          placeholder="Ask me anything..."
        />
      </PromptInputBody>
      <PromptInputFooter>
        <PromptInputTools>
          <PromptInputActionMenu>
            <PromptInputActionMenuTrigger />
            <PromptInputActionMenuContent>
              <PromptInputActionAddAttachments />
            </PromptInputActionMenuContent>
          </PromptInputActionMenu>

          <PromptInputButton
            variant={enableWebSearch ? 'default' : 'ghost'}
            onClick={onToggleWebSearch}
          >
            <GlobeIcon size={16} />
            <span>Search</span>
          </PromptInputButton>

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
        <PromptInputSubmit disabled={!inputValue && !status} status={status} />
      </PromptInputFooter>
    </PromptInput>
  );
}
