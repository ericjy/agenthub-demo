'use client';

import { convertOpenAIConversationItemsToAIMessages } from '@/lib/utils';
import {
  Conversation,
  ConversationContent
} from '@/components/ai-elements/conversation';
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputMessage,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools
} from '@/components/ai-elements/prompt-input';
import { useConversationTitlePolling } from '@/hooks/use-conversation-title-polling';
import { DEFAULT_USER_ID } from '@/lib/constants';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, ToolUIPart } from 'ai';
import { GlobeIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { WebSearchToolCall } from '@/components/web-search-tool-call';

import { CopyIcon, Loader2 } from 'lucide-react';
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/ai-elements/reasoning';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

interface Conversation {
  id: string;
  createdAt: number;
  title?: string;
}

export default function Chat() {

  /**
   * Stores the list of previous conversations for the sidebar.
   */
  const [conversationList, setConversationList] = useState<Conversation[]>([]);

  /**
   * Used for UI reactivity (sidebar highlighting,
   * header display, etc.). Triggers re-renders when the ID changes.
   */
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  /**
   * Used by the transport layer to avoid stale closures.
   * Ensures that the chat transport always uses the latest ID during subsequent message turns,
   * even if the transport was initialized before the ID was known.
   */
  const activeConversationIdRef = useRef<string | null>(null);

  /**
   * Fetch the list of conversations from the API.
   */
  const fetchConversations = async () => {
    try {
      const res = await fetch(`/api/conversations?userId=${DEFAULT_USER_ID}`);
      if (res.ok) {
        const data = await res.json();
        const conversations = data.data || [];
        // Sort newest first based on createdAt timestamp
        const sortedConversations = [...conversations].sort(
          (a, b) => b.createdAt - a.createdAt
        );
        setConversationList(sortedConversations);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const { pollForTitle } = useConversationTitlePolling(
    conversationList,
    setConversationList,
    fetchConversations
  );

  // Keep the ref in sync with the state for the transport layer
  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);


  /**
   * Fetch the list of conversations from the API when this component mounts.
   */
  useEffect(() => {
    fetchConversations();
  }, []);

  /**
   * Handler for starting a new chat on the sidebar.
   */
  const startNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
  };

  /**
   * Handler for selecting a conversation from the sidebar.
   */
  const selectConversation = async (id: string) => {
    console.log('Selecting conversation:', id);
    setActiveConversationId(id);

    // Clear the current messages before loading the new conversation history.
    setMessages([]);

    try {
      // fetch the conversation items from the API
      const res = await fetch(`/api/conversations/${id}`);
      if (res.ok) {
        const data = await res.json();
        const history = convertOpenAIConversationItemsToAIMessages(data);
        setMessages(history);
      } else {
        console.error('Failed to fetch conversation history');
        setMessages([]);
      }
    } catch (error) {
      console.error('Error selecting conversation:', error);
      setMessages([]);
    }
  };

  /**
   * The main Chat hook (from AI SDK) that handles the chat functionality.
   */
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      /**
       * Override the default fetch function to capture the conversation ID from the header.
       */
      fetch: async (url, init) => {
        const response = await fetch(url, init);
        const id = response.headers.get('x-conversation-id');
        if (id && !activeConversationIdRef.current) {
          console.log('Capturing new conversationId from header:', id);
          setActiveConversationId(id);
        }
        return response;
      },
      /**
       * Override the default prepareSendMessagesRequest function to include the user message in the request body.
       */
      prepareSendMessagesRequest: ({ id, messages, body }) => {
        // Convert the last UI message (which is the user messsage) to a userMessage string.
        const lastMessage = messages[messages.length - 1] as any;
        const userMessage =
          typeof lastMessage.content === 'string'
            ? lastMessage.content
            : lastMessage.parts
              ?.filter((part: any) => part.type === 'text')
              .map((part: any) => part.text)
              .join('') || '';
        return {
          body: {
            ...body,
            userMessage,
          },
        };
      },
    }),
    onFinish: () => {
      pollForTitle(activeConversationIdRef.current);
    },
    onError: (error: any) => {
      console.error('Error:', error);
      // Also add the error to the messages array
      setMessages([...messages, {
        id: 'error',
        role: 'assistant',
        parts: [{
          type: 'text',
          text: error.message,
        }],
      }]);
    },
  });

  /**
   * Ref to the scrollable div to scroll to the bottom of the chat when new messages are added.
   */
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  /**
   * Handler for submitting a message.
   */
  const handleSubmit = (message: PromptInputMessage) => {
    if (message.text.trim()) {
      sendMessage(
        {
          text: message.text,
        },
        {
          body: {
            userId: DEFAULT_USER_ID,
            model: model,
            conversationId: activeConversationIdRef.current,
            enableWebSearch: enableWebSearch,
          },
        },
      );
      setInputValue('');
    }
  };

  /**
   * The value of the input field.
   */
  const [inputValue, setInputValue] = useState('');

  /**
   * Used to control whether to enable the web search tool.
   */
  const [enableWebSearch, setEnableWebSearch] = useState(false);


  const models = [
    {
      name: 'GPT 4.1',
      value: 'openai.gpt-4.1',
    },
    {
      name: 'GPT 4o',
      value: 'openai.gpt-4o',
    },
    {
      name: 'GPT 5',
      value: 'openai.gpt-5',
    },
    {
      name: 'O1',
      value: 'openai.o3',
    },
  ];

  const [model, setModel] = useState<string>(models[0].value);

  /**
   * The main UI of the chat application.
   */
  return (
    <SidebarProvider>
      <AppSidebar
        conversations={conversationList}
        activeConversationId={activeConversationId}
        onNewChat={startNewChat}
        onSelectConversation={selectConversation}
      />
      <SidebarInset className="flex flex-col h-dvh">
        <main ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6">
            <Conversation>
              <ConversationContent>
                {messages.map((message) => (
                  <div key={message.id}>

                    {message.parts.map((part, i) => {
                      switch (part.type) {
                        case 'text':
                          return (
                            <Message key={`${message.id}-${i}`} from={message.role}>
                              <MessageContent>
                                <MessageResponse>
                                  {part.text}
                                </MessageResponse>
                              </MessageContent>
                              {message.role === 'assistant' && (
                                <MessageActions>
                                  <MessageAction
                                    onClick={() =>
                                      navigator.clipboard.writeText(part.text)
                                    }
                                    label="Copy"
                                  >
                                    <CopyIcon className="size-4" />
                                  </MessageAction>
                                </MessageActions>
                              )}
                            </Message>
                          );
                        case 'reasoning':
                          return (
                            <Reasoning
                              key={`${message.id}-${i}`}
                              className="w-full"
                              isStreaming={status === 'streaming' && i === message.parts.length - 1 && message.id === messages.at(-1)?.id}
                            >
                              <ReasoningTrigger />
                              <ReasoningContent>{part.text}</ReasoningContent>
                            </Reasoning>
                          );
                        case 'tool-web_search':
                          return (
                            <WebSearchToolCall
                              key={`${message.id}-${i}-tool-web_search`}
                              part={part as ToolUIPart}
                            />
                          );
                        default:
                          return null;
                      }
                    })}
                  </div>
                ))}
                {status === 'submitted' && <Loader2 className="animate-spin size-4" />}

              </ConversationContent>
            </Conversation>
          </div>

          {/* Spacer for sticky input */}
          <div className="h-40" />
        </main>

        <div className="sticky bottom-0 w-full bg-linear-to-t from-background via-background to-transparent pt-4 pb-6">
          <div className="max-w-4xl mx-auto px-6">
            <PromptInput onSubmit={handleSubmit} globalDrop multiple>
              <PromptInputBody>
                <PromptInputTextarea
                  onChange={(e) => setInputValue(e.target.value)}
                  value={inputValue}
                  placeholder="Ask me anything..."
                />
              </PromptInputBody>
              <PromptInputFooter>
                <PromptInputTools>

                  {/* Attachments Button */}
                  <PromptInputActionMenu>
                    <PromptInputActionMenuTrigger />
                    <PromptInputActionMenuContent>
                      <PromptInputActionAddAttachments />
                    </PromptInputActionMenuContent>
                  </PromptInputActionMenu>

                  {/* Web Search Button */}
                  <PromptInputButton
                    variant={enableWebSearch ? 'default' : 'ghost'}
                    onClick={() => setEnableWebSearch(!enableWebSearch)}
                  >
                    <GlobeIcon size={16} />
                    <span>Search</span>
                  </PromptInputButton>

                  {/* Model Selector */}
                  <PromptInputSelect
                    onValueChange={(value) => {
                      setModel(value);
                    }}
                    value={model}
                  >
                    <PromptInputSelectTrigger>
                      <PromptInputSelectValue />
                    </PromptInputSelectTrigger>
                    <PromptInputSelectContent>
                      {models.map((model) => (
                        <PromptInputSelectItem key={model.value} value={model.value}>
                          {model.name}
                        </PromptInputSelectItem>
                      ))}
                    </PromptInputSelectContent>
                  </PromptInputSelect>

                </PromptInputTools>
                <PromptInputSubmit disabled={!inputValue && !status} status={status} />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

