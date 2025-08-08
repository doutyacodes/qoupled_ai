import { db } from '@/utils';
import { TEST_PROGRESS, COMPATIBILITY_RESULTS, USER, USER_RED_FLAGS, ANSWERS } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { and, eq, inArray, not, isNull } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';

// This API endpoint will get all potential matches with their compatibility scores
export async function GET(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const currentUserId = userData.userId;
  const testId = 2; // Your compatibility test ID
  
  // Get URL search params for filtering
  const url = new URL(req.url);
  const minCompatibility = parseInt(url.searchParams.get('minCompatibility') || '50');
  const compatibleOnly = url.searchParams.get('compatibleOnly') === 'true';
  const limit = parseInt(url.searchParams.get('limit') || '100');

  try {
    // First, fetch current user's answers and red flags
    const currentUserAnswers = await fetchUserAnswers(currentUserId, testId);
    const currentUserRedFlags = await fetchUserRedFlags(currentUserId);
    
    if (currentUserAnswers.length === 0) {
      return NextResponse.json({ 
        message: 'You need to complete the compatibility test first',
        matchedUsers: [] 
      }, { status: 400 });
    }
    
    // Get all users who have completed the test (except current user)
    const usersWithCompletedTest = await db
      .select({
        userId: USER.id,
        username: USER.username,
        gender: USER.gender,
        // Add other user fields you need
      })
      .from(USER)
      .where(
        and(
          not(eq(USER.id, currentUserId)),
          // Only include users who have completed the test
          // This subquery checks if they have test progress records
          db.exists(
            db.select({ value: TEST_PROGRESS.user_id })
              .from(TEST_PROGRESS)
              .where(
                and(
                  eq(TEST_PROGRESS.user_id, USER.id),
                  eq(TEST_PROGRESS.test_id, testId),
                  not(isNull(TEST_PROGRESS.selected_answer_id))
                )
              )
          )
        )
      )
      .limit(limit)
      .execute();
      
    // Process each potential match
    const matchedUsersPromises = usersWithCompletedTest.map(async (user) => {
      // Check if compatibility score already exists
      const existingScore = await db
        .select()
        .from(COMPATIBILITY_RESULTS)
        .where(
          and(
            eq(COMPATIBILITY_RESULTS.user_1_id, currentUserId),
            eq(COMPATIBILITY_RESULTS.user_2_id, user.userId),
            eq(COMPATIBILITY_RESULTS.test_id, testId)
          )
        )
        .execute();
        
      let compatibilityScore;
      
      if (existingScore.length > 0) {
        // Use existing score
        compatibilityScore = existingScore[0].compatibilityScore;
      } else {
        // Calculate new score
        const otherUserAnswers = await fetchUserAnswers(user.userId, testId);
        const otherUserRedFlags = await fetchUserRedFlags(user.userId);
        
        compatibilityScore = calculateCompatibilityScore(
          currentUserAnswers,
          otherUserAnswers,
          currentUserRedFlags,
          otherUserRedFlags
        );
        
        // Store the score for future use
        await db.insert(COMPATIBILITY_RESULTS).values({
          test_id: testId,
          user_1_id: currentUserId,
          user_2_id: user.userId,
          compatibilityScore: compatibilityScore
        }).execute();
      }
      
      // Skip users below minimum compatibility threshold or those who don't match
      // the "compatible only" filter if it's enabled
      if (
        compatibilityScore < minCompatibility || 
        (compatibleOnly && compatibilityScore < 75) // Assuming 75% is your compatibility threshold
      ) {
        return null;
      }
      
      // Add additional user info
      // These fields should match what your frontend expects
      return {
        id: user.userId,
        name: user.username,
        gender: user.gender,
        compatibility: compatibilityScore,
        isCompatible: compatibilityScore >= 75, // Threshold for "Qoupled Match" badge
        // Add other fields your UI needs (you may need to fetch from other tables)
        // ...
      };
    });
    
    // Wait for all user processing to complete
    const matchedUsers = (await Promise.all(matchedUsersPromises))
      .filter(user => user !== null) // Remove null entries (filtered out users)
      .sort((a, b) => b.compatibility - a.compatibility); // Sort by compatibility (highest first)
    
    return NextResponse.json({ matchedUsers }, { status: 200 });
    
  } catch (error) {
    console.error("Error calculating compatibility scores:", error);
    return NextResponse.json({ 
      message: 'Error calculating compatibility scores',
      error: error.message
    }, { status: 500 });
  }
}

