/**
 * Simple in-memory store for conversation registry items. Use real persistent database for production.
 *
 * Why do we need client side store if we are using the managed Conversations API?
 * Because Conversations API does not have the concept of end user and the capability to list all conversations for an end user.
 * This layer is responsible for storing the mapping of conversation IDs to user IDs, and the retrieval of conversations for a user.
 * This layer may be used to store other metadata about the conversation, such as summarized conversation name, etc.
 */
export interface ConversationRegistryItem {
  id: string;
  userId: string;
  createdAt: number;
  title?: string;
}

// Using global to persist across hot reloads in development
const globalForConversationRegistry = global as unknown as { conversationRegistry: ConversationRegistryItem[] };

export const conversationRegistry = globalForConversationRegistry.conversationRegistry || [];

if (process.env.NODE_ENV !== 'production') globalForConversationRegistry.conversationRegistry = conversationRegistry;
