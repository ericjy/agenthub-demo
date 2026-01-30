import { createAndRegisterConversation, generateAndSetConversationTitle } from '@/lib/conversation-service';
import { ociOpenAI } from '@/lib/oci-openai';
import { openai, OpenAIResponsesProviderOptions } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const {
    userMessage,
    userId,
    model,
    conversationId,
    enableWebSearch,
  }: { userMessage: string; userId: string; model: string; conversationId?: string; enableWebSearch: boolean } = await req.json();

  const isNewConversation = !conversationId;
  let activeConversationId = conversationId;

  // If no conversationId is provided, create a new conversation.
  if (isNewConversation) {
    console.log('No conversationId provided in Chat API, creating a new conversation');
    try {
      const createdConversation = await createAndRegisterConversation(userId);
      activeConversationId = createdConversation.id;
      console.log(`Created new conversation ID: ${conversationId}`);
    } catch (error) {
      console.error('Failed to create conversation', error);
      return NextResponse.json(
        { error: 'Failed to create conversation'},
        { status: 500 }
      );
    }
  }

  const result = streamText({
    prompt: userMessage,
    model: ociOpenAI(model), // Use OCI OpenAI model
    // model: openai('gpt-5'), // Use Official OpenAI model
    tools: enableWebSearch ? { web_search: openai.tools.webSearch() } : undefined,
    providerOptions: {
      openai: {
        store: true,
        conversation: activeConversationId,
        reasoningEffort: 'high',
        serviceTier: 'priority',
      } satisfies OpenAIResponsesProviderOptions,
      // openai: {
      //   store: false,
      //   reasoningEffort: 'high',
      //   reasoningSummary: 'auto',
      // } satisfies OpenAIResponsesProviderOptions,
    },
    onFinish: (message) => {
      console.log('Stream finished:', message);
      // Generate title in background if it's a new conversation
      if (isNewConversation && activeConversationId) {
        // Fire and forget title generation in this demo app
        generateAndSetConversationTitle(activeConversationId, userMessage);
      }
    },
    onError: (error) => {
      console.error('Stream error:', error);
    },
  });

  return result.toUIMessageStreamResponse({
    headers: {
      'x-conversation-id': activeConversationId || '',
    },
  });
}
