import { convertOpenAIConversationItemsToAIMessages } from '@/lib/utils';
import { DEFAULT_USER_ID } from '@/lib/constants';
import { useConversationTitlePolling } from '@/hooks/use-conversation-title-polling';
import { UIMessage } from '@ai-sdk/react';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface ConversationData {
  id: string;
  createdAt: number;
  title?: string;
}

export function useConversationList() {
  const [conversationList, setConversationList] = useState<ConversationData[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  /**
   * Ref to track active conversation ID for use in callbacks without stale closures.
   */
  const activeConversationIdRef = useRef<string | null>(null);

  // Keep the ref in sync with the state
  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch(`/api/conversations?userId=${DEFAULT_USER_ID}`);
      if (res.ok) {
        const data = await res.json();
        const conversations = data.data || [];
        const sortedConversations = [...conversations].sort(
          (a: ConversationData, b: ConversationData) => b.createdAt - a.createdAt
        );
        setConversationList(sortedConversations);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  }, []);

  const { pollForTitle } = useConversationTitlePolling(
    conversationList,
    setConversationList,
    fetchConversations
  );

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  /**
   * Load conversation history by ID.
   * Returns the messages or empty array on failure.
   */
  const loadConversationHistory = useCallback(async (id: string): Promise<UIMessage[]> => {
    try {
      const res = await fetch(`/api/conversations/${id}`);
      if (res.ok) {
        const data = await res.json();
        return convertOpenAIConversationItemsToAIMessages(data);
      }
      console.error('Failed to fetch conversation history');
      return [];
    } catch (error) {
      console.error('Error loading conversation:', error);
      return [];
    }
  }, []);

  return {
    conversationList,
    activeConversationId,
    activeConversationIdRef,
    setActiveConversationId,
    loadConversationHistory,
    pollForTitle,
  };
}
