import { UIMessage } from '@ai-sdk/react';
import { useEffect, useRef } from 'react';

/**
 * Hook that auto-scrolls a container to the bottom when messages change.
 */
export function useAutoScroll(messages: UIMessage[], conversationId: string | null) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const previousConversationIdRef = useRef<string | null>(null);
  const previousMessageCountRef = useRef<number>(0);

  useEffect(() => {
    if (scrollRef.current) {
      const previousConversationId = previousConversationIdRef.current;
      const previousCount = previousMessageCountRef.current;
      const currentCount = messages.length;

      // Use instant scroll when:
      // 1. Switching to a different conversation (conversationId changed)
      // 2. Initial load of a conversation (0 -> many messages)
      const isConversationSwitch = previousConversationId !== conversationId;
      const isInitialLoad = previousCount === 0 && currentCount > 0;
      const behavior = isConversationSwitch || isInitialLoad ? 'instant' : 'smooth';

      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: behavior as ScrollBehavior,
      });

      previousConversationIdRef.current = conversationId;
      previousMessageCountRef.current = currentCount;
    }
  }, [messages, conversationId]);

  return scrollRef;
}
