// app/api/connections/pending/route.js
import { db } from '@/utils';
import { CONNECTIONS, USER } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { eq, and, or } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';

export async function GET(req) {
  // Authenticate user
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;

  try {
    // Fetch pending connection requests where the user is the receiver
    const pendingRequests = await db
      .select({
        connectionId: CONNECTIONS.connectionId,
        requestedAt: CONNECTIONS.requestedAt,
        sender: {
          id: USER.id,
          username: USER.username,
          profileImageUrl: USER.profileImageUrl,
          country: USER.country,
          state: USER.state,
          city: USER.city,
        },
      })
      .from(CONNECTIONS)
      .innerJoin(USER, eq(CONNECTIONS.senderId, USER.id))
      .where(
        and(
          eq(CONNECTIONS.receiverId, userId),
          eq(CONNECTIONS.status, "pending")
        )
      )
      .execute();

    return NextResponse.json({
      requests: pendingRequests,
    });
  } catch (error) {
    console.error("Error fetching pending connection requests:", error);
    return NextResponse.json(
      { message: "Error fetching pending connection requests" },
      { status: 500 }
    );
  }
}
