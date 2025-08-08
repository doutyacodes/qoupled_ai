// app/api/user-invitations/route.js
import { NextResponse } from "next/server";
import { authenticate } from "@/lib/jwtMiddleware";
import { 
  GROUP_CHAT_INVITATIONS,
  AI_CHARACTERS,
  USER
} from "@/utils/schema";
import { db } from "@/utils";
import { eq, and } from "drizzle-orm";

// GET user's pending invitations
export async function GET(request) {
  const authResult = await authenticate(request);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId || userData.id;

  try {
    // Get all pending invitations for this user
    const invitations = await db
      .select({
        id: GROUP_CHAT_INVITATIONS.id,
        invitationMessage: GROUP_CHAT_INVITATIONS.invitationMessage,
        status: GROUP_CHAT_INVITATIONS.status,
        createdAt: GROUP_CHAT_INVITATIONS.createdAt,
        expiresAt: GROUP_CHAT_INVITATIONS.expiresAt,
        delayUntil: GROUP_CHAT_INVITATIONS.delayUntil,
        aiCharacterName: AI_CHARACTERS.displayName,
        aiCharacterAvatar: AI_CHARACTERS.avatarUrl,
        aiCharacterSpecialty: AI_CHARACTERS.specialty,
        initiatorId: USER.id,
        initiatorUsername: USER.username,
        initiatorAvatar: USER.profileImageUrl,
        initiatorGender: USER.gender
      })
      .from(GROUP_CHAT_INVITATIONS)
      .innerJoin(AI_CHARACTERS, eq(GROUP_CHAT_INVITATIONS.aiCharacterId, AI_CHARACTERS.id))
      .innerJoin(USER, eq(GROUP_CHAT_INVITATIONS.initiatorUserId, USER.id))
      .where(and(
        eq(GROUP_CHAT_INVITATIONS.invitedUserId, userId),
        eq(GROUP_CHAT_INVITATIONS.status, 'pending')
      ))
      .execute();

    // Filter out expired invitations and update their status
    const now = new Date();
    const validInvitations = [];
    const expiredInvitations = [];

    for (const invitation of invitations) {
      if (invitation.expiresAt && new Date(invitation.expiresAt) < now) {
        expiredInvitations.push(invitation.id);
      } else {
        validInvitations.push(invitation);
      }
    }

    // Update expired invitations
    if (expiredInvitations.length > 0) {
      await db
        .update(GROUP_CHAT_INVITATIONS)
        .set({ status: 'expired' })
        .where(eq(GROUP_CHAT_INVITATIONS.id, expiredInvitations[0])) // Update each one
        .execute();
    }

    return NextResponse.json({
      success: true,
      invitations: validInvitations,
      count: validInvitations.length
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching user invitations:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitations" },
      { status: 500 }
    );
  }
}

// app/api/user-invitations/[id]/respond/route.js
// This would be a separate file for responding to specific invitations
export async function POST(request) {
  const authResult = await authenticate(request);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId || userData.id;
  const { invitationId, action, delayDays } = await request.json();

  if (!invitationId || !action) {
    return NextResponse.json(
      { error: "Invitation ID and action are required." },
      { status: 400 }
    );
  }

  try {
    // Verify the invitation belongs to this user and is pending
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

    if (action === 'accept') {
      // Accept the invitation - this will trigger group chat creation
      // Call the existing respond-invitation API
      const token = request.headers.get('Authorization');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/ai-chat/respond-invitation`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'accept',
          invitationId: invitationId,
          aiCharacterId: currentInvitation.aiCharacterId,
          suggestedUserId: userId
        })
      });

      const data = await response.json();
      return NextResponse.json(data, { status: response.status });

    } else if (action === 'reject') {
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

    } else if (action === 'delay') {
      const delayDuration = delayDays || 3;
      const delayUntil = new Date();
      delayUntil.setDate(delayUntil.getDate() + delayDuration);

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

    return NextResponse.json(
      { error: "Invalid action specified." },
      { status: 400 }
    );

  } catch (error) {
    console.error("Error responding to invitation:", error);
    return NextResponse.json(
      { error: "Failed to process invitation response" },
      { status: 500 }
    );
  }
}