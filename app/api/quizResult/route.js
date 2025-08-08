import { db } from '@/utils';
import { QUIZ_SEQUENCES, USER_PROGRESS } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { eq, inArray } from 'drizzle-orm'; // Ensure these imports match your ORM version
import { authenticate } from '@/lib/jwtMiddleware';
import { createSequence } from './createSequence';


export async function POST(req) {

    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
      }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;
    try {
        
            const savedProgress = await db
                                    .select()
                                    .from(USER_PROGRESS)
                                    .where(eq(USER_PROGRESS.user_id, userId),)
            // Create sequence and insert into QUIZ_SEQUENCES
            try {
                await createSequence(savedProgress, userId, 1);
                return NextResponse.json({ message: 'Success' }, { status: 201 });
            } catch (createSequenceError) {
                console.error("Error creating personality sequence:", createSequenceError);
                return NextResponse.json({ message: 'Error creating personality sequence' }, { status: 500 });
            }

    } catch (error) {
        console.error("Error fetching questions and answers:", error);
        return NextResponse.json({ message: 'Error fetching questions and answers' }, { status: 500 });
    }
}