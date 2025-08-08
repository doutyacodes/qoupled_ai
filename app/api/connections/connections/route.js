import { db } from '@/utils';
import { CONNECTIONS, USER } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { eq, and, or } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';

export async function GET(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;

  try {
    // Get all accepted connections for this user
    // A connection exists where either the user is the sender or receiver, and status is "accepted"
    const connections = await db
      .select({
        connectionId: CONNECTIONS.connectionId,
        senderId: CONNECTIONS.senderId,
        receiverId: CONNECTIONS.receiverId,
        status: CONNECTIONS.status,
        requestedAt: CONNECTIONS.requestedAt,
        respondedAt: CONNECTIONS.respondedAt,
        // We'll join with the USER table to get the other person's details
        userId: USER.id,
        username: USER.username,
        profileImageUrl: USER.profileImageUrl,
      })
      .from(CONNECTIONS)
      .leftJoin(
        USER,
        or(
          and(
            eq(CONNECTIONS.receiverId, userId),
            eq(USER.id, CONNECTIONS.senderId)
          ),
          and(
            eq(CONNECTIONS.senderId, userId),
            eq(USER.id, CONNECTIONS.receiverId)
          )
        )
      )
      .where(
        and(
          or(
            eq(CONNECTIONS.senderId, userId),
            eq(CONNECTIONS.receiverId, userId)
          ),
          eq(CONNECTIONS.status, "accepted")
        )
      );

    return NextResponse.json({ connections }, { status: 200 });
  } catch (error) {
    console.error("Error fetching connections:", error);
    return NextResponse.json(
      { message: "Error fetching connections" },
      { status: 500 }
    );
  }
}