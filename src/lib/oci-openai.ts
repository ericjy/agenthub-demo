import { createOpenAI } from '@ai-sdk/openai';

export const OCI_CONVERSATION_STORE_ID = `ocid1.generativeaiconversationstore.oc1.us-chicago-1.amaaaaaacqy6p4qaaq5ymeh6afdixp3mxyonzsexqbgfdst3xh52su2vwmwq`;
export const OCI_BASE_URL = `https://inference.generativeai.us-chicago-1.oci.oraclecloud.com/openai/v1`;

/**
 * Creates a new OCI OpenAI client.
 */
export const ociOpenAI = createOpenAI({
  baseURL: OCI_BASE_URL,
  apiKey: process.env.OCI_GENAI_API_KEY,
  headers: {
    'opc-conversation-store-id': OCI_CONVERSATION_STORE_ID,
  },
});

/**
 * Creates a new conversation in the OCI GenAI service.
 */
export async function createOpenAIConversation(): Promise<string> {
  const response = await fetch(`${OCI_BASE_URL}/conversations`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OCI_GENAI_API_KEY}`,
      'Content-Type': 'application/json',
      'opc-conversation-store-id': OCI_CONVERSATION_STORE_ID,
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create OCI conversation: ${errorText}`);
  }

  const data = await response.json();
  if (!data.id) {
    throw new Error('OCI conversation response did not include an ID.');
  }

  return data.id;
}

/**
 * Retrieves items of a conversation from the OCI GenAI service.
 */
export async function retrieveOpenAIConversationItems(conversationId: string): Promise<any> {
  const response = await fetch(`${OCI_BASE_URL}/conversations/${conversationId}/items?order=asc`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.OCI_GENAI_API_KEY}`,
      'Content-Type': 'application/json',
      'opc-conversation-store-id': OCI_CONVERSATION_STORE_ID,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to retrieve OCI conversation ${conversationId}: ${errorText}`);
  }

  return response.json();
}
