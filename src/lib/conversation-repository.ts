/**
 * Simple in-memory store for conversation registry items. Use real persistent database for production.
 *
 * Why do we need client side store if we are using the managed Conversations API?
 * Because Conversations API does not have the concept of end user and the capability to list all conversations for an end user.
 * This layer is responsible for storing the mapping of conversation IDs to user IDs, and the retrieval of conversations for a user.
 * This layer may be used to store other metadata about the conversation, such as summarized conversation name, etc.
 */
export interface Conversation {
  id: string;
  userId: string;
  createdAt: number;
  title?: string;
}

// Using global to persist across hot reloads in development
const globalStore = global as unknown as { conversationRepository: Conversation[] };

// Initialize the array on the global store if it doesn't exist
if (!globalStore.conversationRepository) {
  globalStore.conversationRepository = [];
}

// Always export the reference from the global store to ensure all imports use the same array instance
export const conversationRepository = globalStore.conversationRepository;
