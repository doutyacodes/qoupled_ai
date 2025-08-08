// Example POST route for adding a couple
import { db } from '@/utils';
import { COUPLES } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';
import { eq, and } from 'drizzle-orm'; 

export async function POST(req) {
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;

    const { coupleId } = await req.json(); // `coupleId` is the user being added as a couple

    try {
        // Check if the user is already coupled
        const existingCouple = await db
            .select()
            .from(COUPLES)
            .where(
                and(
                    eq(COUPLES.user_id, userId),
                    eq(COUPLES.status, 'accepted')
                )
            )
            .execute();

        if (existingCouple.length > 0) {
            return NextResponse.json({ message: 'Already coupled with someone else.' }, { status: 400 });
        }

        // Insert new couple request
        await db.insert(COUPLES).values({
            user_id: userId,
            couple_id: coupleId,
            status: 'pending',
            created_at: new Date(),
            updated_at: new Date()
        });

        return NextResponse.json({ message: 'Couple request sent successfully.' }, { status: 201 });
    } catch (error) {
        console.error("Error processing couple request:", error);
        return NextResponse.json({ message: 'Error processing couple request' }, { status: 500 });
    }
}
