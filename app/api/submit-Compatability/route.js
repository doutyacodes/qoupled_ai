import { db } from '@/utils';
import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';
import { eq, and} from 'drizzle-orm';
import { QUIZ_COMPLETION } from '@/utils/schema'; // Import relevant tables


export async function POST(req) {
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;
    // const userId = 1
    const testId = 2
    try {
         
        // Update the existing record with the new sequence
        await db.update(QUIZ_COMPLETION)
        .set({
            completed: 'yes', // Update the type_sequence field
        })
        .where(
            and(
                eq(QUIZ_COMPLETION.user_id, userId),
                eq(QUIZ_COMPLETION.test_id, testId)
            )
        );
        
        return NextResponse.json({ message: 'Test Data Completed' }, { status: 201 });

    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ message: 'Error processing request' }, { status: 500 });
    }
}
