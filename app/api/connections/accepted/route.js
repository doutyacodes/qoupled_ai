// app/api/connections/accepted/route.js
import { db } from '@/utils';
import { CONNECTIONS, USER, USER_IMAGES } from '@/utils/schema'; // ADDED: USER_IMAGES import
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
    // console.log("userId",userId)
    try {
        // Fetch users with accepted connections to the current user (as sender)
        const receiverConnections = await db
            .select({
                id: USER.id,
                username: USER.username,
                // profileImageUrl from USER table
                country: USER.country,
                state: USER.state,
                city: USER.city,
                connectionId: CONNECTIONS.connectionId,
                // ADDED: profile image from USER_IMAGES
                profileImageUrl: USER_IMAGES.image_url
            })
            .from(USER)
            .innerJoin(
                CONNECTIONS,
                and(
                    eq(CONNECTIONS.receiverId, USER.id),
                    eq(CONNECTIONS.senderId, userId),
                    eq(CONNECTIONS.status, 'accepted')
                )
            )
            .leftJoin(USER_IMAGES, and( // ADDED: Join with USER_IMAGES table
                eq(USER_IMAGES.user_id, USER.id),
                eq(USER_IMAGES.is_profile, true)
            ))
            .execute();

        // Fetch users with accepted connections to the current user (as receiver)
        const senderConnections = await db
            .select({
                id: USER.id,
                username: USER.username,
                //: profileImageUrl from USER table
                country: USER.country,
                state: USER.state,
                city: USER.city,
                connectionId: CONNECTIONS.connectionId,
                //: profile image from USER_IMAGES
                profileImageUrl: USER_IMAGES.image_url
            })
            .from(USER)
            .innerJoin(
                CONNECTIONS,
                and(
                    eq(CONNECTIONS.senderId, USER.id),
                    eq(CONNECTIONS.receiverId, userId),
                    eq(CONNECTIONS.status, 'accepted')
                )
            )
            .leftJoin(USER_IMAGES, and( // ADDED: Join with USER_IMAGES table
                eq(USER_IMAGES.user_id, USER.id),
                eq(USER_IMAGES.is_profile, true)
            ))
            .execute();

        // Combine both sets of connections
        const connectedUsers = [...receiverConnections, ...senderConnections];

        return NextResponse.json({
            users: connectedUsers
        });
    } catch (error) {
        console.error("Error fetching accepted connections:", error);
        return NextResponse.json({ message: 'Error fetching accepted connections' }, { status: 500 });
    }
}