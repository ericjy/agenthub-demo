'use server';

import { conversationService } from '@/lib/conversation-service';

// Force Node.js runtime for better memory persistence
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * List all conversations for a user
 */
export async function listConversations(userId: string) {
  try {
    const conversations = await conversationService.listConversations(userId);
    console.log(`Fetching conversations. Registry contains ${conversations.length} items for user ${userId}`);
    return { data: conversations };
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return { error: 'Failed to fetch conversations' };
  }
}

/**
 * Create a new conversation for a user
 */
export async function createConversation(userId: string) {
  try {
    if (!userId) {
      return { error: 'userId is required' };
    }
    const conversation = await conversationService.createConversation(userId);
    return { data: conversation };
  } catch (error: any) {
    console.error('Error creating conversation:', error);
    return { error: error.message || 'Failed to create conversation' };
  }
}

/**
 * Get conversation history by ID
 */
export async function getConversationItems(conversationId: string) {
  try {
    if (!conversationId) {
      return { error: 'Conversation ID is required' };
    }
    const items = await conversationService.getConversationItems(conversationId);
    console.log('Conversation items:', items);
    return { data: items };
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return { error: 'Failed to fetch conversation history' };
  }
}
