'use client';

import {
  Conversation,
  ConversationContent,
} from '@/components/ai-elements/conversation';
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai-elements/reasoning';
import { WebSearchToolCall } from '@/components/web-search-tool-call';
import { UIMessage } from '@ai-sdk/react';
import { ToolUIPart } from 'ai';
import { CopyIcon, Loader2 } from 'lucide-react';
import { ChatStatus } from './types';

interface MessageListProps {
  messages: UIMessage[];
  status: ChatStatus;
}

export function MessageList({ messages, status }: MessageListProps) {
  return (
    <Conversation>
      {/* { status } */}
      <ConversationContent>
        {messages.map((message) => (
          <div key={message.id}>
            {message.parts.map((part, i) => {
              switch (part.type) {
                case 'text':
                  return (
                    <Message key={`${message.id}-${i}`} from={message.role}>
                      <MessageContent>
                        <MessageResponse>{part.text}</MessageResponse>
                      </MessageContent>
                      {message.role === 'assistant' && (
                        <MessageActions>
                          <MessageAction
                            onClick={() => navigator.clipboard.writeText(part.text)}
                            label="Copy"
                          >
                            <CopyIcon className="size-4" />
                          </MessageAction>
                        </MessageActions>
                      )}
                    </Message>
                  );
                case 'reasoning':
                  return (
                    <Reasoning
                      key={`${message.id}-${i}`}
                      className="w-full"
                      isStreaming={
                        status === 'streaming' &&
                        i === message.parts.length - 1 &&
                        message.id === messages.at(-1)?.id
                      }
                    >
                      <ReasoningTrigger />
                      <ReasoningContent>{part.text}</ReasoningContent>
                    </Reasoning>
                  );
                case 'tool-web_search':
                  return (
                    <WebSearchToolCall
                      key={`${message.id}-${i}-tool-web_search`}
                      part={part as ToolUIPart}
                    />
                  );
                default:
                  return null;
              }
            })}
          </div>
        ))}
        {status === 'submitted' && <Loader2 className="animate-spin size-4" />}
      </ConversationContent>
    </Conversation>
  );
}
