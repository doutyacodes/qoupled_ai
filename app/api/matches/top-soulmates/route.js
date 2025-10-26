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
  JOB_TITLES,
  QUIZ_SEQUENCES,
  USER_PREFERENCE_VALUES,
  PREFERENCE_CATEGORIES,
  PREFERENCE_OPTIONS,
  USER_IMAGES, // ADDED: Import USER_IMAGES table
  RELIGIONS,
  CASTES_OR_DENOMINATIONS
} from '@/utils/schema';
import { NextResponse } from 'next/server';
import { and, eq, ne, inArray, notInArray, isNotNull, or, sql } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';

// MBTI compatibility matrix for personality-based matching
const MBTI_COMPATIBILITY = {
  'INTJ': ['ENFP', 'ENTP', 'INFJ', 'INFP'],
  'INTP': ['ENFJ', 'ENTJ', 'INFJ', 'INTJ'],
  'ENTJ': ['INFP', 'INTP', 'ENFJ', 'ENTP'],
  'ENTP': ['INFJ', 'INTJ', 'ENFJ', 'ENTJ'],
  'INFJ': ['ENFP', 'ENTP', 'INTJ', 'INTP'],
  'INFP': ['ENFJ', 'ENTJ', 'INTJ', 'ENTP'],
  'ENFJ': ['INFP', 'ISFP', 'INTP', 'INFJ'],
  'ENFP': ['INTJ', 'INFJ', 'ENTJ', 'ENFJ'],
  'ISTJ': ['ESFP', 'ESTP', 'ISFJ', 'ISTP'],
  'ISFJ': ['ESFP', 'ESTP', 'ISTJ', 'ISFP'],
  'ESTJ': ['ISFP', 'ISTP', 'ISTJ', 'ESFJ'],
  'ESFJ': ['ISFP', 'ISTP', 'ISTJ', 'ESTJ'],
  'ISTP': ['ESFJ', 'ESTJ', 'ISFJ', 'ISTJ'],
  'ISFP': ['ESFJ', 'ESTJ', 'ENFJ', 'ESFP'],
  'ESTP': ['ISFJ', 'ISTJ', 'ESFP', 'ISTP'],
  'ESFP': ['ISTJ', 'ISFJ', 'ESTP', 'ISFP']
};

// Helper function to get user's lookingFor preference
async function getUserLookingFor(userId) {
  try {
    // Find the looking_for category
    const [category] = await db
      .select({ id: PREFERENCE_CATEGORIES.id })
      .from(PREFERENCE_CATEGORIES)
      .where(eq(PREFERENCE_CATEGORIES.name, 'looking_for'))
      .limit(1);

    if (!category) return 'Any';

    // Get user's preference
    const [preference] = await db
      .select({
        value: PREFERENCE_OPTIONS.value
      })
      .from(USER_PREFERENCE_VALUES)
      .leftJoin(PREFERENCE_OPTIONS, eq(USER_PREFERENCE_VALUES.optionId, PREFERENCE_OPTIONS.id))
      .where(
        and(
          eq(USER_PREFERENCE_VALUES.userId, userId),
          eq(USER_PREFERENCE_VALUES.categoryId, category.id)
        )
      )
      .limit(1);

    return preference?.value || 'Any';
  } catch (error) {
    console.error('Error fetching lookingFor preference:', error);
    return 'Any';
  }
}

// Helper function to check if user matches the lookingFor criteria
function matchesLookingForCriteria(userGender, lookingFor) {
  if (lookingFor === 'Any' || lookingFor === 'Both') return true;
  return userGender === lookingFor;
}

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
  const answerDetails = {};
  answerInfo.forEach(info => {
    answerDetails[info.answerId] = {
      questionId: info.questionId,
      answerText: info.answerText,
      questionText: info.questionText
    };
  });

  const hasRedFlags = [];
  
  // Check red flag incompatibilities
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
  
  if (hasRedFlags.length > 0) {
    return { 
      compatibilityScore: Math.max(10, 30 - (hasRedFlags.length * 10)),
      hasRedFlags: true,
      redFlagDetails: hasRedFlags
    };
  }
  
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

