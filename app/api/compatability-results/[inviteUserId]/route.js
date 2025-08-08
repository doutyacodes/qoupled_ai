"/api/compatability-results/[inviteUserId]"

import { db } from '@/utils';
import { TEST_PROGRESS, COMPATIBILITY_RESULTS, USER, USER_RED_FLAGS, ANSWERS, QUESTIONS } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { and, eq, inArray } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';

// Modified to fetch selected_answer_id as well
async function fetchAnswers(userId, testId) {
  return await db
    .select({
      questionId: TEST_PROGRESS.question_id,
      selectedAnswerId: TEST_PROGRESS.selected_answer_id, // Added this
      pointsReceived: TEST_PROGRESS.points_received,
    })
    .from(TEST_PROGRESS)
    .where(
      and(
        eq(TEST_PROGRESS.user_id, userId),
        eq(TEST_PROGRESS.test_id, testId)
      )
    )
    .execute();
}

async function fetchRedFlags(userId) {
  return await db
    .select({
      answerId: USER_RED_FLAGS.answer_id,
    })
    .from(USER_RED_FLAGS)
    .where(eq(USER_RED_FLAGS.user_id, userId))
    .execute();
}

async function fetchAnswerInfo(answerIds) {
  if (!answerIds.length) return [];
  
  return await db
    .select({
      answerId: ANSWERS.id,
      questionId: ANSWERS.question_id,
      answerText: ANSWERS.answerText,
      questionText: QUESTIONS.questionText,
    })
    .from(ANSWERS)
    .leftJoin(QUESTIONS, eq(ANSWERS.question_id, QUESTIONS.id))
    .where(inArray(ANSWERS.id, answerIds))
    .execute();
}

// Completely rewritten to properly check red flags
function calculateCompatibilityScore(user1Answers, user2Answers, user1RedFlags, user2RedFlags, answerInfo) {
  // First create a map to easily look up question details
  const answerDetails = {};
  answerInfo.forEach(info => {
    answerDetails[info.answerId] = {
      questionId: info.questionId,
      answerText: info.answerText,
      questionText: info.questionText
    };
  });

  // Track red flag incompatibilities
  const redFlagDetails = [];
  
  // Check if user2 selected any answers that user1 flagged
  for (const redFlag of user1RedFlags) {
    const redFlagAnswer = answerDetails[redFlag.answerId];
    if (!redFlagAnswer) continue;
    
    // Check if user2 selected this exact answer
    const user2SelectedThisAnswer = user2Answers.some(answer => 
      answer.selectedAnswerId === redFlag.answerId
    );
    
    if (user2SelectedThisAnswer) {
      redFlagDetails.push({
        questionId: redFlagAnswer.questionId,
        description: `Red flag triggered: ${redFlagAnswer.questionText}`,
        answerText: redFlagAnswer.answerText,
        flaggedBy: "user1"
      });
    }
  }
  
  // Check if user1 selected any answers that user2 flagged
  for (const redFlag of user2RedFlags) {
    const redFlagAnswer = answerDetails[redFlag.answerId];
    if (!redFlagAnswer) continue;
    
    // Skip if we already found this answer as a red flag
    if (redFlagDetails.some(rf => rf.questionId === redFlagAnswer.questionId && rf.answerText === redFlagAnswer.answerText)) {
      continue;
    }
    
    // Check if user1 selected this exact answer
    const user1SelectedThisAnswer = user1Answers.some(answer => 
      answer.selectedAnswerId === redFlag.answerId
    );
    
    if (user1SelectedThisAnswer) {
      redFlagDetails.push({
        questionId: redFlagAnswer.questionId,
        description: `Red flag triggered: ${redFlagAnswer.questionText}`,
        answerText: redFlagAnswer.answerText,
        flaggedBy: "user2"
      });
    }
  }
  
  // If any red flags were detected, compatibility is 0
  if (redFlagDetails.length > 0) {
    return { 
      compatibilityScore: 0,
      redFlags: redFlagDetails
    };
  }
  
  // Calculate regular compatibility score
  let totalScore = 0;
  let maxScore = 0;

  for (let i = 0; i < user1Answers.length; i++) {
    const difference = Math.abs(user1Answers[i].pointsReceived - user2Answers[i].pointsReceived);
    const normalizedMark = 4 - difference;
    totalScore += normalizedMark;
    maxScore += 4; // Each question's maximum score is 4
  }

  const compatibilityPercentage = Math.round((totalScore / maxScore) * 100);
  return { 
    compatibilityScore: compatibilityPercentage,
    redFlags: [] // No red flags
  };
}

