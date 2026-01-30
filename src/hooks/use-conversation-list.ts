import { convertOpenAIConversationItemsToAIMessages } from '@/lib/utils';
import { DEFAULT_USER_ID } from '@/lib/constants';
import {
  listConversations,
  createConversation as createConversationAction,
  getConversationHistory,
} from '@/app/actions/conversations';
import { UIMessage } from '@ai-sdk/react';
import { useCallback, useEffect, useState } from 'react';
import { Conversation } from '@/lib/conversation-repository';


export function useConversationList() {

  /**
   * UI state for conversation list
   */
  const [conversationList, setConversationList] = useState<Conversation[]>([]);

  /**
   * UI state of the active conversation
   */
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  /**
   * Fetch conversations from the backend and update the UI state
   */
  const fetchConversations = useCallback(async () => {
    const result = await listConversations(DEFAULT_USER_ID);
    if (result.data) {
      const sortedConversations = [...result.data].sort(
        (a: Conversation, b: Conversation) => b.createdAt - a.createdAt
      );
      setConversationList(sortedConversations);
    } else if (result.error) {
      console.error('Failed to fetch conversations:', result.error);
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
    const result = await getConversationHistory(id);
    if (result.data) {
      return convertOpenAIConversationItemsToAIMessages(result.data);
    }
    if (result.error) {
      console.error('Failed to fetch conversation history:', result.error);
    }
    return [];
  }, []);

  /**
   * Create a new conversation and set it as active.
   * Schedules background polls to fetch title once generated.
   * Returns the new conversation ID.
   */
  const createConversation = useCallback(async (): Promise<string | null> => {
    const result = await createConversationAction(DEFAULT_USER_ID);
    if (result.data) {
      const newId = result.data.id;
      setActiveConversationId(newId);
      scheduleTitlePolls();
      return newId;
    }
    if (result.error) {
      console.error('Failed to create conversation:', result.error);
    }
    return null;
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
