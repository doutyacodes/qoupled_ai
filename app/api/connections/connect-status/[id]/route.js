import { db } from '@/utils';
import { CONNECTIONS } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { eq, and, or } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';

export async function GET(req, { params }) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

    const userData = authResult.decoded_Data;
    const currentUserId = userData.userId;
  const targetUserId = parseInt(params.id);
  
  if (isNaN(targetUserId)) {
    return NextResponse.json({ 
      message: 'Invalid user ID',
      success: false 
    }, { status: 400 });
  }

  try {
    // Check connection status in both directions
    const connection = await db
      .select()
      .from(CONNECTIONS)
      .where(
        or(
          and(
            eq(CONNECTIONS.senderId, currentUserId),
            eq(CONNECTIONS.receiverId, targetUserId)
          ),
          and(
            eq(CONNECTIONS.senderId, targetUserId),
            eq(CONNECTIONS.receiverId, currentUserId)
          )
        )
      )
      .limit(1)
      .execute();

    if (connection && connection.length > 0) {
      const conn = connection[0];
      const isCurrentUserSender = conn.senderId === currentUserId;
      
      // Hide rejected/blocked status from user - show as pending
      if (conn.status === 'rejected' || conn.status === 'blocked') {
        return NextResponse.json({ 
          hasConnection: true,
          status: 'pending',
          isCurrentUserSender: isCurrentUserSender,
          success: true 
        }, { status: 200 });
      }

      return NextResponse.json({ 
        hasConnection: true,
        status: conn.status,
        isCurrentUserSender: isCurrentUserSender,
        connectionType: conn.connectionType,
        isPremiumConnection: conn.isPremiumConnection,
        success: true 
      }, { status: 200 });
    }

    return NextResponse.json({ 
      hasConnection: false,
      status: null,
      success: true 
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching connection status:", error);
    return NextResponse.json({ 
      message: 'Error fetching connection status',
      error: error.message,
      success: false 
    }, { status: 500 });
  }
}