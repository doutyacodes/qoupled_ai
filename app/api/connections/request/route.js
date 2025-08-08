// app/api/connections/request/route.js
import { db } from '@/utils';
import { CONNECTIONS, USER } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { eq, and, or } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';
export async function POST(req) {
    // Authenticate user
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const senderId = userData.userId;

    try {
        const { receiverId } = await req.json();

        if (!receiverId) {
            return NextResponse.json({ message: 'Receiver ID is required' }, { status: 400 });
        }

        // Check if receiver exists
        const receiver = await db
            .select({ id: USER.id })
            .from(USER)
            .where(eq(USER.id, receiverId))
            .execute();

        if (receiver.length === 0) {
            return NextResponse.json({ message: 'Receiver user not found' }, { status: 404 });
        }

        // Check if a connection already exists
        const existingConnection = await db
            .select({
                connectionId: CONNECTIONS.connectionId,
                status: CONNECTIONS.status,
            })
            .from(CONNECTIONS)
            .where(
                or(
                    and(
                        eq(CONNECTIONS.senderId, senderId),
                        eq(CONNECTIONS.receiverId, receiverId)
                    ),
                    and(
                        eq(CONNECTIONS.senderId, receiverId),
                        eq(CONNECTIONS.receiverId, senderId)
                    )
                )
            )
            .execute();

        if (existingConnection.length > 0) {
            return NextResponse.json({
                message: `Connection already exists with status: ${existingConnection[0].status}`,
                connectionId: existingConnection[0].connectionId,
                status: existingConnection[0].status,
            }, { status: 409 });
        }

        // Create new connection request
        const newConnection = await db
            .insert(CONNECTIONS)
            .values({
                senderId: senderId,
                receiverId: receiverId,
                status: 'pending',
                requestedAt: new Date(),
            })
            .returning({
                connectionId: CONNECTIONS.connectionId,
            })
            .execute();

        return NextResponse.json({
            message: 'Connection request sent successfully',
            connectionId: newConnection[0].connectionId,
            status: 'pending',
        });
    } catch (error) {
        console.error("Error sending connection request:", error);
        return NextResponse.json({ message: 'Error sending connection request' }, { status: 500 });
    }
}