// Helper function to fetch user's answers
async function fetchUserAnswers(userId, testId) {
  return await db
    .select({
      questionId: TEST_PROGRESS.question_id,
      answerId: TEST_PROGRESS.selected_answer_id,
      pointsReceived: TEST_PROGRESS.points_received,
    })
    .from(TEST_PROGRESS)
    .where(
      and(
        eq(TEST_PROGRESS.user_id, userId),
        eq(TEST_PROGRESS.test_id, testId),
        not(isNull(TEST_PROGRESS.selected_answer_id)) // Ensure answer was selected
      )
    )
    .execute();
}

// Helper function to fetch user's red flags
async function fetchUserRedFlags(userId) {
  return await db
    .select({
      answerId: USER_RED_FLAGS.answer_id
    })
    .from(USER_RED_FLAGS)
    .where(eq(USER_RED_FLAGS.user_id, userId))
    .execute();
}

// Function to calculate compatibility score
function calculateCompatibilityScore(user1Answers, user2Answers, user1RedFlags, user2RedFlags) {
  // Create mapping of questionId to answers for easier lookup
  const user1AnswersMap = user1Answers.reduce((map, ans) => {
    map[ans.questionId] = ans;
    return map;
  }, {});
  
  const user2AnswersMap = user2Answers.reduce((map, ans) => {
    map[ans.questionId] = ans;
    return map;
  }, {});
  
  // Fetch the question IDs for all red flag answers
  const user1RedFlagAnswerIds = user1RedFlags.map(flag => flag.answerId);
  const user2RedFlagAnswerIds = user2RedFlags.map(flag => flag.answerId);
  
  // Check if any red flags exist - if none exist for either user, this is an error
  // as red flags are mandatory in your system
  if (user1RedFlagAnswerIds.length === 0 || user2RedFlagAnswerIds.length === 0) {
    console.log("One or both users have no red flags defined - mandatory requirement not met");
    return 0; // Zero compatibility when red flags aren't defined
  }
  
  // For each red flag that user 1 has, check if user 2 has given the same answer
  for (const ans of user1Answers) {
    // If this answer is a red flag for user 1
    if (user1RedFlagAnswerIds.includes(ans.answerId)) {
      const questionId = ans.questionId;
      
      // Check if user 2 selected the same answer for this question
      if (user2AnswersMap[questionId]?.answerId !== ans.answerId) {
        console.log(`Red flag mismatch: User 1 has red flag on question ${questionId}, answers don't match`);
        return 0; // Zero compatibility on red flag mismatch
      }
    }
  }
  
  // For each red flag that user 2 has, check if user 1 has given the same answer
  for (const ans of user2Answers) {
    // If this answer is a red flag for user 2
    if (user2RedFlagAnswerIds.includes(ans.answerId)) {
      const questionId = ans.questionId;
      
      // Check if user 1 selected the same answer for this question
      if (user1AnswersMap[questionId]?.answerId !== ans.answerId) {
        console.log(`Red flag mismatch: User 2 has red flag on question ${questionId}, answers don't match`);
        return 0; // Zero compatibility on red flag mismatch
      }
    }
  }
  
  // If all red flags match, calculate normal compatibility
  let totalScore = 0;
  let maxScore = 0;

  // Iterate through all questions
  for (let i = 0; i < user1Answers.length; i++) {
    const u1Answer = user1Answers[i];
    const u2Answer = user2AnswersMap[u1Answer.questionId];
    
    if (!u2Answer) continue; // Skip if user 2 didn't answer this question
    
    const difference = Math.abs(u1Answer.pointsReceived - u2Answer.pointsReceived);
    const normalizedMark = 4 - difference;
    totalScore += normalizedMark;
    maxScore += 4; // Each question's maximum score is 4
  }

  if (maxScore === 0) return 0; // Avoid division by zero
  
  const compatibilityPercentage = (totalScore / maxScore) * 100;
  return Math.round(compatibilityPercentage); // Round to nearest integer
}