// app/api/group-chats/[id]/route.js
import { NextResponse } from "next/server";
import { authenticate } from "@/lib/jwtMiddleware";
import axios from "axios";
import { 
  GROUP_CHATS,
  GROUP_CHAT_PARTICIPANTS,
  GROUP_CHAT_MESSAGES,
  AI_CHARACTERS,
  USER,
  USER_AI_FRIENDS,
  USER_IMAGES // ADDED: Import USER_IMAGES table
} from "@/utils/schema";
import { db } from "@/utils";
import { eq, and, desc, inArray } from "drizzle-orm";

// GET group chat messages
export async function GET(request, { params }) {
  const authResult = await authenticate(request);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId || userData.id;
  const { id: groupChatId } = params;

  try {
    // Verify user is participant in this group chat
    const participant = await db
      .select()
      .from(GROUP_CHAT_PARTICIPANTS)
      .where(and(
        eq(GROUP_CHAT_PARTICIPANTS.groupChatId, groupChatId),
        eq(GROUP_CHAT_PARTICIPANTS.userId, userId),
        eq(GROUP_CHAT_PARTICIPANTS.isActive, true)
      ))
      .limit(1)
      .execute();

    if (participant.length === 0) {
      return NextResponse.json(
        { error: "Access denied to this group chat." },
        { status: 403 }
      );
    }

    // Get group chat details
    const groupChat = await db
      .select({
        id: GROUP_CHATS.id,
        chatName: GROUP_CHATS.chatName,
        createdAt: GROUP_CHATS.createdAt,
        primaryAiCharacterId: GROUP_CHATS.aiCharacterId
      })
      .from(GROUP_CHATS)
      .where(eq(GROUP_CHATS.id, groupChatId))
      .limit(1)
      .execute();

    if (groupChat.length === 0) {
      return NextResponse.json(
        { error: "Group chat not found." },
        { status: 404 }
      );
    }

    // Get all participants with profile images
    const participants = await db
      .select({
        userId: USER.id,
        username: USER.username,
        // REMOVED: profileImageUrl from USER table
        role: GROUP_CHAT_PARTICIPANTS.role,
        joinedAt: GROUP_CHAT_PARTICIPANTS.joinedAt,
        // ADDED: profile image from USER_IMAGES
        profileImageUrl: USER_IMAGES.image_url
      })
      .from(GROUP_CHAT_PARTICIPANTS)
      .innerJoin(USER, eq(GROUP_CHAT_PARTICIPANTS.userId, USER.id))
      .leftJoin(USER_IMAGES, and( // ADDED: Join with USER_IMAGES table
        eq(USER_IMAGES.user_id, GROUP_CHAT_PARTICIPANTS.userId),
        eq(USER_IMAGES.is_profile, true)
      ))
      .where(and(
        eq(GROUP_CHAT_PARTICIPANTS.groupChatId, groupChatId),
        eq(GROUP_CHAT_PARTICIPANTS.isActive, true)
      ))
      .execute();

    // Get all AI characters that have participated in this chat
    const aiCharactersInChat = await db
      .select({
        id: AI_CHARACTERS.id,
        displayName: AI_CHARACTERS.displayName,
        avatarUrl: AI_CHARACTERS.avatarUrl,
        specialty: AI_CHARACTERS.specialty,
        mbtiType: AI_CHARACTERS.mbtiType
      })
      .from(AI_CHARACTERS)
      .innerJoin(GROUP_CHAT_MESSAGES, eq(AI_CHARACTERS.id, GROUP_CHAT_MESSAGES.senderAiId))
      .where(eq(GROUP_CHAT_MESSAGES.groupChatId, groupChatId))
      .execute();

    // Remove duplicates
    const uniqueAiCharacters = aiCharactersInChat.filter((ai, index, self) => 
      index === self.findIndex(a => a.id === ai.id)
    );

    // Get messages with profile images
    const messages = await db
      .select({
        id: GROUP_CHAT_MESSAGES.id,
        senderType: GROUP_CHAT_MESSAGES.senderType,
        senderUserId: GROUP_CHAT_MESSAGES.senderUserId,
        senderAiId: GROUP_CHAT_MESSAGES.senderAiId,
        content: GROUP_CHAT_MESSAGES.content,
        messageType: GROUP_CHAT_MESSAGES.messageType,
        createdAt: GROUP_CHAT_MESSAGES.createdAt,
        username: USER.username,
        // REMOVED: userAvatar from USER table
        aiName: AI_CHARACTERS.displayName,
        aiAvatar: AI_CHARACTERS.avatarUrl,
        // ADDED: user profile image from USER_IMAGES
        userProfileImageUrl: USER_IMAGES.image_url
      })
      .from(GROUP_CHAT_MESSAGES)
      .leftJoin(USER, eq(GROUP_CHAT_MESSAGES.senderUserId, USER.id))
      .leftJoin(AI_CHARACTERS, eq(GROUP_CHAT_MESSAGES.senderAiId, AI_CHARACTERS.id))
      .leftJoin(USER_IMAGES, and( // ADDED: Join with USER_IMAGES for user profile images
        eq(USER_IMAGES.user_id, GROUP_CHAT_MESSAGES.senderUserId),
        eq(USER_IMAGES.is_profile, true)
      ))
      .where(and(
        eq(GROUP_CHAT_MESSAGES.groupChatId, groupChatId),
        eq(GROUP_CHAT_MESSAGES.isDeleted, false)
      ))
      .orderBy(GROUP_CHAT_MESSAGES.createdAt)
      .execute();

    // Format messages
    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      sender: msg.senderType,
      senderId: msg.senderUserId || msg.senderAiId,
      senderName: msg.senderType === 'user' ? msg.username : msg.aiName,
      senderAvatar: msg.senderType === 'user' ? msg.userProfileImageUrl : msg.aiAvatar, // UPDATED: Use from USER_IMAGES
      content: msg.content,
      type: msg.messageType,
      timestamp: new Date(msg.createdAt).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      isCurrentUser: msg.senderType === 'user' && msg.senderUserId === userId
    }));

    return NextResponse.json({
      success: true,
      groupChat: groupChat[0],
      participants: participants.map(participant => ({
        id: participant.userId,
        username: participant.username,
        profileImageUrl: participant.profileImageUrl, // UPDATED: Now from USER_IMAGES
        role: participant.role,
        joinedAt: participant.joinedAt
      })),
      aiCharacters: uniqueAiCharacters,
      messages: formattedMessages
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching group chat:", error);
    return NextResponse.json(
      { error: "Failed to fetch group chat" },
      { status: 500 }
    );
  }
}

