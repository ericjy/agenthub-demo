import { NextResponse } from 'next/server';
import { retrieveOpenAIConversationItems } from '@/lib/oci-openai';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    const data = await retrieveOpenAIConversationItems(id);
    console.log('Conversation items:', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
