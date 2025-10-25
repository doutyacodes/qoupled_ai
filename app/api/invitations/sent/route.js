import { db } from '@/utils';
import { INVITATIONS, USER, QUIZ_SEQUENCES, TEST_PROGRESS, USER_IMAGES } from '@/utils/schema'; // ADDED: USER_IMAGES import
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
    // Get all users invited by the current user with profile images
    const invitations = await db
      .select({
        id: INVITATIONS.id,
        user_id: INVITATIONS.user_id,
        created_at: INVITATIONS.created_at,
        // User details
        username: USER.username,
        birthDate: USER.birthDate,
        gender: USER.gender,
        // REMOVED: profileImageUrl from USER table
        isProfileComplete: USER.isProfileComplete,
        // ADDED: profile image from USER_IMAGES
        profileImageUrl: USER_IMAGES.image_url
      })
      .from(INVITATIONS)
      .leftJoin(USER, eq(INVITATIONS.user_id, USER.id))
      .leftJoin(USER_IMAGES, and( // ADDED: Join with USER_IMAGES table
        eq(USER_IMAGES.user_id, INVITATIONS.user_id),
        eq(USER_IMAGES.is_profile, true)
      ))
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
          profileImageUrl: invitation.profileImageUrl, // UPDATED: Now from USER_IMAGES
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