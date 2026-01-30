import { PromptInputMessage } from '@/components/ai-elements/prompt-input';
import { ChatInputProps, ChatStatus, MODELS } from '@/components/chat';
import { DEFAULT_USER_ID } from '@/lib/constants';
import { MutableRefObject, useCallback, useMemo, useState } from 'react';

interface UseChatInputOptions {
  sendMessage: (
    message: { text: string },
    options: { body: Record<string, unknown> }
  ) => void;
  activeConversationIdRef: MutableRefObject<string | null>;
  status: ChatStatus;
}

export function useChatInput({
  sendMessage,
  activeConversationIdRef,
  status,
}: UseChatInputOptions) {
  const [inputValue, setInputValue] = useState('');
  const [enableWebSearch, setEnableWebSearch] = useState(false);
  const [model, setModel] = useState<string>(MODELS[0].value);

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      if (message.text.trim()) {
        sendMessage(
          { text: message.text },
          {
            body: {
              userId: DEFAULT_USER_ID,
              model: model,
              conversationId: activeConversationIdRef.current,
              enableWebSearch: enableWebSearch,
            },
          }
        );
        setInputValue('');
      }
    },
    [sendMessage, model, enableWebSearch, activeConversationIdRef]
  );

  const handleToggleWebSearch = useCallback(() => {
    setEnableWebSearch((prev) => !prev);
  }, []);

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
