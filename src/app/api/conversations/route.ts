import { NextResponse } from 'next/server';
import { createAndRegisterConversation, listConversationsByUserId } from '@/lib/conversation-service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    const conversations = await listConversationsByUserId(userId || undefined);
    console.log(`Fetching conversations. Registry contains ${conversations.length} items for user ${userId || 'all'}`);

    return NextResponse.json({
      data: conversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const conversation = await createAndRegisterConversation(userId);
    return NextResponse.json(conversation);
  } catch (error: any) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
