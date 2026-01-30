import { useChat } from '@ai-sdk/react';

/**
 * Custom hook to manage the chat session with AI SDK
 */
export function useChatSession() {
  const { messages, sendMessage, status, setMessages } = useChat({

    onError: (error: any) => {
      console.error('Error:', error);
      // Add error message as Assistant message to the messages array
      // So user can see the error from the Assistant
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
