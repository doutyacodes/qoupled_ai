// app/api/users/invited/route.js
import { db } from '@/utils';
import { USER, INVITATIONS } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { and, eq, like, or } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';

export async function GET(req) {
    // Authenticate user
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;

    // Get search parameter from URL
    const searchParams = req.nextUrl.searchParams;
    const searchTerm = searchParams.get('search') || '';

    try {
        // Find users who have been invited by the current user
        let query = db
            .select({
                id: USER.id,
                username: USER.username,
                profileImageUrl: USER.profileImageUrl,
                country: USER.country,
                state: USER.state,
                city: USER.city,
                religion: USER.religion,
                caste: USER.caste,
            })
            .from(USER)
            .innerJoin(
                INVITATIONS,
                and(
                    eq(INVITATIONS.user_id, USER.id),
                    eq(INVITATIONS.inviter_id, userId)
                )
            );

        // Add search filter if provided
        if (searchTerm && searchTerm.trim() !== '') {
            query = query.where(
                or(
                    like(USER.username, `%${searchTerm}%`),
                    like(USER.country, `%${searchTerm}%`),
                    like(USER.state, `%${searchTerm}%`),
                    like(USER.city, `%${searchTerm}%`),
                    like(USER.religion, `%${searchTerm}%`),
                    like(USER.caste, `%${searchTerm}%`)
                )
            );
        }

        const users = await query.execute();

        return NextResponse.json({
            users: users
        });
    } catch (error) {
        console.error("Error searching invited users:", error);
        return NextResponse.json({ message: 'Error searching invited users' }, { status: 500 });
    }
}