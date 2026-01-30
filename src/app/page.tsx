'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { ActiveChatView, NewChatView } from '@/components/chat';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useAutoScroll } from '@/hooks/use-auto-scroll';
import { useChatInput } from '@/hooks/use-chat-input';
import { useChatSession } from '@/hooks/use-chat-session';
import { useConversationList } from '@/hooks/use-conversation-list';
import { useCallback } from 'react';

/**
 * The core chat component
 */
export default function Chat() {
  // useConversationList hook provides building blocks to manage conversations
  const {
    conversationList,
    activeConversationId,
    activeConversationIdRef,
    setActiveConversationId,
    loadConversationHistory,
    pollForTitle,
  } = useConversationList();

  // useChatSession hook provides the chat session with AI SDK
  const { messages, sendMessage, status, setMessages } = useChatSession({
    activeConversationIdRef,
    setActiveConversationId,
    pollForTitle,
  });

  // useChatInput hook provides the chat input state and props
  const { chatInputProps } = useChatInput({
    sendMessage,
    activeConversationIdRef,
    status,
  });

  // Auto-scroll when messages change
  const scrollRef = useAutoScroll(messages);

  // Handle UI action on starting a new chat
  const handleStartNewChat = useCallback(() => {
    console.log('User starts new chat')
    setActiveConversationId(null);
    setMessages([]);
  }, [setActiveConversationId, setMessages]);

  // Handle UI action on selecting a conversation from sidebar
  const handleSelectConversation = useCallback(
    async (id: string) => {
      console.log('User selects a conversation:', id);
      setActiveConversationId(id);
      setMessages([]);
      const history = await loadConversationHistory(id);
      setMessages(history);
    },
    [setActiveConversationId, setMessages, loadConversationHistory]
  );

  // messages.length === 0 check ensures we switch to ActiveChatView as soon as
  // the user sends their first message rather than waiting for the server to return a conversation ID.
  const isNewChat = activeConversationId === null && messages.length === 0;


  return (
    <SidebarProvider>
      <AppSidebar
        conversations={conversationList}
        activeConversationId={activeConversationId}
        onNewChat={handleStartNewChat}
        onSelectConversation={handleSelectConversation}
      />
      <SidebarInset className="flex flex-col h-dvh">
        {isNewChat ? (
          <NewChatView chatInputProps={chatInputProps} />
        ) : (
          <ActiveChatView
            scrollRef={scrollRef}
            messages={messages}
            status={status}
            chatInputProps={chatInputProps}
          />
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
