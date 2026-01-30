import { conversationRegistry, ConversationRegistryItem } from './conversation-registry';
import { createOpenAIConversation, ociOpenAI } from './oci-openai';
import { generateText } from 'ai';

/**
 * Creates a new conversation in the OCI GenAI service and registers it in the registry.
 */
export async function createAndRegisterConversation(userId: string): Promise<{ id: string; createdAt: number }> {
  if (!userId) {
    throw new Error('userId is required');
  }

  const conversationId = await createOpenAIConversation();
  const createdAt = Date.now();
  await registerConversation(conversationId, userId, createdAt);

  return {
    id: conversationId,
    createdAt: createdAt
  };
}

/**
 * Registers a conversation in the registry.
 */
export async function registerConversation(conversationId: string, userId: string, createdAt?: number, title?: string): Promise<void> {
  const existingIndex = conversationRegistry.findIndex(c => c.id === conversationId);

  if (existingIndex > -1) {
    // Update existing item
    const existingItem = conversationRegistry[existingIndex];
    conversationRegistry[existingIndex] = {
      ...existingItem,
      userId,
      createdAt: createdAt || existingItem.createdAt,
      title: title || existingItem.title
    };
  } else {
    // Create new item
    conversationRegistry.push({
      id: conversationId,
      userId,
      createdAt: createdAt || Date.now(),
      title
    });
  }

  console.log(`Registered conversation ${conversationId} for user ${userId}${title ? ` with title: ${title}` : ''}`);
}

/**
 * Updates the title of a conversation in the registry.
 */
export async function updateConversationTitle(conversationId: string, title: string): Promise<void> {
  const existingIndex = conversationRegistry.findIndex(c => c.id === conversationId);
  if (existingIndex > -1) {
    conversationRegistry[existingIndex].title = title;
    console.log(`Updated conversation ${conversationId} title to: ${title}`);
  } else {
    console.warn(`Could not find conversation ${conversationId} to update title`);
  }
}

/**
 * Lists all conversations for a user in the registry.
 */
export async function listConversationsByUserId(userId?: string): Promise<ConversationRegistryItem[]> {
  if (userId) {
    return conversationRegistry.filter(item => item.userId === userId);
  }
  return [...conversationRegistry];
}

/**
 * Gets a conversation from the registry by ID.
 */
export function getConversation(conversationId: string): ConversationRegistryItem | undefined {
  return conversationRegistry.find(c => c.id === conversationId);
}

/**
 * Generates a title for a conversation based on the first message and updates the registry.
 * Only generates if the conversation doesn't already have a title.
 * This is intended to be run in the background after the first message is sent.
 */
export async function assignConversationTitleIfAbsent(conversationId: string, firstMessage: string): Promise<void> {
  try {
    // Check if conversation already has a title
    const conversation = getConversation(conversationId);
    if (conversation?.title) {
      console.log(`Conversation ${conversationId} already has title: ${conversation.title}, skipping generation`);
      return;
    }

    console.log(`Generating title for conversation ${conversationId}...`);
    const { text: title } = await generateText({
      // use a smaller model for title generation
      model: ociOpenAI('openai.gpt-4.1'),
      prompt: `Generate a short, concise title (3-5 words) for a conversation that starts with this message: "${firstMessage}". Output only the title text.`,
    });
    const cleanedTitle = title.trim().replace(/^["']|["']$/g, '');
    await updateConversationTitle(conversationId, cleanedTitle);
  } catch (error) {
    console.error('Failed to generate background title:', error);
  }
}