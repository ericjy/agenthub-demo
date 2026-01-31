import { conversationService } from '@/lib/conversation-service';
import { ociOpenAI } from '@/lib/oci-openai';
import { openai, OpenAIResponsesProviderOptions } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';

/**
 * API route for sending a user message to the model on an existing conversation.
 */
export async function POST(req: Request) {
  const {
    userMessage,
    model,
    conversationId,
    enableWebSearch,
  }: {
    userMessage: string;
    model: string;
    conversationId: string;
    enableWebSearch: boolean;
  } = await req.json();

  // validate request
  if (!conversationId) {
    return NextResponse.json(
      { error: 'conversationId is required' },
      { status: 400 }
    );
  }

  // call AI SDK to process user message and stream the response
  const result = streamText({
    prompt: userMessage,
    model: ociOpenAI(model),
    tools: enableWebSearch ? { web_search: openai.tools.webSearch() } : undefined,
    providerOptions: {
      openai: {
        store: true,
        conversation: conversationId,
        reasoningEffort: 'high',
        serviceTier: 'priority',
      } satisfies OpenAIResponsesProviderOptions,
    },
    onFinish: () => {
      // Use waitUntil to ensure background title generation completes before instance terminates
      waitUntil(
        conversationService.assignConversationTitleIfAbsent(conversationId, userMessage)
      );
    },
    onError: (error) => {
      console.error('Stream error:', error);
    },
  });

  // return the response as a UI message stream response
  return result.toUIMessageStreamResponse();
}
