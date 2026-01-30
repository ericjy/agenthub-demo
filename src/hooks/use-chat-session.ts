import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { MutableRefObject } from 'react';

interface UseChatSessionOptions {
  activeConversationIdRef: MutableRefObject<string | null>;
  setActiveConversationId: (id: string | null) => void;
  pollForTitle: (conversationId: string | null) => void;
}

export function useChatSession({
  activeConversationIdRef,
  setActiveConversationId,
  pollForTitle,
}: UseChatSessionOptions) {
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      /**
       * Override fetch to capture conversation ID from response header.
       */
      fetch: async (url, init) => {
        const response = await fetch(url, init);
        const id = response.headers.get('x-conversation-id');
        if (id && !activeConversationIdRef.current) {
          console.log('Capturing new conversationId from header:', id);
          setActiveConversationId(id);
        }
        return response;
      },
      /**
       * Extract user message text from the last message for the request body.
       */
      prepareSendMessagesRequest: ({ messages, body }) => {
        const lastMessage = messages[messages.length - 1] as any;
        const userMessage =
          typeof lastMessage.content === 'string'
            ? lastMessage.content
            : lastMessage.parts
                ?.filter((part: any) => part.type === 'text')
                .map((part: any) => part.text)
                .join('') || '';
        return {
          body: {
            ...body,
            userMessage,
          },
        };
      },
    }),
    onFinish: () => {
      pollForTitle(activeConversationIdRef.current);
    },
    onError: (error: any) => {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: 'error',
          role: 'assistant',
          parts: [{ type: 'text', text: error.message }],
        },
      ]);
    },
  });

  return {
    messages,
    sendMessage,
    status,
    setMessages,
  };
}
