import { PromptInputMessage } from '@/components/ai-elements/prompt-input';

export type ChatStatus = 'submitted' | 'streaming' | 'ready' | 'error';

export interface ModelOption {
  name: string;
  value: string;
}

export const MODELS: ModelOption[] = [
  { name: 'GPT 4.1', value: 'openai.gpt-4.1' },
  { name: 'GPT 4o', value: 'openai.gpt-4o' },
  { name: 'GPT 5', value: 'openai.gpt-5' },
  { name: 'O1', value: 'openai.o1' },
];

export interface ChatInputProps {
  onSubmit: (message: PromptInputMessage) => void;
  inputValue: string;
  onInputChange: (value: string) => void;
  enableWebSearch: boolean;
  onToggleWebSearch: () => void;
  model: string;
  onModelChange: (value: string) => void;
  status: ChatStatus;
}
