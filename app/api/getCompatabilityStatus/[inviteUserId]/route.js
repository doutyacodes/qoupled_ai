import { db } from '@/utils';
import { QUIZ_COMPLETION, INVITATIONS } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';

export async function GET(req, { params }) {
    // Authenticate user
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId; 
    const { inviteUserId } = params;

    try {
        // Check if the user has completed the compatibility test
        const quizStatus = await db
            .select({
                completed: QUIZ_COMPLETION.completed,
            })
            .from(QUIZ_COMPLETION)
            .where(
                and(
                    eq(QUIZ_COMPLETION.user_id, userId),
                    eq(QUIZ_COMPLETION.test_id, 'compatibility_test_id') // replace with the actual test_id for compatibility test
                )
            )
            .execute();

        if (quizStatus.length > 0 && quizStatus[0].completed === 'no') {
            return NextResponse.json({
                quizCompleted: false,
                compatibilityChecked: false,
            }, { status: 200 });
        }

        // Check if the inviteUserId has a compatibility_checked status
        const inviteStatus = await db
            .select({
                compatibilityChecked: INVITATIONS.compatibility_checked,
            })
            .from(INVITATIONS)
            .where(
                and(
                    eq(INVITATIONS.user_id, inviteUserId),
                    eq(INVITATIONS.inviter_id, userId)
                )
            )
            .execute();

        const compatibilityChecked = inviteStatus.length > 0 ? inviteStatus[0].compatibilityChecked : false;

        return NextResponse.json({
            quizCompleted: true,
            compatibilityChecked,
        }, { status: 200 });

    } catch (error) {
        console.error("Error fetching quiz and invitation status:", error);
        return NextResponse.json({ message: 'Error fetching quiz and invitation status' }, { status: 500 });
    }
}