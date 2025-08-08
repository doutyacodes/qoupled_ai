import { db } from '@/utils';
import { CONNECTIONS } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';

export async function POST(req) {
    // Authenticate the request
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    try {
        const userData = authResult.decoded_Data;
        const senderId = userData.userId;
        
        // Get receiver ID from request body
        const requestData = await req.json();
        const { receiverId } = requestData;
        
        if (!receiverId) {
            return NextResponse.json({ message: 'Receiver ID is required' }, { status: 400 });
        }

        // Check if a connection request already exists between these users
        const existingConnection = await db
            .select()
            .from(CONNECTIONS)
            .where(
                and(
                    eq(CONNECTIONS.senderId, senderId),
                    eq(CONNECTIONS.receiverId, receiverId)
                )
            );

        if (existingConnection.length > 0) {
            return NextResponse.json({ 
                message: 'Connection request already exists',
                status: existingConnection[0].status
            }, { status: 409 });
        }

        // Create new connection request
        await db.insert(CONNECTIONS).values({
            senderId: senderId,
            receiverId: receiverId,
            status: "pending",
            requestedAt: new Date()
        });

        return NextResponse.json({ 
            message: 'Connection request sent successfully' 
        }, { status: 201 });

    } catch (error) {
        console.error("Error sending connection request:", error);
        return NextResponse.json({ 
            message: 'Error sending connection request' 
        }, { status: 500 });
    }
}