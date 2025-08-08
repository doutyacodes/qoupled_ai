
// app/api/connections/sent-invites/route.js
import { db } from '@/utils';
import { CONNECTIONS, USER } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';

export async function GET(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;

  try {
    // Get all pending invitations sent by this user
    const invites = await db
      .select({
        connectionId: CONNECTIONS.connectionId,
        senderId: CONNECTIONS.senderId,
        receiverId: CONNECTIONS.receiverId,
        status: CONNECTIONS.status,
        requestedAt: CONNECTIONS.requestedAt,
        respondedAt: CONNECTIONS.respondedAt,
        // We'll join with the USER table to get the receiver's details
        userId: USER.id,
        username: USER.username,
        profileImageUrl: USER.profileImageUrl,
      })
      .from(CONNECTIONS)
      .leftJoin(
        USER,
        eq(CONNECTIONS.receiverId, USER.id)
      )
      .where(
        and(
          eq(CONNECTIONS.senderId, userId),
          eq(CONNECTIONS.status, "pending")
        )
      );

    return NextResponse.json({ invites }, { status: 200 });
  } catch (error) {
    console.error("Error fetching sent invites:", error);
    return NextResponse.json(
      { message: "Error fetching sent invites" },
      { status: 500 }
    );
  }
}