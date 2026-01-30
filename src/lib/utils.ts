import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Utility function to map OpenAI conversation items to AI SDK messages.
 */
export function convertOpenAIConversationItemsToAIMessages(data: any): any[] {
  const ociItems = (Array.isArray(data) ? data : (data.data || data.items || []))
    .filter((item: any) => item.role !== undefined && item.role !== null);

  return ociItems.map((item: any) => {
    let text = '';
    if (typeof item.content === 'string') {
      text = item.content;
    } else if (Array.isArray(item.content)) {
      text = item.content.map((part: any) => {
        if (typeof part.text === 'string') return part.text;
        if (typeof part.text === 'object' && part.text?.value) return part.text.value;
        return part.text || '';
      }).join('');
    }

    return {
      id: item.id || Math.random().toString(36).substring(7),
      role: item.role,
      content: text,
      parts: [{ type: 'text', text }]
    };
  });
}
