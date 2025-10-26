// // File: /app/api/compatibility-matches/route.js
// import { db } from '@/utils';
// import { COMPATIBILITY_RESULTS, USER, USER_DETAILS } from '@/utils/schema';
// import { NextResponse } from 'next/server';
// import { and, eq, gte } from 'drizzle-orm';
// import { authenticate } from '@/lib/jwtMiddleware';

// export async function GET(req) {
//   const authResult = await authenticate(req);
//   if (!authResult.authenticated) {
//     return authResult.response;
//   }

//   const userData = authResult.decoded_Data;
//   const userId = userData.userId;
//   const testId = 2; // Compatibility test ID
  
//   // Get parameters from query string
//   const url = new URL(req.url);
//   const minCompatibility = parseInt(url.searchParams.get('minCompatibility') || '50');
//   const maxResults = parseInt(url.searchParams.get('limit') || '100');
//   const compatibleOnly = url.searchParams.get('compatibleOnly') === 'true';
  
//   try {
//     // Get compatibility results where this user is either user_1 or user_2
//     const resultsAsUser1 = await db
//       .select({
//         matchUserId: COMPATIBILITY_RESULTS.user_2_id,
//         score: COMPATIBILITY_RESULTS.compatibilityScore
//       })
//       .from(COMPATIBILITY_RESULTS)
//       .where(
//         and(
//           eq(COMPATIBILITY_RESULTS.test_id, testId),
//           eq(COMPATIBILITY_RESULTS.user_1_id, userId),
//           gte(COMPATIBILITY_RESULTS.compatibilityScore, minCompatibility)
//         )
//       )
//       .execute();
      
//     const resultsAsUser2 = await db
//       .select({
//         matchUserId: COMPATIBILITY_RESULTS.user_1_id,
//         score: COMPATIBILITY_RESULTS.compatibilityScore
//       })
//       .from(COMPATIBILITY_RESULTS)
//       .where(
//         and(
//           eq(COMPATIBILITY_RESULTS.test_id, testId),
//           eq(COMPATIBILITY_RESULTS.user_2_id, userId),
//           gte(COMPATIBILITY_RESULTS.compatibilityScore, minCompatibility)
//         )
//       )
//       .execute();
      
//     // Combine results
//     const allResults = [...resultsAsUser1, ...resultsAsUser2];
    
//     // Get user details for all matched users
//     const matchedUserIds = allResults.map(result => result.matchUserId);
    
//     let matchedUsers = [];
    
//     if (matchedUserIds.length > 0) {
//       // First get basic user info
//       const userBasicDetails = await db
//         .select({
//           id: USER.id,
//           username: USER.username,
//           gender: USER.gender,
//           birthDate: USER.birthDate
//         })
//         .from(USER)
//         .where(
//           USER.id.in(matchedUserIds)
//         )
//         .execute();
      
//       // Then get extended user details
//       const userExtendedDetails = await db
//         .select({
//           id: USER_DETAILS.id,
//           location: USER_DETAILS.location,
//           education: USER_DETAILS.education,
//           religion: USER_DETAILS.religion
//         })
//         .from(USER_DETAILS)
//         .where(
//           USER_DETAILS.id.in(matchedUserIds)
//         )
//         .execute();
      
//       // Join user details with compatibility scores
//       matchedUsers = userBasicDetails.map(basicInfo => {
//         const matchResult = allResults.find(r => r.matchUserId === basicInfo.id);
//         const extendedInfo = userExtendedDetails.find(d => d.id === basicInfo.id) || {};
        
//         // Calculate age
//         const now = new Date();
//         const birthDate = new Date(basicInfo.birthDate);
//         const age = now.getFullYear() - birthDate.getFullYear() - 
//                    (now.getMonth() < birthDate.getMonth() || 
//                    (now.getMonth() === birthDate.getMonth() && now.getDate() < birthDate.getDate()) ? 1 : 0);
        
//         // Determine if compatible (example logic - customize based on your needs)
//         // For demo purposes, we're considering matches with >75% score as "Qoupled Compatible"
//         const isCompatible = matchResult.score > 75;
        
//         // Mock interests (in a real app, you'd fetch these from a database)
//         const interests = ['Reading', 'Travel', 'Music', 'Sports', 'Art', 'Cooking', 'Gaming', 'Hiking']
//           .sort(() => 0.5 - Math.random())
//           .slice(0, Math.floor(Math.random() * 5) + 1);
        
//         return {
//           id: basicInfo.id,
//           name: basicInfo.username,
//           gender: basicInfo.gender,
//           age: age,
//           location: extendedInfo.location || "Unknown",
//           interests: interests,
//           compatibility: matchResult.score,
//           isCompatible: isCompatible,
//           // Add a placeholder image - in a real app, you'd use actual user photos
//           imageUrl: `https://randomuser.me/api/portraits/${basicInfo.gender?.toLowerCase() === 'female' ? 'women' : 'men'}/${basicInfo.id % 99 || 1}.jpg`
//         };
//       });
      
