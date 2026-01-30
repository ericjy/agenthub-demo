import { convertOpenAIConversationItemsToAIMessages } from '@/lib/utils';
import { DEFAULT_USER_ID } from '@/lib/constants';
import { UIMessage } from '@ai-sdk/react';
import { useCallback, useEffect, useState } from 'react';


/**
 * Conversation UI representation
 */
export interface ConversationListItem {
  id: string;
  createdAt: number;
  title?: string;
}

export function useConversationList() {
  const [conversationList, setConversationList] = useState<ConversationListItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  /**
   * Fetch conversations from the backend
   */
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch(`/api/conversations?userId=${DEFAULT_USER_ID}`);
      if (res.ok) {
        const data = await res.json();
        const conversations = data.data || [];
        const sortedConversations = [...conversations].sort(
          (a: ConversationListItem, b: ConversationListItem) => b.createdAt - a.createdAt
        );
        setConversationList(sortedConversations);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  }, []);

  /**
   * Schedule background polls to fetch conversation list for title updates.
   * Polls at 2s, 7s (2+5), and 17s (2+5+10) after creation.
   */
  const scheduleTitlePolls = useCallback(() => {
    const delays = [2000, 7000, 17000];
    delays.forEach((delay) => {
      setTimeout(() => {
        fetchConversations();
      }, delay);
    });
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

  /**
   * Create a new conversation and set it as active.
   * Schedules background polls to fetch title once generated.
   * Returns the new conversation ID.
   */
  const createConversation = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: DEFAULT_USER_ID }),
      });
      if (res.ok) {
        const data = await res.json();
        const newId = data.id;
        setActiveConversationId(newId);
        // Schedule polls to pick up the title once generated
        scheduleTitlePolls();
        return newId;
      }
      console.error('Failed to create conversation');
      return null;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  }, [scheduleTitlePolls]);

  /**
   * Fetch conversations on mount
   */
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversationList,
    activeConversationId,
    setActiveConversationId,
    loadConversationHistory,
    createConversation,
  };
}