// POST new message to group chat
export async function POST(request, { params }) {
  const authResult = await authenticate(request);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId || userData.id;
  const { id: groupChatId } = params;
  const { message } = await request.json();

  if (!message?.trim()) {
    return NextResponse.json(
      { error: "Message content is required." },
      { status: 400 }
    );
  }

  try {
    // Verify user is participant in this group chat
    const participant = await db
      .select()
      .from(GROUP_CHAT_PARTICIPANTS)
      .where(and(
        eq(GROUP_CHAT_PARTICIPANTS.groupChatId, groupChatId),
        eq(GROUP_CHAT_PARTICIPANTS.userId, userId),
        eq(GROUP_CHAT_PARTICIPANTS.isActive, true)
      ))
      .limit(1)
      .execute();

    if (participant.length === 0) {
      return NextResponse.json(
        { error: "Access denied to this group chat." },
        { status: 403 }
      );
    }

    // Save user message
    const userMessage = await db.insert(GROUP_CHAT_MESSAGES).values({
      groupChatId: groupChatId,
      senderType: 'user',
      senderUserId: userId,
      content: message.trim(),
      messageType: 'text'
    }).execute();

    // Get all AI characters that are part of this group chat
    const aiCharactersInChat = await db
      .select({
        id: AI_CHARACTERS.id,
        displayName: AI_CHARACTERS.displayName,
        personalityDescription: AI_CHARACTERS.personalityDescription,
        mbtiType: AI_CHARACTERS.mbtiType,
        specialty: AI_CHARACTERS.specialty
      })
      .from(AI_CHARACTERS)
      .innerJoin(GROUP_CHAT_MESSAGES, eq(AI_CHARACTERS.id, GROUP_CHAT_MESSAGES.senderAiId))
      .where(eq(GROUP_CHAT_MESSAGES.groupChatId, groupChatId))
      .execute();

    // Remove duplicates and get unique AI characters
    const uniqueAiCharacters = aiCharactersInChat.filter((ai, index, self) => 
      index === self.findIndex(a => a.id === ai.id)
    );

    if (uniqueAiCharacters.length === 0) {
      return NextResponse.json({ error: "No AI characters found in this group chat" }, { status: 404 });
    }

    // Get recent conversation history with profile images
    const recentMessages = await db
      .select({
        senderType: GROUP_CHAT_MESSAGES.senderType,
        content: GROUP_CHAT_MESSAGES.content,
        username: USER.username,
        aiName: AI_CHARACTERS.displayName,
        // ADDED: user profile image for context
        userProfileImageUrl: USER_IMAGES.image_url
      })
      .from(GROUP_CHAT_MESSAGES)
      .leftJoin(USER, eq(GROUP_CHAT_MESSAGES.senderUserId, USER.id))
      .leftJoin(AI_CHARACTERS, eq(GROUP_CHAT_MESSAGES.senderAiId, AI_CHARACTERS.id))
      .leftJoin(USER_IMAGES, and( // ADDED: Join with USER_IMAGES
        eq(USER_IMAGES.user_id, GROUP_CHAT_MESSAGES.senderUserId),
        eq(USER_IMAGES.is_profile, true)
      ))
      .where(eq(GROUP_CHAT_MESSAGES.groupChatId, groupChatId))
      .orderBy(desc(GROUP_CHAT_MESSAGES.createdAt))
      .limit(15)
      .execute();

    const conversationHistory = recentMessages.reverse();

    // Determine which AI should respond (use simple round-robin or content-based selection)
    const lastAiMessage = conversationHistory.filter(msg => msg.senderType === 'ai').pop();
    let respondingAi;

    if (!lastAiMessage) {
      // First AI response, use primary AI (first one)
      respondingAi = uniqueAiCharacters[0];
    } else {
      // Find current AI index and select next one (round-robin)
      const currentAiIndex = uniqueAiCharacters.findIndex(ai => ai.displayName === lastAiMessage.aiName);
      const nextAiIndex = (currentAiIndex + 1) % uniqueAiCharacters.length;
      respondingAi = uniqueAiCharacters[nextAiIndex];
    }

    // Create system prompt for group chat context with multiple AIs
    const otherAiNames = uniqueAiCharacters
      .filter(ai => ai.id !== respondingAi.id)
      .map(ai => ai.displayName);

    const systemPrompt = `You are ${respondingAi.displayName}, facilitating a group conversation between two people who were matched based on personality compatibility. 

Your personality: ${respondingAi.personalityDescription}
Your MBTI type: ${respondingAi.mbtiType}
Your specialty: ${respondingAi.specialty}

${otherAiNames.length > 0 ? 
  `You are working alongside ${otherAiNames.join(' and ')} in this group chat. Each of you brings different perspectives and expertise. You should:` : 
  'As the group chat facilitator, you should:'
}

- Help break the ice between the two participants
- Ask engaging questions that help them get to know each other
- Share insights about their compatibility when appropriate
- Keep the conversation flowing naturally
- Be warm, encouraging, and supportive
- Sometimes step back to let them talk directly
- Suggest fun activities or topics they might both enjoy
${otherAiNames.length > 0 ? 
  `- Work collaboratively with ${otherAiNames.join(' and ')} - don't repeat what they just said, but build on their contributions
- Let other AIs handle topics they're specialized in
- Keep your responses focused on your specialty: ${respondingAi.specialty}` : ''
}

Recent conversation:
${conversationHistory.map(msg => 
  `${msg.senderType === 'user' ? msg.username : msg.aiName}: ${msg.content}`
).join('\n')}

Current message from user: ${message.trim()}

Respond naturally as ${respondingAi.displayName}, keeping in mind your specialty and the collaborative nature of this group chat.${otherAiNames.length > 0 ? ` Don't mention the other AIs directly unless relevant.` : ''} Keep your response helpful and engaging.`;

    // Generate AI response
    const startTime = Date.now();
    
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt }
        ],
        max_tokens: 400,
        temperature: 0.8
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const responseTime = Date.now() - startTime;
    const aiResponse = response.data.choices[0].message.content.trim();

    // Save AI response
    await db.insert(GROUP_CHAT_MESSAGES).values({
      groupChatId: groupChatId,
      senderType: 'ai',
      senderAiId: respondingAi.id,
      content: aiResponse,
      messageType: 'text'
    }).execute();

    // Update group chat last message time
    await db
      .update(GROUP_CHATS)
      .set({ lastMessageAt: new Date() })
      .where(eq(GROUP_CHATS.id, groupChatId))
      .execute();

    return NextResponse.json({
      success: true,
      aiResponse: aiResponse,
      respondingAi: {
        id: respondingAi.id,
        displayName: respondingAi.displayName,
        specialty: respondingAi.specialty
      },
      responseTime: responseTime,
      totalAiCharacters: uniqueAiCharacters.length
    }, { status: 200 });

  } catch (error) {
    console.error("Error sending group chat message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}