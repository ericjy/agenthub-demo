import { conversationService } from '@/lib/conversation-service';
import { ociOpenAI } from '@/lib/oci-openai';
import { openai, OpenAIResponsesProviderOptions } from '@ai-sdk/openai';
import { stepCountIs, streamText, tool } from 'ai';
import { NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import z from 'zod';

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
    tools: {
      ...(enableWebSearch ? { web_search: openai.tools.webSearch() } : {}),
      weather: tool({
        description: 'Get the weather in a location',
        inputSchema: z.object({
          location: z.string().describe('The location to get the weather for'),
        }),
        execute: async ({ location }) => ({
          location,
          temperature: 72 + Math.floor(Math.random() * 21) - 10,
        }),
      }),
    },
    stopWhen: stepCountIs(5),
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
  });

  // return the response as a UI message stream response 
  return result.toUIMessageStreamResponse({
    onError: (error: unknown) => {
      console.error('Stream error:', error);
      return 'An error occurred while processing your request';
    },
  });
}
