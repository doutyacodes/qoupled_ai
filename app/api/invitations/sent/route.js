import { db } from '@/utils';
import { INVITATIONS, USER, QUIZ_SEQUENCES, TEST_PROGRESS } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { eq, and, sql } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';

export async function GET(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;

  try {
    // Get all users invited by the current user
    const invitations = await db
      .select({
        id: INVITATIONS.id,
        user_id: INVITATIONS.user_id,
        created_at: INVITATIONS.created_at,
        // User details
        username: USER.username,
        birthDate: USER.birthDate,
        gender: USER.gender,
        profileImageUrl: USER.profileImageUrl,
        isProfileComplete: USER.isProfileComplete,
      })
      .from(INVITATIONS)
      .leftJoin(USER, eq(INVITATIONS.user_id, USER.id))
      .where(eq(INVITATIONS.inviter_id, userId));

    // For each invited user, get their quiz completion status
    const invitationsWithQuizStatus = await Promise.all(
      invitations.map(async (invitation) => {
        // Get first quiz status
        const quizSequence = await db
          .select()
          .from(QUIZ_SEQUENCES)
          .where(
            and(
              eq(QUIZ_SEQUENCES.user_id, invitation.user_id),
              eq(QUIZ_SEQUENCES.quiz_id, 1) // Assuming quiz_id 1 is the first test
            )
          )
          .limit(1);

        // Get second test progress
        const testProgress = await db
          .select()
          .from(TEST_PROGRESS)
          .where(eq(TEST_PROGRESS.user_id, invitation.user_id));

        return {
          ...invitation,
          quiz_sequence: quizSequence.length > 0 ? quizSequence[0] : null,
          test_progress: testProgress
        };
      })
    );

    return NextResponse.json(
      { invitations: invitationsWithQuizStatus },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return NextResponse.json(
      { message: "Error fetching invitations" },
      { status: 500 }
    );
  }
}