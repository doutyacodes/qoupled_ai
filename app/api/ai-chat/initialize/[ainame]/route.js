// app/api/ai-chat/initialize/[ainame]/route.js
import { NextResponse } from "next/server";
import { authenticate } from "@/lib/jwtMiddleware";
import { 
  AI_CHARACTERS, 
  AI_CONVERSATIONS, 
  AI_MESSAGES,
  USER
} from "@/utils/schema";
import { db } from "@/utils";
import { eq, and, desc } from "drizzle-orm";

export async function GET(request, { params }) {
  const authResult = await authenticate(request);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId || userData.id;
  const { ainame } = params;

  if (!ainame) {
    return NextResponse.json(
      { error: "AI name is required." },
      { status: 400 }
    );
  }

  // console.log("JWT userData:", userData);
  // console.log("Extracted userId:", userId);

  try {
    // Verify user exists in database
    const userExists = await db
      .select({ id: USER.id })
      .from(USER)
      .where(eq(USER.id, userId))
      .limit(1)
      .execute();

    if (userExists.length === 0) {
      // console.log("User not found in database:", userId);
      return NextResponse.json(
        { error: "User not found. Please log in again." },
        { status: 404 }
      );
    }
    // Find AI character by name (case insensitive)
    const aiCharacter = await db
      .select()
      .from(AI_CHARACTERS)
      .where(eq(AI_CHARACTERS.name, ainame))
      .limit(1)
      .execute();

    if (aiCharacter.length === 0) {
      return NextResponse.json(
        { error: "AI character not found." },
        { status: 404 }
      );
    }

    const ai = aiCharacter[0];
  // console.log("Extracted aiCharacter:", ai);

    // Check if conversation already exists
    let conversation = await db
      .select()
      .from(AI_CONVERSATIONS)
      .where(and(
        eq(AI_CONVERSATIONS.userId, userId),
        eq(AI_CONVERSATIONS.aiCharacterId, ai.id),
        eq(AI_CONVERSATIONS.status, 'active')
      ))
      .limit(1)
      .execute();

    // If no conversation exists, create one
    if (conversation.length === 0) {
      const newConversation = {
        userId: userId,
        aiCharacterId: ai.id,
        conversationTitle: `Chat with ${ai.displayName}`,
        conversationType: 'single_ai',
        status: 'active',
        aiPersonalitySnapshot: JSON.stringify({
          mbtiType: ai.mbtiType,
          specialty: ai.specialty,
          responseStyle: ai.responseStyle
        }),
        userContext: JSON.stringify({
          preferredStyle: 'supportive',
          sessionStart: new Date().toISOString()
        }),
        conversationMood: 'supportive'
      };

      const insertResult = await db
        .insert(AI_CONVERSATIONS)
        .values(newConversation)
        .execute();

      const conversationId = insertResult[0].insertId;

      // Create greeting message from AI
      const greetingMessage = {
        aiConversationId: conversationId,
        senderType: 'ai',
        senderAiId: ai.id,
        content: ai.greetingMessage || `Hello! I'm ${ai.displayName}, your ${ai.specialty.toLowerCase()}. How can I help you today?`,
        messageType: 'text',
        aiConfidenceScore: 100.00,
        responseTimeMs: 500
      };

      await db
        .insert(AI_MESSAGES)
        .values(greetingMessage)
        .execute();

      // Fetch the newly created conversation
      conversation = await db
        .select()
        .from(AI_CONVERSATIONS)
        .where(eq(AI_CONVERSATIONS.id, conversationId))
        .limit(1)
        .execute();
    }

    // Get conversation messages
    const messages = await db
      .select({
        id: AI_MESSAGES.id,
        senderType: AI_MESSAGES.senderType,
        content: AI_MESSAGES.content,
        messageType: AI_MESSAGES.messageType,
        createdAt: AI_MESSAGES.createdAt
      })
      .from(AI_MESSAGES)
      .where(eq(AI_MESSAGES.aiConversationId, conversation[0].id))
      .orderBy(AI_MESSAGES.createdAt)
      .execute();

    // Format messages for frontend
    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      sender: msg.senderType,
      content: msg.content,
      timestamp: new Date(msg.createdAt).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      type: msg.messageType
    }));

    return NextResponse.json({
      success: true,
      aiCharacter: {
        id: ai.id,
        name: ai.name,
        displayName: ai.displayName,
        avatarUrl: ai.avatarUrl,
        specialty: ai.specialty,
        personalityDescription: ai.personalityDescription,
        totalConversations: ai.totalConversations,
        averageRating: ai.averageRating,
        mbtiType: ai.mbtiType // We'll use this in prompts but not expose to user
      },
      conversation: conversation[0],
      messages: formattedMessages
    });

  } catch (error) {
    console.error("Error initializing AI chat:", error);
    return NextResponse.json(
      { 
        error: "Failed to initialize chat", 
        details: process.env.NODE_ENV === 'development' ? error.message : undefined 
      },
      { status: 500 }
    );
  }
}