// Calculate personality-based score using MBTI
function calculatePersonalityScore(userMbti, matchMbti) {
  const compatibleTypes = MBTI_COMPATIBILITY[userMbti] || [];
  
  if (compatibleTypes.includes(matchMbti)) {
    const index = compatibleTypes.indexOf(matchMbti);
    return Math.max(70, 95 - (index * 5));
  }
  
  const userFunctions = userMbti.split('');
  const matchFunctions = matchMbti.split('');
  let similarities = 0;
  
  for (let i = 0; i < 4; i++) {
    if (userFunctions[i] === matchFunctions[i]) {
      similarities++;
    }
  }
  
  return Math.max(40, 50 + (similarities * 10));
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

  try {
    // Get current user's info including plan and lookingFor preference
    const currentUserInfo = await db
      .select({
        gender: USER.gender,
        birthDate: USER.birthDate,
        currentPlan: USER.currentPlan
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
    let userPlan = currentUser.currentPlan || 'free';

    // Get user's lookingFor preference
    const userLookingFor = await getUserLookingFor(currentUserId);

    // If no plan is set, update to free plan
    if (!currentUser.currentPlan) {
      await db
        .update(USER)
        .set({ currentPlan: 'free' })
        .where(eq(USER.id, currentUserId))
        .execute();
      userPlan = 'free';
    }

    // Check if user completed compatibility test
    let hasCompletedCompatibilityTest = false;
    let useCompatibilityMatching = false;
    let matchingType = 'personality';

    if (userPlan !== 'free') {
      const compatibilityAnswers = await fetchUserAnswers(currentUserId, 2);
      hasCompletedCompatibilityTest = compatibilityAnswers.length > 0;
      
      if (hasCompletedCompatibilityTest) {
        useCompatibilityMatching = true;
        matchingType = 'compatibility';
      }
    }

    console.log("useCompatibilityMatching",useCompatibilityMatching)
    // Get user's MBTI type for personality-based matching
    let userMbtiType = null;
    const userMbti = await db
      .select({
        mbtiType: QUIZ_SEQUENCES.type_sequence
      })
      .from(QUIZ_SEQUENCES)
      .where(and(
        eq(QUIZ_SEQUENCES.user_id, currentUserId),
        eq(QUIZ_SEQUENCES.quiz_id, 1),
        eq(QUIZ_SEQUENCES.isCompleted, true)
      ))
      .limit(1)
      .execute();

    if (userMbti.length > 0) {
      userMbtiType = userMbti[0].mbtiType?.trim()?.toUpperCase();
    }

    // If no personality test completed, suggest taking it
    if (!userMbtiType && !useCompatibilityMatching) {
      return NextResponse.json({
        success: false,
        message: 'Please complete your personality assessment first',
        matches: [],
        userPlan,
        hasCompletedCompatibilityTest,
        matchingType,
        needsPersonalityTest: true
      }, { status: 400 });
    }

    // Calculate age range for filtering
    const currentAge = calculateAge(currentUser.birthDate);
    const minAge = Math.max(18, currentAge - 10);
    const maxAge = currentAge + 10;

    let potentialMatches = [];

    // Build gender filter based on lookingFor preference
    let genderConditions;
    if (userLookingFor === 'Any' || userLookingFor === 'Both') {
      genderConditions = ne(USER.gender, currentUser.gender); // Just avoid same gender
    } else {
      genderConditions = eq(USER.gender, userLookingFor);
    }

    if (useCompatibilityMatching) {
      console.log("inthe compatibuility score get")
      // ========================================
      // COMPATIBILITY-BASED MATCHING (Premium)
      // ========================================
      const currentUserAnswers = await fetchUserAnswers(currentUserId, 2);
      const currentUserRedFlags = await fetchUserRedFlags(currentUserId);

      potentialMatches = await db
        .select({
          id: USER.id,
          username: USER.username,
          birthDate: USER.birthDate,
          gender: USER.gender,
          country: USER.country,
          state: USER.state,
          city: USER.city,
          religion: RELIGIONS.name,
          caste: CASTES_OR_DENOMINATIONS.name,
          height: USER.height,
          weight: USER.weight,
          income: USER.income,
          isProfileVerified: USER.isProfileVerified,
          isProfileComplete: USER.isProfileComplete,
          profileImageUrl: sql`COALESCE(MAX(${USER_IMAGES.image_url}), NULL)`.as('profileImageUrl')
        })
        .from(USER)
        .innerJoin(TEST_PROGRESS, eq(TEST_PROGRESS.user_id, USER.id))
        .leftJoin(USER_IMAGES, and(
          eq(USER_IMAGES.user_id, USER.id),
          eq(USER_IMAGES.is_profile, true)
        ))
        .leftJoin(RELIGIONS, eq(USER.religion_id, RELIGIONS.id))
        .leftJoin(CASTES_OR_DENOMINATIONS, eq(USER.caste_id, CASTES_OR_DENOMINATIONS.id))
        .where(
          and(
            ne(USER.id, currentUserId),
            eq(TEST_PROGRESS.test_id, 2),
            genderConditions,
            isNotNull(USER.username),
            isNotNull(USER.birthDate)
          )
        )
        .groupBy(
          USER.id,
          USER.username,
          USER.birthDate,
          USER.gender,
          USER.country,
          USER.state,
          USER.city,
          USER.height,
          USER.weight,
          USER.income,
          USER.isProfileVerified,
          USER.isProfileComplete
        )
        .execute();

      // Filter by mutual lookingFor preference
      const filteredByPreference = [];
      for (const match of potentialMatches) {
        const matchLookingFor = await getUserLookingFor(match.id);
        
        // Check if current user matches what the potential match is looking for
        if (matchesLookingForCriteria(currentUser.gender, matchLookingFor)) {
          filteredByPreference.push(match);
        }
      }

      // Calculate compatibility scores
      const matchesWithScores = [];
      for (const potentialMatch of filteredByPreference) {
        const userAge = calculateAge(potentialMatch.birthDate);
        if (userAge < minAge || userAge > maxAge) continue;

        // Check if compatibility already calculated
        const existingCompatibility = await db
          .select()
          .from(COMPATIBILITY_RESULTS)
          .where(
            and(
              eq(COMPATIBILITY_RESULTS.user_1_id, currentUserId),
              eq(COMPATIBILITY_RESULTS.user_2_id, potentialMatch.id),
              eq(COMPATIBILITY_RESULTS.test_id, 2)
            )
          )
          .limit(1)
          .execute();

        let compatibilityData;

        if (existingCompatibility.length > 0) {
          compatibilityData = {
            compatibilityScore: existingCompatibility[0].compatibilityScore,
            hasRedFlags: existingCompatibility[0].redFlags ? JSON.parse(existingCompatibility[0].redFlags).length > 0 : false,
            redFlagDetails: existingCompatibility[0].redFlags ? JSON.parse(existingCompatibility[0].redFlags) : []
          };
        } else {
          const matchAnswers = await fetchUserAnswers(potentialMatch.id, 2);
          const matchRedFlags = await fetchUserRedFlags(potentialMatch.id);
          
          if (matchAnswers.length === currentUserAnswers.length) {
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

            // Store the result
            await db.insert(COMPATIBILITY_RESULTS).values({
              test_id: 2,
              user_1_id: currentUserId,
              user_2_id: potentialMatch.id,
              compatibilityScore: compatibilityData.compatibilityScore,
              redFlags: JSON.stringify(compatibilityData.redFlagDetails || [])
            }).execute();
          } else {
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
          age: userAge,
          compatibilityScore: compatibilityData.compatibilityScore,
          hasRedFlags: compatibilityData.hasRedFlags,
          redFlagDetails: compatibilityData.redFlagDetails,
          education: education[0] || null,
          job: job[0] || null,
          matchQuality: compatibilityData.compatibilityScore >= 80 ? 'exceptional' : 
                       compatibilityData.compatibilityScore >= 60 ? 'great' : 'good'
        });
      }

      // Sort by compatibility score and take top 10
      potentialMatches = matchesWithScores
        .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
        .slice(0, 10);

    } else {
      // ========================================
      // PERSONALITY-BASED MATCHING (Free/MBTI)
      // ========================================
      potentialMatches = await db
        .select({
          id: USER.id,
          username: USER.username,
          birthDate: USER.birthDate,
          gender: USER.gender,
          country: USER.country,
          state: USER.state,
          city: USER.city,
          religion: RELIGIONS.name,
          caste: CASTES_OR_DENOMINATIONS.name,
          height: USER.height,
          weight: USER.weight,
          income: USER.income,
          isProfileVerified: USER.isProfileVerified,
          isProfileComplete: USER.isProfileComplete,
          mbtiType: QUIZ_SEQUENCES.type_sequence,
          profileImageUrl: sql`COALESCE(MAX(${USER_IMAGES.image_url}), NULL)`.as('profileImageUrl')
        })
        .from(USER)
        .innerJoin(QUIZ_SEQUENCES, eq(QUIZ_SEQUENCES.user_id, USER.id))
        .leftJoin(USER_IMAGES, and(
          eq(USER_IMAGES.user_id, USER.id),
          eq(USER_IMAGES.is_profile, true)
        ))
        .leftJoin(RELIGIONS, eq(USER.religion_id, RELIGIONS.id))
        .leftJoin(CASTES_OR_DENOMINATIONS, eq(USER.caste_id, CASTES_OR_DENOMINATIONS.id))
        .where(
          and(
            ne(USER.id, currentUserId),
            eq(QUIZ_SEQUENCES.quiz_id, 1),
            eq(QUIZ_SEQUENCES.isCompleted, true),
            genderConditions,
            isNotNull(USER.username),
            isNotNull(USER.birthDate)
          )
        )
         .groupBy(
            USER.id,
            USER.username,
            USER.birthDate,
            USER.gender,
            USER.country,
            USER.state,
            USER.city,
            USER.height,
            USER.weight,
            USER.income,
            USER.isProfileVerified,
            USER.isProfileComplete,
            QUIZ_SEQUENCES.type_sequence
          )
        .execute();

      // Filter by mutual lookingFor preference
      const filteredByPreference = [];
      for (const match of potentialMatches) {
        const matchLookingFor = await getUserLookingFor(match.id);
        
        // Check if current user matches what the potential match is looking for
        if (matchesLookingForCriteria(currentUser.gender, matchLookingFor)) {
          filteredByPreference.push(match);
        }
      }

      // Calculate personality scores and filter by age
      const matchesWithScores = filteredByPreference
        .map(match => {
          const userAge = calculateAge(match.birthDate);
          if (userAge < minAge || userAge > maxAge) return null;

          const matchMbtiType = match.mbtiType?.trim()?.toUpperCase();
          if (!matchMbtiType || !userMbtiType) return null;

          const personalityScore = calculatePersonalityScore(userMbtiType, matchMbtiType);

          return {
            ...match,
            age: userAge,
            personalityScore,
            hasRedFlags: false,
            redFlagDetails: [],
            matchQuality: personalityScore >= 80 ? 'exceptional' : 
                         personalityScore >= 60 ? 'great' : 'good'
          };
        })
        .filter(match => match !== null);

      // Get additional profile information for each match
      const enrichedMatches = [];
      for (const match of matchesWithScores) {
        const education = await db
          .select({
            degree: USER_EDUCATION.degree,
            levelName: EDUCATION_LEVELS.levelName,
            graduationYear: USER_EDUCATION.graduationYear
          })
          .from(USER_EDUCATION)
          .leftJoin(EDUCATION_LEVELS, eq(USER_EDUCATION.education_level_id, EDUCATION_LEVELS.id))
          .where(eq(USER_EDUCATION.user_id, match.id))
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
          .where(eq(USER_JOB.user_id, match.id))
          .limit(1)
          .execute();

        enrichedMatches.push({
          ...match,
          education: education[0] || null,
          job: job[0] || null
        });
      }

      // Sort by personality score and take top 10
      potentialMatches = enrichedMatches
        .sort((a, b) => b.personalityScore - a.personalityScore)
        .slice(0, 10);
    }

    return NextResponse.json({
      success: true,
      message: 'Matches retrieved successfully',
      matches: potentialMatches,
      userPlan,
      hasCompletedCompatibilityTest,
      matchingType,
      userLookingFor,
      totalPotentialMatches: potentialMatches.length
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json({
      success: false,
      message: 'Error fetching matches',
      error: error.message,
      matches: [],
      userPlan: 'free',
      hasCompletedCompatibilityTest: false,
      matchingType: 'personality'
    }, { status: 500 });
  }
}