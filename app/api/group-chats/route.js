// app/api/user/group-chats/route.js
import { NextResponse } from "next/server";
import { authenticate } from "@/lib/jwtMiddleware";
import { 
  GROUP_CHATS,
  GROUP_CHAT_PARTICIPANTS,
  GROUP_CHAT_MESSAGES,
  AI_CHARACTERS,
  USER,
  USER_IMAGES // ADDED: Import USER_IMAGES table
} from "@/utils/schema";
import { db } from "@/utils";
import { eq, and, desc, ne } from "drizzle-orm";

export async function GET(request) {
  const authResult = await authenticate(request);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId || userData.id;

  try {
    // Get all group chats where user is a participant
    const userGroupChats = await db
      .select({
        groupChatId: GROUP_CHATS.id,
        chatName: GROUP_CHATS.chatName,
        createdAt: GROUP_CHATS.createdAt,
        lastMessageAt: GROUP_CHATS.lastMessageAt,
        status: GROUP_CHATS.status,
        userRole: GROUP_CHAT_PARTICIPANTS.role,
        joinedAt: GROUP_CHAT_PARTICIPANTS.joinedAt
      })
      .from(GROUP_CHAT_PARTICIPANTS)
      .innerJoin(GROUP_CHATS, eq(GROUP_CHAT_PARTICIPANTS.groupChatId, GROUP_CHATS.id))
      .where(and(
        eq(GROUP_CHAT_PARTICIPANTS.userId, userId),
        eq(GROUP_CHAT_PARTICIPANTS.isActive, true),
        eq(GROUP_CHATS.status, 'active')
      ))
      .orderBy(desc(GROUP_CHATS.lastMessageAt))
      .execute();

    if (userGroupChats.length === 0) {
      return NextResponse.json({
        success: true,
        groupChats: []
      }, { status: 200 });
    }

    // Get additional details for each group chat
    const enrichedGroupChats = await Promise.all(
      userGroupChats.map(async (groupChat) => {
        // Get other participants (excluding current user) with profile images
        const otherParticipants = await db
          .select({
            userId: USER.id,
            username: USER.username,
            // REMOVED: profileImageUrl from USER table
            role: GROUP_CHAT_PARTICIPANTS.role,
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
            eq(GROUP_CHAT_PARTICIPANTS.groupChatId, groupChat.groupChatId),
            eq(GROUP_CHAT_PARTICIPANTS.isActive, true),
            ne(GROUP_CHAT_PARTICIPANTS.userId, userId)
          ))
          .execute();

        // Get AI characters in this group chat
        const aiCharacters = await db
          .select({
            id: AI_CHARACTERS.id,
            displayName: AI_CHARACTERS.displayName,
            avatarUrl: AI_CHARACTERS.avatarUrl,
            specialty: AI_CHARACTERS.specialty
          })
          .from(AI_CHARACTERS)
          .innerJoin(GROUP_CHAT_MESSAGES, eq(AI_CHARACTERS.id, GROUP_CHAT_MESSAGES.senderAiId))
          .where(eq(GROUP_CHAT_MESSAGES.groupChatId, groupChat.groupChatId))
          .execute();

        // Remove duplicate AI characters
        const uniqueAiCharacters = aiCharacters.filter((ai, index, self) => 
          index === self.findIndex(a => a.id === ai.id)
        );

        // Get last message
        const lastMessage = await db
          .select({
            content: GROUP_CHAT_MESSAGES.content,
            senderType: GROUP_CHAT_MESSAGES.senderType,
            createdAt: GROUP_CHAT_MESSAGES.createdAt,
            senderName: USER.username,
            aiName: AI_CHARACTERS.displayName
          })
          .from(GROUP_CHAT_MESSAGES)
          .leftJoin(USER, eq(GROUP_CHAT_MESSAGES.senderUserId, USER.id))
          .leftJoin(AI_CHARACTERS, eq(GROUP_CHAT_MESSAGES.senderAiId, AI_CHARACTERS.id))
          .where(and(
            eq(GROUP_CHAT_MESSAGES.groupChatId, groupChat.groupChatId),
            eq(GROUP_CHAT_MESSAGES.isDeleted, false)
          ))
          .orderBy(desc(GROUP_CHAT_MESSAGES.createdAt))
          .limit(1)
          .execute();

        // Count total messages
        const totalMessages = await db
          .select({ count: GROUP_CHAT_MESSAGES.id })
          .from(GROUP_CHAT_MESSAGES)
          .where(and(
            eq(GROUP_CHAT_MESSAGES.groupChatId, groupChat.groupChatId),
            eq(GROUP_CHAT_MESSAGES.isDeleted, false)
          ))
          .execute();

        return {
          id: groupChat.groupChatId,
          name: groupChat.chatName,
          createdAt: groupChat.createdAt,
          lastMessageAt: groupChat.lastMessageAt,
          status: groupChat.status,
          userRole: groupChat.userRole,
          joinedAt: groupChat.joinedAt,
          
          // Participants
          otherParticipants: otherParticipants.map(participant => ({
            id: participant.userId,
            username: participant.username,
            profileImageUrl: participant.profileImageUrl, // UPDATED: Now from USER_IMAGES
            role: participant.role
          })),
          totalParticipants: otherParticipants.length + 1, // +1 for current user
          
          // AI Characters
          aiCharacters: uniqueAiCharacters,
          totalAiCharacters: uniqueAiCharacters.length,
          
          // Last message info
          lastMessage: lastMessage.length > 0 ? {
            content: lastMessage[0].content.length > 100 ? 
              lastMessage[0].content.substring(0, 100) + '...' : 
              lastMessage[0].content,
            senderType: lastMessage[0].senderType,
            senderName: lastMessage[0].senderType === 'user' ? 
              lastMessage[0].senderName : 
              lastMessage[0].aiName,
            timestamp: lastMessage[0].createdAt
          } : null,
          
          // Chat stats
          totalMessages: totalMessages.length,
          
          // UI helpers
          isNew: new Date() - new Date(groupChat.joinedAt) < 24 * 60 * 60 * 1000, // New if joined in last 24h
          displayName: otherParticipants.length > 0 ? 
            `${otherParticipants.map(p => p.username).join(', ')} & ${uniqueAiCharacters.map(ai => ai.displayName).join(', ')}` :
            groupChat.chatName
        };
      })
    );

    return NextResponse.json({
      success: true,
      groupChats: enrichedGroupChats,
      totalGroupChats: enrichedGroupChats.length
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching user group chats:", error);
    return NextResponse.json(
      { error: "Failed to fetch group chats" },
      { status: 500 }
    );
  }
}