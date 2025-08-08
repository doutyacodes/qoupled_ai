import { db } from '@/utils'; // Ensure this path is correct
import { QUIZ_SEQUENCES } from '@/utils/schema'; // Ensure this path is correct
import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware'; // Ensure this path is correct
import { eq } from 'drizzle-orm';

export async function GET(req) {
    // Authenticate the request
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response; // Respond with authentication error
    }

    // Extract userId from decoded token
    const userData = authResult.decoded_Data;
    const userId = userData.userId;

    try {
        // Fetch data for the given userId
        const data = await db
            .select()
            .from(QUIZ_SEQUENCES)
            .where(eq(QUIZ_SEQUENCES.user_id, userId)) // Ensure userId is an integer
            .execute();

        // Respond with the fetched data
        return NextResponse.json(data, { status: 200 }); // Use 200 for successful data retrieval

    } catch (error) {
        console.error('Error fetching quiz sequences:', error);
        return NextResponse.json({ message: 'Error processing request' }, { status: 500 });
    }
}
