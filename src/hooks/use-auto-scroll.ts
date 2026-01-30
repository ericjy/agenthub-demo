import { UIMessage } from '@ai-sdk/react';
import { useEffect, useRef } from 'react';

/**
 * Hook that auto-scrolls a container to the bottom when messages change.
 */
export function useAutoScroll(messages: UIMessage[]) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  return scrollRef;
}
