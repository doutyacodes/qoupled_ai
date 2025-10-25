// app/api/ai-chat/respond-invitation/route.js
import { NextResponse } from "next/server";
import { authenticate } from "@/lib/jwtMiddleware";
import { 
  GROUP_CHAT_INVITATIONS,
  GROUP_CHATS,
  GROUP_CHAT_PARTICIPANTS,
  GROUP_CHAT_MESSAGES,
  AI_CHARACTERS,
  USER,
  USER_IMAGES // ADDED: Import USER_IMAGES table
} from "@/utils/schema";
import { db } from "@/utils";
import { eq, and } from "drizzle-orm";

export async function POST(request) {
  const authResult = await authenticate(request);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId || userData.id;
  const { action, invitationId, delayDays } = await request.json();

  if (!action || !invitationId) {
    return NextResponse.json(
      { error: "Action and invitation ID are required." },
      { status: 400 }
    );
  }

  try {
    // Verify the invitation is for the current user
    const invitation = await db
      .select()
      .from(GROUP_CHAT_INVITATIONS)
      .where(and(
        eq(GROUP_CHAT_INVITATIONS.id, invitationId),
        eq(GROUP_CHAT_INVITATIONS.invitedUserId, userId),
        eq(GROUP_CHAT_INVITATIONS.status, 'pending')
      ))
      .limit(1)
      .execute();

    if (invitation.length === 0) {
      return NextResponse.json(
        { error: "Invitation not found or already responded." },
        { status: 404 }
      );
    }

    const currentInvitation = invitation[0];

    if (action === 'reject') {
      // Update invitation status to rejected
      await db
        .update(GROUP_CHAT_INVITATIONS)
        .set({ 
          status: 'rejected',
          respondedAt: new Date()
        })
        .where(eq(GROUP_CHAT_INVITATIONS.id, invitationId))
        .execute();

      return NextResponse.json({
        success: true,
        message: 'Invitation rejected successfully'
      }, { status: 200 });
    }

    if (action === 'delay') {
      const delayDuration = delayDays || 3; // Default to 3 days
      const delayUntil = new Date();
      delayUntil.setDate(delayUntil.getDate() + delayDuration);

      // Update invitation status to delayed
      await db
        .update(GROUP_CHAT_INVITATIONS)
        .set({ 
          status: 'delayed',
          delayUntil: delayUntil,
          respondedAt: new Date()
        })
        .where(eq(GROUP_CHAT_INVITATIONS.id, invitationId))
        .execute();

      return NextResponse.json({
        success: true,
        message: `Invitation delayed for ${delayDuration} days`,
        delayUntil: delayUntil
      }, { status: 200 });
    }

    if (action === 'accept') {
      // Update invitation status to accepted
      await db
        .update(GROUP_CHAT_INVITATIONS)
        .set({ 
          status: 'accepted',
          respondedAt: new Date()
        })
        .where(eq(GROUP_CHAT_INVITATIONS.id, invitationId))
        .execute();

      // Get invitation details and users with profile images
      const [aiCharacter, initiatorUser, invitedUser, initiatorProfileImage, invitedProfileImage] = await Promise.all([
        db.select().from(AI_CHARACTERS).where(eq(AI_CHARACTERS.id, currentInvitation.aiCharacterId)).limit(1).execute(),
        db.select().from(USER).where(eq(USER.id, currentInvitation.initiatorUserId)).limit(1).execute(),
        db.select().from(USER).where(eq(USER.id, currentInvitation.invitedUserId)).limit(1).execute(),
        // NEW: Get profile images for both users
        db.select({ image_url: USER_IMAGES.image_url })
          .from(USER_IMAGES)
          .where(and(
            eq(USER_IMAGES.user_id, currentInvitation.initiatorUserId),
            eq(USER_IMAGES.is_profile, true)
          ))
          .limit(1)
          .execute(),
        db.select({ image_url: USER_IMAGES.image_url })
          .from(USER_IMAGES)
          .where(and(
            eq(USER_IMAGES.user_id, currentInvitation.invitedUserId),
            eq(USER_IMAGES.is_profile, true)
          ))
          .limit(1)
          .execute()
      ]);

      if (aiCharacter.length === 0 || initiatorUser.length === 0 || invitedUser.length === 0) {
        return NextResponse.json(
          { error: "Required data not found." },
          { status: 404 }
        );
      }

      const ai = aiCharacter[0];
      const initiator = initiatorUser[0];
      const invited = invitedUser[0];

      // Get profile image URLs
      const initiatorProfileImageUrl = initiatorProfileImage.length > 0 ? initiatorProfileImage[0].image_url : null;
      const invitedProfileImageUrl = invitedProfileImage.length > 0 ? invitedProfileImage[0].image_url : null;

      // Create group chat
      const chatName = `${initiator.username}, ${invited.username} & ${ai.displayName}`;
      
      const groupChat = await db.insert(GROUP_CHATS).values({
        aiCharacterId: currentInvitation.aiCharacterId,
        chatName: chatName,
        createdByUserId: currentInvitation.initiatorUserId,
        status: 'active'
      }).execute();

      const groupChatId = groupChat[0].insertId;

      // Add participants to the group chat
      await db.insert(GROUP_CHAT_PARTICIPANTS).values([
        {
          groupChatId: groupChatId,
          userId: currentInvitation.initiatorUserId,
          role: 'admin'
        },
        {
          groupChatId: groupChatId,
          userId: currentInvitation.invitedUserId,
          role: 'member'
        }
      ]).execute();

      // Create welcome message from AI
      const welcomeMessage = `🎉 Welcome to your group chat! I'm ${ai.displayName}, and I'm excited to help facilitate your conversation. ${initiator.username} and ${invited.username}, you both have compatible personalities and I think you'll really enjoy getting to know each other. Feel free to ask me anything or just chat naturally - I'm here to help! 😊`;

      await db.insert(GROUP_CHAT_MESSAGES).values({
        groupChatId: groupChatId,
        senderType: 'ai',
        senderAiId: currentInvitation.aiCharacterId,
        content: welcomeMessage,
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
              profileImageUrl: initiatorProfileImageUrl // UPDATED: Use from USER_IMAGES
            },
            { 
              id: invited.id, 
              username: invited.username, 
              profileImageUrl: invitedProfileImageUrl // UPDATED: Use from USER_IMAGES
            }
          ],
          aiCharacter: {
            id: ai.id,
            displayName: ai.displayName,
            avatarUrl: ai.avatarUrl
          }
        }
      }, { status: 200 });
    }

    return NextResponse.json(
      { error: "Invalid action specified." },
      { status: 400 }
    );

  } catch (error) {
    console.error("Error responding to invitation:", error);
    return NextResponse.json(
      { 
        error: "Failed to process invitation response", 
        details: process.env.NODE_ENV === 'development' ? error.message : undefined 
      },
      { status: 500 }
    );
  }
}