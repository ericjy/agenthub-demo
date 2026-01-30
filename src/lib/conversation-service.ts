import { conversationRepository, Conversation } from '@/lib/conversation-repository';
import { createOpenAIConversation, ociOpenAI, retrieveOpenAIConversationItems } from './oci-openai';
import { generateText } from 'ai';

/**
 * Service for managing conversations.
 */
class ConversationService {

  /**
   * Creates a new conversation.
   */
  async createConversation(userId: string): Promise<{ id: string; createdAt: number }> {
    if (!userId) {
      throw new Error('userId is required');
    }

    const conversationId = await createOpenAIConversation();
    const createdAt = Date.now();
    await this.saveConversation(conversationId, userId, createdAt);

    return {
      id: conversationId,
      createdAt: createdAt
    };
  }

  /**
   * Lists all conversations for a user.
   */
  async listConversations(userId?: string): Promise<Conversation[]> {
    if (userId) {
      return conversationRepository.filter(item => item.userId === userId);
    }
    return [...conversationRepository];
  }

  /**
   * Gets a conversation (metadata)by ID.
   */
  async getConversation(conversationId: string): Promise<Conversation | undefined> {
    return conversationRepository.find(c => c.id === conversationId);
  }

  /**
   * Gets conversation history by ID.
   */
  async getConversationHistory(conversationId: string): Promise<any> {
    return await retrieveOpenAIConversationItems(conversationId);
  }

  /**
   * Updates the title of a conversation in the repository.
   */
  async updateConversationTitle(conversationId: string, title: string): Promise<void> {
    const existingIndex = conversationRepository.findIndex(c => c.id === conversationId);
    if (existingIndex > -1) {
      conversationRepository[existingIndex].title = title;
      console.log(`Updated conversation ${conversationId} title to: ${title}`);
    } else {
      console.warn(`Could not find conversation ${conversationId} to update title`);
    }
  }

  /**
   * Generates a title for a conversation based on the first message and updates the repository.
   * Only generates if the conversation doesn't already have a title.
   * This is intended to be run in the background after the first message is sent.
   */
  async assignConversationTitleIfAbsent(conversationId: string, firstMessage: string): Promise<void> {
    try {
      // Check if conversation already has a title
      const conversation = await this.getConversation(conversationId);
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
      await this.updateConversationTitle(conversationId, cleanedTitle);
    } catch (error) {
      console.error('Failed to generate background title:', error);
    }
  }

  /**
   * Saves a conversation to the repository.
   */
  async saveConversation(conversationId: string, userId: string, createdAt?: number, title?: string): Promise<void> {
    const existingIndex = conversationRepository.findIndex(c => c.id === conversationId);

    if (existingIndex > -1) {
      // Update existing conversation
      const existingItem = conversationRepository[existingIndex];
      conversationRepository[existingIndex] = {
        ...existingItem,
        userId,
        createdAt: createdAt || existingItem.createdAt,
        title: title || existingItem.title
      };
    } else {
      // Create new conversation
      conversationRepository.push({
        id: conversationId,
        userId,
        createdAt: createdAt || Date.now(),
        title
      });
    }

    console.log(`Saved conversation ${conversationId} for user ${userId}${title ? ` with title: ${title}` : ''}`);
  }
}

export const conversationService = new ConversationService();