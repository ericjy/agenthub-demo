'use client';

import { UIMessage } from '@ai-sdk/react';
import { RefObject } from 'react';
import { ChatInput } from './chat-input';
import { MessageList } from './message-list';
import { ChatInputProps, ChatStatus } from './types';

interface ActiveChatViewProps {
  scrollRef: RefObject<HTMLDivElement | null>;
  messages: UIMessage[];
  status: ChatStatus;
  chatInputProps: ChatInputProps;
}

export function ActiveChatView({
  scrollRef,
  messages,
  status,
  chatInputProps,
}: ActiveChatViewProps) {
  return (
    <>
      <main ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          <MessageList messages={messages} status={status} />
        </div>
        <div className="h-40" />
      </main>

      <div className="sticky bottom-0 w-full bg-linear-to-t from-background via-background to-transparent pt-4 pb-6">
        <div className="max-w-4xl mx-auto px-6">
          <ChatInput {...chatInputProps} />
        </div>
      </div>
    </>
  );
}
