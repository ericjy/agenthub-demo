import { useCallback } from 'react';
import { DEFAULT_USER_ID } from '@/lib/constants';

interface Conversation {
  id: string;
  createdAt: number;
  title?: string;
}

export function useConversationTitlePolling(
  conversationList: Conversation[],
  setConversationList: (list: Conversation[]) => void,
  fetchConversations: () => Promise<void>
) {
  const pollForTitle = useCallback(async (conversationId: string | null) => {
    if (!conversationId) return;

    const currentConv = conversationList.find(c => c.id === conversationId);

    // Poll for title generation if it's a new conversation or title is missing
    if (!currentConv || !currentConv.title) {
      console.log('Title missing or new conversation, polling for title...');
      let attempts = 0;
      const maxAttempts = 5;

      const pollInterval = setInterval(async () => {
        attempts++;
        await fetchConversations();

        try {
          // Check if title is now available
          const res = await fetch(`/api/conversations?userId=${DEFAULT_USER_ID}`);
          if (res.ok) {
            const data = await res.json();
            const updatedList = data.data || [];
            const updatedConv = updatedList.find((c: any) => c.id === conversationId);

            if ((updatedConv && updatedConv.title) || attempts >= maxAttempts) {
              clearInterval(pollInterval);
              if (updatedConv && updatedConv.title) {
                console.log('Title found and refreshed:', updatedConv.title);
                setConversationList([...updatedList].sort((a: any, b: any) => b.createdAt - a.createdAt));
              }
            }
          } else if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
          }
        } catch (error) {
          console.error('Error polling for title:', error);
          if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
          }
        }
      }, 2000);
    } else {
      fetchConversations();
    }
  }, [conversationList, setConversationList, fetchConversations]);

  return { pollForTitle };
}
