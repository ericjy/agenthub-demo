import { PromptInputMessage } from '@/components/ai-elements/prompt-input';
import { ChatInputProps, ChatStatus, MODELS } from '@/components/chat';
import { DEFAULT_USER_ID } from '@/lib/constants';
import { useCallback, useMemo, useState } from 'react';

interface UseChatInputOptions {
  sendMessage: (
    message: { text: string },
    options: { body: Record<string, unknown> }
  ) => void;
  activeConversationId: string | null;
  createConversation: () => Promise<string | null>;
  status: ChatStatus;
}

/**
 * Custom hook to manage chat input states and props
 */
export function useChatInput({
  sendMessage,
  activeConversationId,
  createConversation,
  status,
}: UseChatInputOptions) {

  /**
   * User prompt textarea value
   */
  const [inputValue, setInputValue] = useState('');

  /**
   * Web search toggle value
   */
  const [enableWebSearch, setEnableWebSearch] = useState(false);

  /**
   * Model selection value
   */
  const [model, setModel] = useState<string>(MODELS[0].value);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    async (message: PromptInputMessage) => {

      message.text = message.text.trim();

      // pressed submit button without entering a message
      if (!message.text) {
        return;
      }

      // Create conversation first if this is a new chat
      if (!activeConversationId) {
        const newConversationId = await createConversation();
        if (!newConversationId) {
          console.error('Failed to create conversation');
          return;
        }
        activeConversationId = newConversationId;
      }

      // Send message to the backend Chat API route
      sendMessage(
        { text: message.text },
        {
          body: {
            userId: DEFAULT_USER_ID,
            model: model,
            conversationId: activeConversationId,
            enableWebSearch: enableWebSearch,
            userMessage: message.text,
          },
        }
      );
      setInputValue('');
    },
    [sendMessage, model, enableWebSearch, activeConversationId, createConversation]
  );

  /**
   * Handle web search toggle
   */
  const handleToggleWebSearch = useCallback(() => {
    setEnableWebSearch((prev) => !prev);
  }, []);

  /**
   * Chat input props
   */
  const chatInputProps: ChatInputProps = useMemo(
    () => ({
      onSubmit: handleSubmit,
      inputValue,
      onInputChange: setInputValue,
      enableWebSearch,
      onToggleWebSearch: handleToggleWebSearch,
      model,
      onModelChange: setModel,
      status,
    }),
    [handleSubmit, inputValue, enableWebSearch, handleToggleWebSearch, model, status]
  );
  return {
    inputValue,
    setInputValue,
    enableWebSearch,
    model,
    setModel,
    chatInputProps,
  };
}
