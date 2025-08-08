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
    // Get all pending invitations received by this user
    const invites = await db
      .select({
        connectionId: CONNECTIONS.connectionId,
        senderId: CONNECTIONS.senderId,
        receiverId: CONNECTIONS.receiverId,
        status: CONNECTIONS.status,
        requestedAt: CONNECTIONS.requestedAt,
        respondedAt: CONNECTIONS.respondedAt,
        // We'll join with the USER table to get the sender's details
        userId: USER.id,
        username: USER.username,
        profileImageUrl: USER.profileImageUrl,
      })
      .from(CONNECTIONS)
      .leftJoin(
        USER,
        eq(CONNECTIONS.senderId, USER.id)
      )
      .where(
        and(
          eq(CONNECTIONS.receiverId, userId),
          eq(CONNECTIONS.status, "pending")
        )
      );

    return NextResponse.json({ invites }, { status: 200 });
  } catch (error) {
    console.error("Error fetching received invites:", error);
    return NextResponse.json(
      { message: "Error fetching received invites" },
      { status: 500 }
    );
  }
}