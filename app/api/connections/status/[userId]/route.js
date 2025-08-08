// app/api/connections/status/[userId]/route.js
import { db } from '@/utils';
import { CONNECTIONS, USER } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { eq, and, or } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';
export async function GET(req, { params }) {
    // Authenticate user
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const currentUserId = userData.userId;
    const targetUserId = parseInt(params.userId, 10);

    if (isNaN(targetUserId)) {
        return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
    }

    try {
        // Find any connection between the two users
        const connection = await db
            .select({
                connectionId: CONNECTIONS.connectionId,
                status: CONNECTIONS.status,
                senderId: CONNECTIONS.senderId,
                receiverId: CONNECTIONS.receiverId,
                requestedAt: CONNECTIONS.requestedAt,
                respondedAt: CONNECTIONS.respondedAt,
            })
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
            .execute();

        if (connection.length === 0) {
            return NextResponse.json({
                status: 'none',
                message: 'No connection exists between these users'
            });
        }

        const connectionData = connection[0];
        const isRequester = connectionData.senderId === currentUserId;

        return NextResponse.json({
            connectionId: connectionData.connectionId,
            status: connectionData.status,
            isRequester: isRequester,
            requestedAt: connectionData.requestedAt,
            respondedAt: connectionData.respondedAt,
        });
    } catch (error) {
        console.error("Error checking connection status:", error);
        return NextResponse.json({ message: 'Error checking connection status' }, { status: 500 });
    }
}