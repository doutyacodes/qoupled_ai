import { db } from '@/utils';
import { COMPATIBILITY_RESULTS, QUIZ_COMPLETION } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';

export async function GET(req, { params }) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

    const userData = authResult.decoded_Data;
    const currentUserId = userData.userId;
  const targetUserId = parseInt(params.id);
  
  if (isNaN(targetUserId)) {
    return NextResponse.json({ 
      message: 'Invalid user ID',
      success: false 
    }, { status: 400 });
  }

  try {
    // Check if target user has completed the compatibility test (test_id = 2)
    const targetUserCompletion = await db
      .select({
        completed: QUIZ_COMPLETION.completed,
      })
      .from(QUIZ_COMPLETION)
      .where(
        and(
          eq(QUIZ_COMPLETION.user_id, targetUserId), 
          eq(QUIZ_COMPLETION.test_id, 2)
        )
      )
      .limit(1)
      .execute();

    // If target user hasn't completed the test
    if (!targetUserCompletion || targetUserCompletion.length === 0 || targetUserCompletion[0].completed !== 'yes') {
      return NextResponse.json({ 
        hasCompatibility: false,
        score: null,
        targetUserCompletedTest: false,
        message: 'User has not completed the compatibility test',
        success: true 
      }, { status: 200 });
    }

    // Check if current user has completed the compatibility test
    const currentUserCompletion = await db
      .select({
        completed: QUIZ_COMPLETION.completed,
      })
      .from(QUIZ_COMPLETION)
      .where(
        and(
          eq(QUIZ_COMPLETION.user_id, currentUserId), 
          eq(QUIZ_COMPLETION.test_id, 2)
        )
      )
      .limit(1)
      .execute();

    if (!currentUserCompletion || currentUserCompletion.length === 0 || currentUserCompletion[0].completed !== 'yes') {
      return NextResponse.json({ 
        hasCompatibility: false,
        score: null,
        targetUserCompletedTest: true,
        currentUserCompletedTest: false,
        message: 'You need to complete the compatibility test first',
        success: true 
      }, { status: 200 });
    }

    // Both users have completed the test, check if compatibility already calculated
    const existingCompatibility = await db
      .select()
      .from(COMPATIBILITY_RESULTS)
      .where(
        and(
          eq(COMPATIBILITY_RESULTS.user_1_id, currentUserId),
          eq(COMPATIBILITY_RESULTS.user_2_id, targetUserId),
          eq(COMPATIBILITY_RESULTS.test_id, 2)
        )
      )
      .limit(1)
      .execute();

    if (existingCompatibility && existingCompatibility.length > 0) {
      const compatibilityScore = existingCompatibility[0].compatibilityScore;
      return NextResponse.json({ 
        hasCompatibility: true,
        score: compatibilityScore,
        targetUserCompletedTest: true,
        currentUserCompletedTest: true,
        success: true 
      }, { status: 200 });
    }

    return NextResponse.json({ 
      hasCompatibility: false,
      score: null,
      targetUserCompletedTest: true,
      currentUserCompletedTest: true,
      message: 'Compatibility not yet calculated',
      success: true 
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching compatibility:", error);
    return NextResponse.json({ 
      message: 'Error fetching compatibility',
      error: error.message,
      success: false 
    }, { status: 500 });
  }
}