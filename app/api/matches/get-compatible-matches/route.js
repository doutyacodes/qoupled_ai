import { db } from '@/utils';
import { 
  QUIZ_SEQUENCES, 
  USER, 
  USER_LANGUAGES, 
  USER_OCCUPATION, 
  LANGUAGES, 
  MBTI_COMPATIBILITY,
  USER_PREFERENCES,
  USER_MATCHING_PREFERENCES,
  USER_MULTI_PREFERENCES,
  USER_MATCHING_MULTI_PREFERENCES,
  USER_RANGE_PREFERENCES,
  PREFERENCE_CATEGORIES,
  PREFERENCE_OPTIONS,
  USER_IMAGES // ADDED: Import USER_IMAGES table
} from '@/utils/schema';
import { NextResponse } from 'next/server';
import { eq, and, inArray, desc, asc, not, sql, or, isNull } from 'drizzle-orm';
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

    // Step 4: Get user details for these compatible users with profile images
    const userDetails = await db
      .select({
        id: USER.id,
        username: USER.username,
        birthDate: USER.birthDate,
        gender: USER.gender,
        height: USER.height,
        isProfileComplete: USER.isProfileComplete,
        // REMOVED: profileImageUrl from USER table
        // ADDED: profile image from USER_IMAGES
        profileImageUrl: USER_IMAGES.image_url
      })
      .from(USER)
      .leftJoin(USER_IMAGES, and( // ADDED: Join with USER_IMAGES table
        eq(USER_IMAGES.user_id, USER.id),
        eq(USER_IMAGES.is_profile, true)
      ))
      .where(inArray(USER.id, filteredUserIds));

    // Step 5: Get the current user's matching preferences
    const userMatchingPreferences = await db
      .select({
        category_id: USER_MATCHING_PREFERENCES.category_id,
        importance: USER_MATCHING_PREFERENCES.importance,
        category_name: PREFERENCE_CATEGORIES.name,
      })
      .from(USER_MATCHING_PREFERENCES)
      .leftJoin(
        PREFERENCE_CATEGORIES,
        eq(USER_MATCHING_PREFERENCES.category_id, PREFERENCE_CATEGORIES.id)
      )
      .where(eq(USER_MATCHING_PREFERENCES.user_id, userId));
    
    // Get the current user's range preferences
    const userRangePreferences = await db
      .select({
        category_id: USER_RANGE_PREFERENCES.category_id,
        min_value: USER_RANGE_PREFERENCES.min_value,
        max_value: USER_RANGE_PREFERENCES.max_value,
        importance: USER_RANGE_PREFERENCES.importance,
        category_name: PREFERENCE_CATEGORIES.name,
      })
      .from(USER_RANGE_PREFERENCES)
      .leftJoin(
        PREFERENCE_CATEGORIES,
        eq(USER_RANGE_PREFERENCES.category_id, PREFERENCE_CATEGORIES.id)
      )
      .where(eq(USER_RANGE_PREFERENCES.user_id, userId));
    
    // Get the current user's multi-preferences
    const userMultiPreferences = await db
      .select({
        category_id: USER_MATCHING_MULTI_PREFERENCES.category_id,
        option_id: USER_MATCHING_MULTI_PREFERENCES.option_id,
        importance: USER_MATCHING_MULTI_PREFERENCES.importance,
        category_name: PREFERENCE_CATEGORIES.name,
        option_value: PREFERENCE_OPTIONS.value,
      })
      .from(USER_MATCHING_MULTI_PREFERENCES)
      .leftJoin(
        PREFERENCE_CATEGORIES,
        eq(USER_MATCHING_MULTI_PREFERENCES.category_id, PREFERENCE_CATEGORIES.id)
      )
      .leftJoin(
        PREFERENCE_OPTIONS,
        eq(USER_MATCHING_MULTI_PREFERENCES.option_id, PREFERENCE_OPTIONS.id)
      )
      .where(eq(USER_MATCHING_MULTI_PREFERENCES.user_id, userId));

    // Step 6: Calculate preference match scores for all potential matches
    const preferenceScores = {};
    const maxPreferenceScore = 100;
    
    // Initialize scores for all users
    filteredUserIds.forEach(uid => {
      preferenceScores[uid] = {
        score: 0,
        totalFactors: 0,
        matches: [],
        mismatches: []
      };
    });

    // Process each user to evaluate against preferences
    for (const matchUserId of filteredUserIds) {
      // Get user's preferences/attributes
      const userPrefs = await db
        .select({
          category_id: USER_PREFERENCES.category_id,
          option_id: USER_PREFERENCES.option_id,
          category_name: PREFERENCE_CATEGORIES.name,
          option_value: PREFERENCE_OPTIONS.value,
          display_value: PREFERENCE_OPTIONS.display_value,
        })
        .from(USER_PREFERENCES)
        .leftJoin(
          PREFERENCE_CATEGORIES,
          eq(USER_PREFERENCES.category_id, PREFERENCE_CATEGORIES.id)
        )
        .leftJoin(
          PREFERENCE_OPTIONS,
          eq(USER_PREFERENCES.option_id, PREFERENCE_OPTIONS.id)
        )
        .where(eq(USER_PREFERENCES.user_id, matchUserId));

      // Get user's multi-preferences (interests, languages, etc.)
      const userMultiPrefs = await db
        .select({
          category_id: USER_MULTI_PREFERENCES.category_id,
          option_id: USER_MULTI_PREFERENCES.option_id,
          category_name: PREFERENCE_CATEGORIES.name,
          option_value: PREFERENCE_OPTIONS.value,
          display_value: PREFERENCE_OPTIONS.display_value,
        })
        .from(USER_MULTI_PREFERENCES)
        .leftJoin(
          PREFERENCE_CATEGORIES,
          eq(USER_MULTI_PREFERENCES.category_id, PREFERENCE_CATEGORIES.id)
        )
        .leftJoin(
          PREFERENCE_OPTIONS,
          eq(USER_MULTI_PREFERENCES.option_id, PREFERENCE_OPTIONS.id)
        )
        .where(eq(USER_MULTI_PREFERENCES.user_id, matchUserId));

      // Check single-choice preferences
      for (const pref of userMatchingPreferences) {
        const matchingPref = userPrefs.find(up => up.category_id === pref.category_id);
        
        if (matchingPref) {
          // Check if the preference matches
          const matchUserAttr = await db
            .select({
              option_id: USER_PREFERENCES.option_id,
              value: PREFERENCE_OPTIONS.value,
              display_value: PREFERENCE_OPTIONS.display_value,
            })
            .from(USER_PREFERENCES)
            .leftJoin(
              PREFERENCE_OPTIONS,
              eq(USER_PREFERENCES.option_id, PREFERENCE_OPTIONS.id)
            )
            .where(
              and(
                eq(USER_PREFERENCES.user_id, matchUserId),
                eq(USER_PREFERENCES.category_id, pref.category_id)
              )
            );

          if (matchUserAttr.length > 0) {
            // Calculate weight based on importance
            let weight = 0;
            switch (pref.importance) {
              case 'must_have': weight = 5; break;
              case 'important': weight = 3; break;
              case 'nice_to_have': weight = 1; break;
              default: weight = 0;
            }

            if (weight > 0) {
              preferenceScores[matchUserId].totalFactors += weight;
              // Store match/mismatch info
              preferenceScores[matchUserId].matches.push({
                category: pref.category_name,
                value: matchUserAttr[0].display_value,
                importance: pref.importance
              });
              // Add to score
              preferenceScores[matchUserId].score += weight;
            }
          }
        }
      }

      // Check range preferences (age, height, etc.)
      for (const rangePref of userRangePreferences) {
        // Find the actual value for this user for this category
        // In real scenario, you'd need to derive values like age from birthdate
        // For simplicity, we'll use the USER table or other attributes
        
        let actualValue = null;
        
        // Example for height
        if (rangePref.category_name === 'height' && userDetails.find(u => u.id === matchUserId)?.height) {
          actualValue = userDetails.find(u => u.id === matchUserId).height;
        }
        // Example for age
        else if (rangePref.category_name === 'age' && userDetails.find(u => u.id === matchUserId)?.birthDate) {
          const birthDate = userDetails.find(u => u.id === matchUserId).birthDate;
          const today = new Date();
          const birthDateObj = new Date(birthDate);
          actualValue = today.getFullYear() - birthDateObj.getFullYear();
          
          // Adjust age if birthday hasn't occurred yet this year
          const m = today.getMonth() - birthDateObj.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
            actualValue--;
          }
        }
        
        if (actualValue !== null) {
          const inRange = actualValue >= rangePref.min_value && actualValue <= rangePref.max_value;
          
          // Calculate weight based on importance
          let weight = 0;
          switch (rangePref.importance) {
            case 'must_have': weight = 5; break;
            case 'important': weight = 3; break;
            case 'nice_to_have': weight = 1; break;
            default: weight = 0;
          }
          
          if (weight > 0) {
            preferenceScores[matchUserId].totalFactors += weight;
            
            if (inRange) {
              // Add to score if value is in range
              preferenceScores[matchUserId].score += weight;
              preferenceScores[matchUserId].matches.push({
                category: rangePref.category_name,
                value: actualValue,
                range: `${rangePref.min_value}-${rangePref.max_value}`,
                importance: rangePref.importance
              });
            } else {
              preferenceScores[matchUserId].mismatches.push({
                category: rangePref.category_name,
                value: actualValue,
                range: `${rangePref.min_value}-${rangePref.max_value}`,
                importance: rangePref.importance
              });
            }
          }
        }
      }

      // Check multi-preferences (languages, interests, etc.)
      const multiPrefsByCategory = {};
      userMultiPreferences.forEach(p => {
        if (!multiPrefsByCategory[p.category_id]) {
          multiPrefsByCategory[p.category_id] = {
            category_name: p.category_name,
            importance: p.importance,
            options: []
          };
        }
        multiPrefsByCategory[p.category_id].options.push({
          option_id: p.option_id,
          value: p.option_value
        });
      });
      
      // Group user's multi preferences by category
      const userMultiPrefsByCategory = {};
      userMultiPrefs.forEach(p => {
        if (!userMultiPrefsByCategory[p.category_id]) {
          userMultiPrefsByCategory[p.category_id] = [];
        }
        userMultiPrefsByCategory[p.category_id].push({
          option_id: p.option_id,
          value: p.option_value,
          display_value: p.display_value
        });
      });
      
      // Check for matches in multi-preferences
      for (const categoryId in multiPrefsByCategory) {
        const prefCategory = multiPrefsByCategory[categoryId];
        const userPrefs = userMultiPrefsByCategory[categoryId] || [];
        
        if (userPrefs.length > 0) {
          // Calculate overlap between preferences
          const preferredOptionIds = new Set(prefCategory.options.map(o => o.option_id));
          const matchingOptions = userPrefs.filter(p => preferredOptionIds.has(p.option_id));
          
          if (matchingOptions.length > 0) {
            // Calculate weight based on importance and match percentage
            let weight = 0;
            switch (prefCategory.importance) {
              case 'must_have': weight = 5; break;
              case 'important': weight = 3; break;
              case 'nice_to_have': weight = 1; break;
              default: weight = 0;
            }
            
            if (weight > 0) {
              preferenceScores[matchUserId].totalFactors += weight;
              
              // Calculate score based on percentage of matches
              const matchPercentage = matchingOptions.length / prefCategory.options.length;
              const adjustedWeight = weight * matchPercentage;
              preferenceScores[matchUserId].score += adjustedWeight;
              
              preferenceScores[matchUserId].matches.push({
                category: prefCategory.category_name,
                values: matchingOptions.map(o => o.display_value),
                importance: prefCategory.importance,
                matchPercentage: Math.round(matchPercentage * 100)
              });
            }
          } else {
            // No matches for this category
            let weight = 0;
            switch (prefCategory.importance) {
              case 'must_have': weight = 5; break;
              case 'important': weight = 3; break;
              case 'nice_to_have': weight = 1; break;
              default: weight = 0;
            }
            
            if (weight > 0) {
              preferenceScores[matchUserId].totalFactors += weight;
              
              preferenceScores[matchUserId].mismatches.push({
                category: prefCategory.category_name,
                values: userPrefs.map(o => o.display_value),
                importance: prefCategory.importance
              });
            }
          }
        }
      }
      
      // Normalize score to 0-100 scale if there are any factors
      if (preferenceScores[matchUserId].totalFactors > 0) {
        preferenceScores[matchUserId].score = Math.round(
          (preferenceScores[matchUserId].score / preferenceScores[matchUserId].totalFactors) * 100
        );
      }
    }

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
      
      // Get preference score information
      const preferenceScore = preferenceScores[user.id] ? preferenceScores[user.id].score : 0;
      const preferenceMatches = preferenceScores[user.id] ? preferenceScores[user.id].matches : [];
      const preferenceMismatches = preferenceScores[user.id] ? preferenceScores[user.id].mismatches : [];

      // Create a composite score combining MBTI and preferences
      const mbtiScoreMap = { 'great': 100, 'good': 75, 'average': 50 };
      const mbtiScore = mbtiScoreMap[compatibilityTier] || 50;
      
      // Composite score: 60% MBTI, 40% preferences
      const compositeScore = Math.round((mbtiScore * 0.6) + (preferenceScore * 0.4));

      return {
        id: user.id,
        username: user.username,
        birthDate: user.birthDate,
        gender: user.gender,
        imageUrl: user.profileImageUrl, // UPDATED: Now from USER_IMAGES
        mbti: {
          type: mbtiType,
          compatibilityTier,
          matchOrder: compatibilityInfo?.order || 99,
        },
        preferences: {
          score: preferenceScore,
          matches: preferenceMatches,
          mismatches: preferenceMismatches
        },
        compositeScore,
      };
    });

    // Sort matches by composite score (highest first)
    matches.sort((a, b) => b.compositeScore - a.compositeScore);

    return NextResponse.json(
      { success: true, matches },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching compatible matches:", error);
    return NextResponse.json(
      { success: false, message: 'Error fetching compatible matches', error: error.message },
      { status: 500 }
    );
  }
}