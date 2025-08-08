// app/api/matches/top-soulmates/route.js
import { db } from '@/utils';
import { 
  USER, 
  TEST_PROGRESS, 
  COMPATIBILITY_RESULTS, 
  USER_RED_FLAGS,
  ANSWERS,
  QUESTIONS,
  USER_EDUCATION,
  EDUCATION_LEVELS,
  USER_JOB,
  JOB_TITLES
} from '@/utils/schema';
import { NextResponse } from 'next/server';
import { and, eq, ne, inArray, notInArray, isNotNull } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';

// Helper function to fetch user's quiz answers
async function fetchUserAnswers(userId, testId = 2) {
  return await db
    .select({
      questionId: TEST_PROGRESS.question_id,
      selectedAnswerId: TEST_PROGRESS.selected_answer_id,
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

// Helper function to fetch user's red flags
async function fetchUserRedFlags(userId) {
  return await db
    .select({
      answerId: USER_RED_FLAGS.answer_id,
    })
    .from(USER_RED_FLAGS)
    .where(eq(USER_RED_FLAGS.user_id, userId))
    .execute();
}

// Helper function to get answer details for red flag checking
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

// Calculate compatibility score between two users
function calculateCompatibilityScore(user1Answers, user2Answers, user1RedFlags, user2RedFlags, answerInfo) {
  // Create answer details map
  const answerDetails = {};
  answerInfo.forEach(info => {
    answerDetails[info.answerId] = {
      questionId: info.questionId,
      answerText: info.answerText,
      questionText: info.questionText
    };
  });

  // Check for red flag incompatibilities
  const hasRedFlags = [];
  
  // Check if user2 selected any answers that user1 flagged
  for (const redFlag of user1RedFlags) {
    const user2SelectedThisAnswer = user2Answers.some(answer => 
      answer.selectedAnswerId === redFlag.answerId
    );
    
    if (user2SelectedThisAnswer) {
      const redFlagAnswer = answerDetails[redFlag.answerId];
      if (redFlagAnswer) {
        hasRedFlags.push({
          questionId: redFlagAnswer.questionId,
          description: redFlagAnswer.questionText,
          answerText: redFlagAnswer.answerText
        });
      }
    }
  }
  
  // Check if user1 selected any answers that user2 flagged
  for (const redFlag of user2RedFlags) {
    const user1SelectedThisAnswer = user1Answers.some(answer => 
      answer.selectedAnswerId === redFlag.answerId
    );
    
    if (user1SelectedThisAnswer) {
      const redFlagAnswer = answerDetails[redFlag.answerId];
      if (redFlagAnswer && !hasRedFlags.some(rf => rf.questionId === redFlagAnswer.questionId)) {
        hasRedFlags.push({
          questionId: redFlagAnswer.questionId,
          description: redFlagAnswer.questionText,
          answerText: redFlagAnswer.answerText
        });
      }
    }
  }
  
  // If red flags exist, return low compatibility
  if (hasRedFlags.length > 0) {
    return { 
      compatibilityScore: Math.max(10, 30 - (hasRedFlags.length * 10)), // Penalize but don't make it 0
      hasRedFlags: true,
      redFlagDetails: hasRedFlags
    };
  }
  
  // Calculate regular compatibility score
  let totalScore = 0;
  let maxScore = 0;

  for (let i = 0; i < Math.min(user1Answers.length, user2Answers.length); i++) {
    const difference = Math.abs(user1Answers[i].pointsReceived - user2Answers[i].pointsReceived);
    const normalizedMark = 4 - difference;
    totalScore += normalizedMark;
    maxScore += 4;
  }

  const compatibilityPercentage = Math.round((totalScore / maxScore) * 100);
  return { 
    compatibilityScore: compatibilityPercentage,
    hasRedFlags: false,
    redFlagDetails: []
  };
}

// Helper function to calculate age from birth date
function calculateAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

export async function GET(req) {
  // Authenticate user
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const currentUserId = userData.userId;
  const testId = 2; // Compatibility quiz test ID

  try {
    // Get current user's answers
    const currentUserAnswers = await fetchUserAnswers(currentUserId, testId);
    
    if (currentUserAnswers.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Please complete the compatibility quiz first',
        matches: []
      }, { status: 400 });
    }

    // Get current user's red flags
    const currentUserRedFlags = await fetchUserRedFlags(currentUserId);

    // Get current user's basic info for filtering
    const currentUserInfo = await db
      .select({
        gender: USER.gender,
        birthDate: USER.birthDate
      })
      .from(USER)
      .where(eq(USER.id, currentUserId))
      .limit(1)
      .execute();

    if (currentUserInfo.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'User not found',
        matches: []
      }, { status: 404 });
    }

    const currentUser = currentUserInfo[0];

    // Get all potential matches (users who completed the quiz, excluding current user)
    // Filter by opposite gender and reasonable age range
    const currentAge = calculateAge(currentUser.birthDate);
    const minAge = Math.max(18, currentAge - 10);
    const maxAge = currentAge + 10;

    const potentialMatches = await db
      .select({
        id: USER.id,
        username: USER.username,
        birthDate: USER.birthDate,
        gender: USER.gender,
        profileImageUrl: USER.profileImageUrl,
        country: USER.country,
        state: USER.state,
        city: USER.city,
        religion: USER.religion,
        height: USER.height,
        weight: USER.weight,
        income: USER.income,
        isProfileVerified: USER.isProfileVerified,
        isProfileComplete: USER.isProfileComplete
      })
      .from(USER)
      .innerJoin(TEST_PROGRESS, eq(TEST_PROGRESS.user_id, USER.id))
      .where(
        and(
          ne(USER.id, currentUserId),
          eq(TEST_PROGRESS.test_id, testId),
          // Filter by opposite gender (for heterosexual matching)
          ne(USER.gender, currentUser.gender),
          isNotNull(USER.username),
          isNotNull(USER.birthDate)
        )
      )
      .groupBy(USER.id)
      .execute();

    // Filter by age range
    const ageFilteredMatches = potentialMatches.filter(user => {
      const userAge = calculateAge(user.birthDate);
      return userAge >= minAge && userAge <= maxAge;
    });

    // Calculate compatibility scores for each potential match
    const matchesWithScores = [];

    for (const potentialMatch of ageFilteredMatches) {
      // Check if compatibility already calculated
      const existingCompatibility = await db
        .select()
        .from(COMPATIBILITY_RESULTS)
        .where(
          and(
            eq(COMPATIBILITY_RESULTS.user_1_id, currentUserId),
            eq(COMPATIBILITY_RESULTS.user_2_id, potentialMatch.id),
            eq(COMPATIBILITY_RESULTS.test_id, testId)
          )
        )
        .limit(1)
        .execute();

      let compatibilityData;

      if (existingCompatibility.length > 0) {
        // Use existing score
        compatibilityData = {
          compatibilityScore: existingCompatibility[0].compatibilityScore,
          hasRedFlags: existingCompatibility[0].redFlags ? JSON.parse(existingCompatibility[0].redFlags).length > 0 : false,
          redFlagDetails: existingCompatibility[0].redFlags ? JSON.parse(existingCompatibility[0].redFlags) : []
        };
      } else {
        // Calculate new score
        const matchAnswers = await fetchUserAnswers(potentialMatch.id, testId);
        const matchRedFlags = await fetchUserRedFlags(potentialMatch.id);
        
        if (matchAnswers.length === currentUserAnswers.length) {
          // Get answer info for red flag checking
          const allRedFlagAnswerIds = [
            ...currentUserRedFlags.map(rf => rf.answerId),
            ...matchRedFlags.map(rf => rf.answerId)
          ];
          const answerInfo = await fetchAnswerInfo(allRedFlagAnswerIds);
          
          compatibilityData = calculateCompatibilityScore(
            currentUserAnswers,
            matchAnswers,
            currentUserRedFlags,
            matchRedFlags,
            answerInfo
          );

          // Store the result for future use
          await db.insert(COMPATIBILITY_RESULTS).values({
            test_id: testId,
            user_1_id: currentUserId,
            user_2_id: potentialMatch.id,
            compatibilityScore: compatibilityData.compatibilityScore,
            redFlags: JSON.stringify(compatibilityData.redFlagDetails || [])
          }).execute();
        } else {
          // Skip if answer counts don't match
          continue;
        }
      }

      // Get additional profile information
      const education = await db
        .select({
          degree: USER_EDUCATION.degree,
          levelName: EDUCATION_LEVELS.levelName,
          graduationYear: USER_EDUCATION.graduationYear
        })
        .from(USER_EDUCATION)
        .leftJoin(EDUCATION_LEVELS, eq(USER_EDUCATION.education_level_id, EDUCATION_LEVELS.id))
        .where(eq(USER_EDUCATION.user_id, potentialMatch.id))
        .limit(1)
        .execute();

      const job = await db
        .select({
          title: JOB_TITLES.title,
          company: USER_JOB.company,
          location: USER_JOB.location
        })
        .from(USER_JOB)
        .leftJoin(JOB_TITLES, eq(USER_JOB.job_title_id, JOB_TITLES.id))
        .where(eq(USER_JOB.user_id, potentialMatch.id))
        .limit(1)
        .execute();

      matchesWithScores.push({
        ...potentialMatch,
        age: calculateAge(potentialMatch.birthDate),
        compatibilityScore: compatibilityData.compatibilityScore,
        hasRedFlags: compatibilityData.hasRedFlags,
        redFlagDetails: compatibilityData.redFlagDetails,
        education: education[0] || null,
        job: job[0] || null,
        // Calculate match quality
        matchQuality: compatibilityData.compatibilityScore >= 80 ? 'exceptional' : 
                     compatibilityData.compatibilityScore >= 60 ? 'great' : 'good'
      });
    }

    // Sort by compatibility score (highest first) and take top 10
    const topMatches = matchesWithScores
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      message: 'Top matches retrieved successfully',
      matches: topMatches,
      totalPotentialMatches: matchesWithScores.length
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching top matches:", error);
    return NextResponse.json({
      success: false,
      message: 'Error fetching matches',
      matches: []
    }, { status: 500 });
  }
}