//       // Apply compatibility filter if requested
//       if (compatibleOnly) {
//         matchedUsers = matchedUsers.filter(user => user.isCompatible);
//       }
      
//       // Sort by compatibility score (descending)
//       matchedUsers.sort((a, b) => b.compatibility - a.compatibility);
      
//       // Limit results
//       matchedUsers = matchedUsers.slice(0, maxResults);
//     }
    
//     return NextResponse.json({
//       matchedUsers: matchedUsers,
//       totalMatches: matchedUsers.length
//     }, { status: 200 });
    
//   } catch (error) {
//     console.error("Error fetching compatibility matches:", error);
//     return NextResponse.json({ 
//       message: 'Error fetching compatibility matches',
//       error: error.message
//     }, { status: 500 });
//   }
// }

import { db } from '@/utils';
import { 
  QUIZ_SEQUENCES, 
  USER, 
  USER_LANGUAGES, 
  LANGUAGES, 
  MBTI_COMPATIBILITY,
  USER_EDUCATION,
  USER_JOB,
  CASTES_OR_DENOMINATIONS,
  RELIGIONS
} from '@/utils/schema';
import { NextResponse } from 'next/server';
import { eq, and, inArray, desc, asc, join } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';

export async function GET(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;

  try {
    // Step 1: Get the current user's MBTI type from completed quiz
    const userSequence = await db
      .select({
        type_sequence: QUIZ_SEQUENCES.type_sequence,
      })
      .from(QUIZ_SEQUENCES)
      .where(
        and(
          eq(QUIZ_SEQUENCES.user_id, userId),
          eq(QUIZ_SEQUENCES.isCompleted, true),
          eq(QUIZ_SEQUENCES.quiz_id, 1) // Assuming quiz_id 1 is the MBTI test
        )
      )
      .orderBy(desc(QUIZ_SEQUENCES.createddate))
      .limit(1);

    if (userSequence.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No completed compatibility test found' },
        { status: 404 }
      );
    }

    const userMbtiType = userSequence[0].type_sequence;

    // Step 2: Get compatible MBTI types for the user's type, only great, good, average tiers
    const compatibleTypes = await db
      .select({
        compatibleType: MBTI_COMPATIBILITY.compatibleType,
        tier: MBTI_COMPATIBILITY.tier,
        match_order: MBTI_COMPATIBILITY.match_order,
      })
      .from(MBTI_COMPATIBILITY)
      .where(
        and(
          eq(MBTI_COMPATIBILITY.mbtiType, userMbtiType),
          inArray(MBTI_COMPATIBILITY.tier, ['great', 'good', 'average'])
        )
      )
      .orderBy(asc(MBTI_COMPATIBILITY.match_order));

    if (compatibleTypes.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No compatibility data found' },
        { status: 404 }
      );
    }

    const compatibleMbtiTypes = compatibleTypes.map(type => type.compatibleType);

    // Step 3: Get users with those compatible MBTI types
    const compatibleUserIds = await db
      .select({
        user_id: QUIZ_SEQUENCES.user_id,
        type_sequence: QUIZ_SEQUENCES.type_sequence,
      })
      .from(QUIZ_SEQUENCES)
      .where(
        and(
          inArray(QUIZ_SEQUENCES.type_sequence, compatibleMbtiTypes),
          eq(QUIZ_SEQUENCES.isCompleted, true),
          eq(QUIZ_SEQUENCES.quiz_id, 1)
        )
      );

    if (compatibleUserIds.length === 0) {
      return NextResponse.json(
        { success: true, matches: [] },
        { status: 200 }
      );
    }

    // Get unique user IDs (in case a user has taken the test multiple times)
    const uniqueUserIds = [...new Set(compatibleUserIds.map(item => item.user_id))];
    
    // Filter out the current user
    const filteredUserIds = uniqueUserIds.filter(id => id !== userId);

    // Step 4: Get user details for these compatible users
    const userDetails = await db
      .select({
        id: USER.id,
        username: USER.username,
        birthDate: USER.birthDate,
        gender: USER.gender,
        profileImageUrl: USER.profileImageUrl,
        country: USER.country,
        state: USER.state,
        city: USER.city,
        religionId: USER.religion_id,               // UPDATED
        religionName: RELIGIONS.name,                // UPDATED
        casteId: USER.caste_id,                     // UPDATED
        casteName: CASTES_OR_DENOMINATIONS.name,     // UPDATED
        height: USER.height,
        weight: USER.weight,
        income: USER.income,
        isProfileVerified: USER.isProfileVerified
      })
      .from(USER)
      .leftJoin(RELIGIONS, eq(USER.religion_id, RELIGIONS.id))  // ADD THIS LINE
      .leftJoin(CASTES_OR_DENOMINATIONS, eq(USER.caste_id, CASTES_OR_DENOMINATIONS.id))  // ADD THIS LINE
      .where(inArray(USER.id, filteredUserIds));

    // Step 5: Fetch languages for each user
    const userLanguages = await db
      .select({
        user_id: USER_LANGUAGES.user_id,
        language: LANGUAGES.title
      })
      .from(USER_LANGUAGES)
      .leftJoin(LANGUAGES, eq(USER_LANGUAGES.language_id, LANGUAGES.id))
      .where(inArray(USER_LANGUAGES.user_id, filteredUserIds));

    // Create a map of user_id to languages
    const languageMap = userLanguages.reduce((acc, item) => {
      if (!acc[item.user_id]) {
        acc[item.user_id] = [];
      }
      acc[item.user_id].push(item.language);
      return acc;
    }, {});

    // Step 6: Fetch education details
    const userEducation = await db
      .select({
        user_id: USER_EDUCATION.user_id,
        degree: USER_EDUCATION.degree,
        graduationYear: USER_EDUCATION.graduationYear
      })
      .from(USER_EDUCATION)
      .where(inArray(USER_EDUCATION.user_id, filteredUserIds));

    // Create a map of user_id to education
    const educationMap = userEducation.reduce((acc, item) => {
      if (!acc[item.user_id]) {
        acc[item.user_id] = [];
      }
      acc[item.user_id].push({
        degree: item.degree,
        graduationYear: item.graduationYear
      });
      return acc;
    }, {});

    // Step 7: Fetch job details
    const userJobs = await db
      .select({
        user_id: USER_JOB.user_id,
        jobTitle: USER_JOB.jobTitle,
        company: USER_JOB.company,
        location: USER_JOB.location
      })
      .from(USER_JOB)
      .where(inArray(USER_JOB.user_id, filteredUserIds));

    // Create a map of user_id to jobs
    const jobMap = userJobs.reduce((acc, item) => {
      if (!acc[item.user_id]) {
        acc[item.user_id] = [];
      }
      acc[item.user_id].push({
        jobTitle: item.jobTitle,
        company: item.company,
        location: item.location
      });
      return acc;
    }, {});

    // Create compatibility map
    const compatibilityMap = compatibleTypes.reduce((acc, type) => {
      acc[type.compatibleType] = {
        tier: type.tier,
        order: type.match_order,
      };
      return acc;
    }, {});

    // Step 8: Combine all data to create the response
    const matches = userDetails.map(user => {
      // Find the user's MBTI type from quiz results
      const userMbtiData = compatibleUserIds.find(item => item.user_id === user.id);
      const mbtiType = userMbtiData ? userMbtiData.type_sequence : null;
      
      // Get compatibility information
      const compatibilityInfo = mbtiType ? compatibilityMap[mbtiType] : null;
      
      const compatibilityTier = compatibilityInfo ? compatibilityInfo.tier : 'average';

      // Get languages, education, and job information
      const languages = languageMap[user.id] || [];
      const education = educationMap[user.id] || [];
      const jobs = jobMap[user.id] || [];

      // Get current job if available
      const currentJob = jobs.length > 0 ? jobs[0] : null;
      const occupation = currentJob ? currentJob.jobTitle : null;

      return {
        id: user.id,
        username: user.username,
        birthDate: user.birthDate,
        gender: user.gender,
        imageUrl: user.profileImageUrl,
        country: user.country,
        state: user.state,
        city: user.city,
        religion: user.religionName || null,         // UPDATED
        caste: user.casteName || null,               // UPDATED
        religionId: user.religionId || null,         // UPDATED (optional)
        casteId: user.casteId || null,               // UPDATED (optional)
        height: user.height,
        weight: user.weight,
        income: user.income,
        isProfileVerified: user.isProfileVerified,
        languages,
        education,
        occupation,
        compatibilityTier,
        matchOrder: compatibilityInfo?.order || 99,
      };
    });

    // Sort matches by compatibility tier (great > good > average)
    const tierOrder = { great: 1, good: 2, average: 3 };
    matches.sort((a, b) => {
      // First by tier
      const tierDiff = tierOrder[a.compatibilityTier] - tierOrder[b.compatibilityTier];
      if (tierDiff !== 0) return tierDiff;
      
      // Then by order within the same tier
      return a.matchOrder - b.matchOrder;
    });

    return NextResponse.json(
      { success: true, matches },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching compatible matches:", error);
    return NextResponse.json(
      { success: false, message: 'Error fetching compatible matches' },
      { status: 500 }
    );
  }
}