async function fetchInviterDetails(inviteUserId) {
  return await db
    .select({
      username: USER.username,
      gender: USER.gender,
      imageUrl: USER.profileImageUrl,
      country: USER.country
    })
    .from(USER)
    .where(eq(USER.id, inviteUserId))
    .execute();
}

export async function GET(req, { params }) {
  const { inviteUserId } = params;
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;
  const testId = 2;

  try {
    // Check if compatibility score already exists
    const existingScore = await db
      .select()
      .from(COMPATIBILITY_RESULTS)
      .where(
        and(
          eq(COMPATIBILITY_RESULTS.user_1_id, userId),
          eq(COMPATIBILITY_RESULTS.user_2_id, inviteUserId),
          eq(COMPATIBILITY_RESULTS.test_id, testId)
        )
      )
      .execute();

    if (existingScore.length > 0) {
      const inviterDetails = await fetchInviterDetails(inviteUserId);
      let redFlags = [];
      
      // Parse the stored red flags if they exist
      if (existingScore[0].redFlags) {
        try {
          redFlags = JSON.parse(existingScore[0].redFlags);
        } catch (e) {
          console.error("Error parsing stored red flags:", e);
        }
      }

      return NextResponse.json({
        compatibilityScore: existingScore[0].compatibilityScore,
        inviter: inviterDetails[0],
        redFlags: redFlags
      }, { status: 200 });
    }

    const user1Answers = await fetchAnswers(userId, testId);
    const user2Answers = await fetchAnswers(inviteUserId, testId);

    if (user1Answers.length !== user2Answers.length || user1Answers.length === 0) {
      return NextResponse.json({ message: 'Error fetching answers or answers count mismatch' }, { status: 400 });
    }

    // Get red flags for both users
    const user1RedFlags = await fetchRedFlags(userId);
    const user2RedFlags = await fetchRedFlags(inviteUserId);
    
    // Collect all answer IDs from red flags
    const redFlagAnswerIds = [
      ...user1RedFlags.map(rf => rf.answerId),
      ...user2RedFlags.map(rf => rf.answerId)
    ];
    
    // Get answer details for red flag questions
    const answerInfo = await fetchAnswerInfo(redFlagAnswerIds);
    
    // Calculate compatibility with red flags
    const { compatibilityScore, redFlags } = calculateCompatibilityScore(
      user1Answers, 
      user2Answers,
      user1RedFlags,
      user2RedFlags,
      answerInfo
    );

    // Store the result
    await db.insert(COMPATIBILITY_RESULTS).values({
      test_id: testId,
      user_1_id: userId,
      user_2_id: inviteUserId,
      compatibilityScore: compatibilityScore,
      redFlags: JSON.stringify(redFlags) // Store the red flag information
    }).execute();

    const inviterDetails = await fetchInviterDetails(inviteUserId);

    return NextResponse.json({
      compatibilityScore: compatibilityScore,
      inviter: inviterDetails[0],
      redFlags: redFlags
    }, { status: 200 });

  } catch (error) {
    console.error("Error calculating compatibility score:", error);
    return NextResponse.json({ message: 'Error calculating compatibility score' }, { status: 500 });
  }
}