// app/api/ai-chat/respond-suggestion/route.js
import { NextResponse } from "next/server";
import { authenticate } from "@/lib/jwtMiddleware";
import { 
  USER_SUGGESTIONS,
  GROUP_CHAT_INVITATIONS,
  GROUP_CHATS,
  GROUP_CHAT_PARTICIPANTS,
  GROUP_CHAT_MESSAGES,
  AI_CHARACTERS,
  USER,
  USER_AI_FRIENDS
} from "@/utils/schema";
import { db } from "@/utils";
import { eq, and, inArray } from "drizzle-orm";

export async function POST(request) {
  const authResult = await authenticate(request);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId || userData.id;
  const { action, suggestionId, aiCharacterId, suggestedUserId } = await request.json();

  if (!action || !suggestionId) {
    return NextResponse.json(
      { error: "Action and suggestion ID are required." },
      { status: 400 }
    );
  }

  try {
    // Verify the suggestion belongs to the current user
    const suggestion = await db
      .select()
      .from(USER_SUGGESTIONS)
      .where(and(
        eq(USER_SUGGESTIONS.id, suggestionId),
        eq(USER_SUGGESTIONS.requesterUserId, userId)
      ))
      .limit(1)
      .execute();

    if (suggestion.length === 0) {
      return NextResponse.json(
        { error: "Suggestion not found or access denied." },
        { status: 404 }
      );
    }

    const currentSuggestion = suggestion[0];

    if (action === 'reject' || action === 'skip') {
      // Update suggestion status
      await db
        .update(USER_SUGGESTIONS)
        .set({ 
          status: action === 'reject' ? 'rejected' : 'expired'
        })
        .where(eq(USER_SUGGESTIONS.id, suggestionId))
        .execute();

      return NextResponse.json({
        success: true,
        message: 'Suggestion updated successfully'
      }, { status: 200 });
    }

    if (action === 'accept') {
      // Update suggestion status
      await db
        .update(USER_SUGGESTIONS)
        .set({ status: 'accepted' })
        .where(eq(USER_SUGGESTIONS.id, suggestionId))
        .execute();

      // Get AI character and users info
      const [aiCharacter, initiatorUser, suggestedUser] = await Promise.all([
        db.select().from(AI_CHARACTERS).where(eq(AI_CHARACTERS.id, aiCharacterId)).limit(1).execute(),
        db.select().from(USER).where(eq(USER.id, userId)).limit(1).execute(),
        db.select().from(USER).where(eq(USER.id, suggestedUserId)).limit(1).execute()
      ]);

      if (aiCharacter.length === 0 || initiatorUser.length === 0 || suggestedUser.length === 0) {
        return NextResponse.json(
          { error: "Required data not found." },
          { status: 404 }
        );
      }

      const ai = aiCharacter[0];
      const initiator = initiatorUser[0];
      const suggested = suggestedUser[0];

      // Get mutual AI friends
      const [initiatorAiFriends, suggestedUserAiFriends] = await Promise.all([
        db.select({
          aiMbtiType: USER_AI_FRIENDS.ai_friend_mbti_type
        })
        .from(USER_AI_FRIENDS)
        .where(and(
          eq(USER_AI_FRIENDS.user_id, userId),
          eq(USER_AI_FRIENDS.is_active, true)
        ))
        .execute(),

        db.select({
          aiMbtiType: USER_AI_FRIENDS.ai_friend_mbti_type
        })
        .from(USER_AI_FRIENDS)
        .where(and(
          eq(USER_AI_FRIENDS.user_id, suggestedUserId),
          eq(USER_AI_FRIENDS.is_active, true)
        ))
        .execute()
      ]);

      // Find common AI MBTI types
      const initiatorAiTypes = initiatorAiFriends.map(f => f.aiMbtiType);
      const suggestedAiTypes = suggestedUserAiFriends.map(f => f.aiMbtiType);
      const commonAiTypes = initiatorAiTypes.filter(type => suggestedAiTypes.includes(type));

      console.log('Common AI Types:', commonAiTypes);

      // Get all AI characters that will be in the group (current AI + mutual AIs)
      const allGroupAiTypes = [ai.mbtiType, ...commonAiTypes].filter((type, index, self) => self.indexOf(type) === index);
      
      console.log('All Group AI Types:', allGroupAiTypes);

      const groupAiCharacters = await db
        .select()
        .from(AI_CHARACTERS)
        .where(inArray(AI_CHARACTERS.mbtiType, allGroupAiTypes))
        .execute();

      console.log('Group AI Characters:', groupAiCharacters);

      // Create group chat name
      const aiNames = groupAiCharacters.map(ai => ai.displayName).join(', ');
      const chatName = `${initiator.username}, ${suggested.username} & ${aiNames}`;

      // Create group chat
      const groupChat = await db.insert(GROUP_CHATS).values({
        aiCharacterId: aiCharacterId,
        chatName: chatName,
        createdByUserId: userId,
        status: 'active'
      }).execute();

      const groupChatId = groupChat[0].insertId;

      console.log(`Creating friendship group chat:
        - Current user: ${userId} (${initiator.username}) - Role: admin
        - Suggested friend: ${suggestedUserId} (${suggested.username}) - Role: member
        - Primary AI: ${ai.displayName}
        - Additional mutual AIs: ${groupAiCharacters.filter(aic => aic.id !== ai.id).map(aic => aic.displayName).join(', ') || 'None'}
        - Total participants: 2 humans + ${groupAiCharacters.length} AIs`);

      // Add ONLY the two users as participants
      await db.insert(GROUP_CHAT_PARTICIPANTS).values([
        {
          groupChatId: groupChatId,
          userId: userId,
          role: 'admin',
          isActive: true
        },
        {
          groupChatId: groupChatId,
          userId: suggestedUserId,
          role: 'member',
          isActive: true
        }
      ]).execute();

      console.log(`✅ Group chat ${groupChatId} created successfully with exactly 2 human participants`);

      // Create welcome message from primary AI
      let welcomeMessage = `🎉 Welcome to your friendship group chat! I'm ${ai.displayName}, and I'm excited to help facilitate your conversation.`;
      
      if (groupAiCharacters.length > 1) {
        const otherAiNames = groupAiCharacters.filter(aic => aic.id !== ai.id).map(aic => aic.displayName);
        if (otherAiNames.length > 0) {
          welcomeMessage += ` I've also invited ${otherAiNames.join(' and ')} to join us since you both are friends with them too!`;
        }
      }

      welcomeMessage += ` ${initiator.username} and ${suggested.username}, you both have compatible personalities and shared AI companions, so I think you'll really enjoy getting to know each other. Feel free to ask any of us anything or just chat naturally - we're all here to help! 😊`;

      await db.insert(GROUP_CHAT_MESSAGES).values({
        groupChatId: groupChatId,
        senderType: 'ai',
        senderAiId: ai.id,
        content: welcomeMessage,
        messageType: 'system'
      }).execute();

      // Add introduction messages from other AI friends if any
      for (const otherAi of groupAiCharacters.filter(aic => aic.id !== ai.id)) {
        const introMessage = `Hello ${initiator.username} and ${suggested.username}! I'm ${otherAi.displayName}, your ${otherAi.specialty}. I'm happy to be part of this friendship journey with you both and ${ai.displayName}! 🤝✨`;
        
        await db.insert(GROUP_CHAT_MESSAGES).values({
          groupChatId: groupChatId,
          senderType: 'ai',
          senderAiId: otherAi.id,
          content: introMessage,
          messageType: 'system'
        }).execute();
      }

      // Create final instruction message
      const instructionMessage = `💬 **How this group chat works:** Both of you can now chat freely here! All your AI companions in this group will participate in the conversation and help facilitate your friendship. Feel free to ask questions, share interests, or just get to know each other. We're all here to help make this a great experience! 🌟`;

      await db.insert(GROUP_CHAT_MESSAGES).values({
        groupChatId: groupChatId,
        senderType: 'ai',
        senderAiId: ai.id,
        content: instructionMessage,
        messageType: 'system'
      }).execute();

      return NextResponse.json({
        success: true,
        message: 'Group chat created successfully!',
        groupChat: {
          id: groupChatId,
          name: chatName,
          participants: [
            { 
              id: initiator.id, 
              username: initiator.username, 
              profileImageUrl: initiator.profileImageUrl,
              role: 'admin'
            },
            { 
              id: suggested.id, 
              username: suggested.username, 
              profileImageUrl: suggested.profileImageUrl,
              role: 'member'
            }
          ],
          aiCharacters: groupAiCharacters.map(aiChar => ({
            id: aiChar.id,
            displayName: aiChar.displayName,
            avatarUrl: aiChar.avatarUrl,
            specialty: aiChar.specialty,
            mbtiType: aiChar.mbtiType
          })),
          totalAiCharacters: groupAiCharacters.length,
          mutualAiFriends: commonAiTypes.length
        }
      }, { status: 200 });
    }

    return NextResponse.json(
      { error: "Invalid action specified." },
      { status: 400 }
    );

  } catch (error) {
    console.error("Error responding to suggestion:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { 
        error: "Failed to process response", 
        details: process.env.NODE_ENV === 'development' ? error.message : undefined 
      },
      { status: 500 }
    );
  }
}

