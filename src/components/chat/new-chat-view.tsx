'use client';

import { ChatInput } from './chat-input';
import { ChatInputProps } from './types';

interface NewChatViewProps {
  chatInputProps: ChatInputProps;
}

export function NewChatView({ chatInputProps }: NewChatViewProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <ChatInput {...chatInputProps} />
      </div>
    </div>
  );
}
