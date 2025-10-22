import { db } from '@/utils';
import { CONNECTIONS } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { eq, and, or } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';

export async function POST(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const currentUserId = authResult.user.id;
  
  try {
    const body = await req.json();
    const { receiverId, connectionType = 'regular', isPremiumConnection = false } = body;
    
    if (!receiverId || isNaN(parseInt(receiverId))) {
      return NextResponse.json({ 
        message: 'Invalid receiver ID',
        success: false 
      }, { status: 400 });
    }

    const targetUserId = parseInt(receiverId);

    // Check if connection already exists
    const existingConnection = await db
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

    if (existingConnection && existingConnection.length > 0) {
      return NextResponse.json({ 
        message: 'Connection request already exists',
        success: false 
      }, { status: 400 });
    }

    // Create new connection request
    const newConnection = await db
      .insert(CONNECTIONS)
      .values({
        senderId: currentUserId,
        receiverId: targetUserId,
        status: 'pending',
        connectionType: connectionType,
        isPremiumConnection: isPremiumConnection,
        requestedAt: new Date()
      })
      .execute();

    return NextResponse.json({ 
      message: 'Connection request sent successfully',
      connectionId: newConnection.insertId,
      success: true 
    }, { status: 201 });

  } catch (error) {
    console.error("Error sending connection request:", error);
    return NextResponse.json({ 
      message: 'Error sending connection request',
      error: error.message,
      success: false 
    }, { status: 500 });
  }
}