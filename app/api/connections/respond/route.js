// app/api/connections/respond/route.js
import { db } from '@/utils';
import { CONNECTIONS } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';

export async function POST(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) return authResult.response;

  const userData = authResult.decoded_Data;
  const userId = userData.userId;

  try {
    const { connectionId, status } = await req.json();

    if (!connectionId)
      return NextResponse.json({ message: 'Connection ID is required' }, { status: 400 });

    if (!status || !['accepted', 'rejected', 'blocked'].includes(status))
      return NextResponse.json(
        { message: 'Valid response is required (accepted, rejected, or blocked)' },
        { status: 400 }
      );

    // Check if the connection exists and user is the receiver
    const connection = await db
      .select({
        connectionId: CONNECTIONS.connectionId,
        status: CONNECTIONS.status,
        senderId: CONNECTIONS.senderId,
      })
      .from(CONNECTIONS)
      .where(
        and(
          eq(CONNECTIONS.connectionId, connectionId),
          eq(CONNECTIONS.receiverId, userId),
          eq(CONNECTIONS.status, 'pending')
        )
      )
      .execute();

    if (connection.length === 0) {
      return NextResponse.json(
        { message: 'Connection request not found or already processed' },
        { status: 404 }
      );
    }

    // Update connection
    await db
      .update(CONNECTIONS)
      .set({
        status,
        respondedAt: new Date(),
      })
      .where(eq(CONNECTIONS.connectionId, connectionId))
      .execute();

    // Re-fetch the updated record manually
    const updatedConnection = await db
      .select()
      .from(CONNECTIONS)
      .where(eq(CONNECTIONS.connectionId, connectionId))
      .execute();

    return NextResponse.json({
      message: `Connection request ${status} successfully`,
      connection: updatedConnection[0],
    });
  } catch (error) {
    console.error('Error responding to connection request:', error);
    return NextResponse.json(
      { message: 'Error responding to connection request' },
      { status: 500 }
    );
  }
}