// GET method to fetch pending invitations for a user
export async function GET(request) {
  const authResult = await authenticate(request);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId || userData.id;

  try {
    // Get pending invitations for this user
    const invitations = await db
      .select({
        id: GROUP_CHAT_INVITATIONS.id,
        invitationMessage: GROUP_CHAT_INVITATIONS.invitationMessage,
        createdAt: GROUP_CHAT_INVITATIONS.createdAt,
        expiresAt: GROUP_CHAT_INVITATIONS.expiresAt,
        aiCharacterName: AI_CHARACTERS.displayName,
        aiCharacterAvatar: AI_CHARACTERS.avatarUrl,
        initiatorUsername: USER.username,
        initiatorAvatar: USER.profileImageUrl
      })
      .from(GROUP_CHAT_INVITATIONS)
      .innerJoin(AI_CHARACTERS, eq(GROUP_CHAT_INVITATIONS.aiCharacterId, AI_CHARACTERS.id))
      .innerJoin(USER, eq(GROUP_CHAT_INVITATIONS.initiatorUserId, USER.id))
      .where(and(
        eq(GROUP_CHAT_INVITATIONS.invitedUserId, userId),
        eq(GROUP_CHAT_INVITATIONS.status, 'pending')
      ))
      .execute();

    return NextResponse.json({
      success: true,
      invitations: invitations
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching invitations:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitations" },
      { status: 500 }
    );
  }
}