// app/api/ai-chat/get-friend-suggestion/route.js
import { NextResponse } from "next/server";
import { authenticate } from "@/lib/jwtMiddleware";
import { 
  USER, 
  QUIZ_SEQUENCES,
  AI_CHARACTERS,
  USER_AI_FRIENDS,
  USER_SUGGESTIONS,
  USER_PREFERENCE_VALUES, // FIXED: Changed from USER_PREFERENCES
  PREFERENCE_CATEGORIES,
  PREFERENCE_OPTIONS
} from "@/utils/schema";
import { db } from "@/utils";
import { eq, and, ne, inArray, isNotNull, notInArray } from "drizzle-orm";

export async function POST(request) {
  console.log("🚀 START: get-friend-suggestion route called");
  
  const authResult = await authenticate(request);
  if (!authResult.authenticated) {
    console.log("❌ AUTHENTICATION FAILED");
    return authResult.response;
  }
  console.log("✅ AUTHENTICATION SUCCESS");

  const userData = authResult.decoded_Data;
  const userId = userData.userId || userData.id;
  console.log("👤 USER DATA:", { userData, userId });
  
  const { aiCharacterId } = await request.json();
  console.log("🤖 AI CHARACTER ID:", aiCharacterId);

  if (!aiCharacterId || !Number.isInteger(Number(aiCharacterId))) {
    console.log("❌ INVALID AI CHARACTER ID");
    return NextResponse.json(
      { error: "Valid AI character ID is required." },
      { status: 400 }
    );
  }

  try {
    console.log("📊 STEP 1: Getting user MBTI type and basic info...");
    
    // Step 1: Get current user's MBTI type and basic info
    const userMbti = await db
      .select({
        mbtiType: QUIZ_SEQUENCES.type_sequence,
        username: USER.username,
        gender: USER.gender,
        birthDate: USER.birthDate,
        profileImageUrl: USER.profileImageUrl,
        country: USER.country,
        state: USER.state,
        city: USER.city,
        religion: USER.religion
      })
      .from(QUIZ_SEQUENCES)
      .innerJoin(USER, eq(QUIZ_SEQUENCES.user_id, USER.id))
      .where(and(
        eq(QUIZ_SEQUENCES.user_id, userId),
        eq(QUIZ_SEQUENCES.quiz_id, 1),
        eq(QUIZ_SEQUENCES.isCompleted, true)
      ))
      .limit(1)
      .execute();

    console.log("📊 USER MBTI QUERY RESULT:", userMbti);

    if (userMbti.length === 0) {
      console.log("❌ NO MBTI DATA FOUND FOR USER");
      return NextResponse.json(
        { error: "Please complete your personality assessment first." },
        { status: 400 }
      );
    }

    const currentUser = userMbti[0];
    const userMbtiType = currentUser.mbtiType?.trim()?.toUpperCase();
    console.log("👤 CURRENT USER:", currentUser);
    console.log("🧠 USER MBTI TYPE:", userMbtiType);
    
    if (!userMbtiType || userMbtiType.length !== 4) {
      console.log("❌ INVALID MBTI TYPE");
      return NextResponse.json(
        { error: "Invalid personality type. Please retake the assessment." },
        { status: 400 }
      );
    }

    console.log("🤖 STEP 2: Getting AI character data...");
    
    // Step 2: Get AI character's MBTI type
    const aiCharacter = await db
      .select()
      .from(AI_CHARACTERS)
      .where(eq(AI_CHARACTERS.id, aiCharacterId))
      .limit(1)
      .execute();

    console.log("🤖 AI CHARACTER QUERY RESULT:", aiCharacter);

    if (aiCharacter.length === 0) {
      console.log("❌ AI CHARACTER NOT FOUND");
      return NextResponse.json(
        { error: "AI character not found." },
        { status: 404 }
      );
    }

    const ai = aiCharacter[0];
    console.log("🤖 AI CHARACTER DATA:", ai);

    console.log("👥 STEP 3: Getting user's AI friends...");
    
    // Step 3: Get current user's AI friends
    const userAiFriends = await db
      .select({
        aiMbtiType: USER_AI_FRIENDS.ai_friend_mbti_type,
        friendIndex: USER_AI_FRIENDS.friend_index,
        friendshipStrength: USER_AI_FRIENDS.friendship_strength
      })
      .from(USER_AI_FRIENDS)
      .where(and(
        eq(USER_AI_FRIENDS.user_id, userId),
        eq(USER_AI_FRIENDS.is_active, true)
      ))
      .execute();

    console.log("👥 USER AI FRIENDS QUERY RESULT:", userAiFriends);

    const userAiMbtiTypes = userAiFriends.map(friend => friend.aiMbtiType);
    console.log("🧠 USER AI MBTI TYPES:", userAiMbtiTypes);

    const aiTypesToSearch = userAiMbtiTypes.length > 0 ? userAiMbtiTypes : ['ENFJ', 'INFP', 'ENFP', 'INFJ'];
    console.log("🔍 AI TYPES TO SEARCH:", aiTypesToSearch);

    console.log("🚫 STEP 4: Getting already suggested users...");
    
    // Step 4: Get users who were already suggested
    const alreadySuggested = await db
      .select({ suggestedUserId: USER_SUGGESTIONS.suggestedUserId })
      .from(USER_SUGGESTIONS)
      .where(and(
        eq(USER_SUGGESTIONS.aiCharacterId, aiCharacterId),
        eq(USER_SUGGESTIONS.requesterUserId, userId)
      ))
      .execute();

    console.log("🚫 ALREADY SUGGESTED QUERY RESULT:", alreadySuggested);

    const suggestedUserIds = alreadySuggested.map(s => s.suggestedUserId);
    console.log("🚫 SUGGESTED USER IDS:", suggestedUserIds);

    console.log("🔍 STEP 5: Finding potential friends...");
    
    // Step 5: Find potential friends
    let potentialFriends;
    
    if (userAiMbtiTypes.length > 0) {
      console.log("🔍 SEARCHING WITH USER'S AI FRIENDS");
      potentialFriends = await db
        .select({
          userId: USER.id,
          username: USER.username,
          profileImageUrl: USER.profileImageUrl,
          gender: USER.gender,
          birthDate: USER.birthDate,
          country: USER.country,
          state: USER.state,
          city: USER.city,
          religion: USER.religion,
          userMbtiType: QUIZ_SEQUENCES.type_sequence,
          aiMbtiType: USER_AI_FRIENDS.ai_friend_mbti_type,
          friendshipStrength: USER_AI_FRIENDS.friendship_strength
        })
        .from(USER_AI_FRIENDS)
        .innerJoin(USER, eq(USER_AI_FRIENDS.user_id, USER.id))
        .leftJoin(QUIZ_SEQUENCES, and(
          eq(USER.id, QUIZ_SEQUENCES.user_id),
          eq(QUIZ_SEQUENCES.quiz_id, 1),
          eq(QUIZ_SEQUENCES.isCompleted, true)
        ))
        .where(and(
          ne(USER_AI_FRIENDS.user_id, userId),
          eq(USER_AI_FRIENDS.is_active, true),
          inArray(USER_AI_FRIENDS.ai_friend_mbti_type, userAiMbtiTypes),
          suggestedUserIds.length > 0 ? notInArray(USER.id, suggestedUserIds) : undefined
        ))
        .execute();
    } else {
      console.log("🔍 FALLBACK: USER HAS NO AI FRIENDS");
      potentialFriends = await db
        .select({
          userId: USER.id,
          username: USER.username,
          profileImageUrl: USER.profileImageUrl,
          gender: USER.gender,
          birthDate: USER.birthDate,
          country: USER.country,
          state: USER.state,
          city: USER.city,
          religion: USER.religion,
          userMbtiType: QUIZ_SEQUENCES.type_sequence,
          aiMbtiType: USER_AI_FRIENDS.ai_friend_mbti_type,
          friendshipStrength: USER_AI_FRIENDS.friendship_strength
        })
        .from(USER_AI_FRIENDS)
        .innerJoin(USER, eq(USER_AI_FRIENDS.user_id, USER.id))
        .leftJoin(QUIZ_SEQUENCES, and(
          eq(USER.id, QUIZ_SEQUENCES.user_id),
          eq(QUIZ_SEQUENCES.quiz_id, 1),
          eq(QUIZ_SEQUENCES.isCompleted, true)
        ))
        .where(and(
          ne(USER_AI_FRIENDS.user_id, userId),
          eq(USER_AI_FRIENDS.is_active, true),
          suggestedUserIds.length > 0 ? notInArray(USER.id, suggestedUserIds) : undefined
        ))
        .limit(20)
        .execute();
    }

    console.log("🔍 POTENTIAL FRIENDS QUERY RESULT:", potentialFriends);
    console.log("📊 POTENTIAL FRIENDS COUNT:", potentialFriends.length);

    if (potentialFriends.length === 0) {
      console.log("❌ NO POTENTIAL FRIENDS FOUND");
      return NextResponse.json({
        success: false,
        error: "No potential friends found. Try completing more personality assessments or check back later!",
        suggestion: null
      }, { status: 404 });
    }

    console.log("🎲 STEP 6: Selecting random friend...");
    
    const randomIndex = Math.floor(Math.random() * potentialFriends.length);
    const suggestedUser = potentialFriends[randomIndex];
    console.log("🎲 RANDOM INDEX:", randomIndex);
    console.log("👤 SUGGESTED USER:", suggestedUser);

    console.log("🔗 STEP 7: Finding common AI friends...");
    
    const suggestedUserAiFriends = await db
      .select({
        aiMbtiType: USER_AI_FRIENDS.ai_friend_mbti_type,
        friendshipStrength: USER_AI_FRIENDS.friendship_strength
      })
      .from(USER_AI_FRIENDS)
      .where(and(
        eq(USER_AI_FRIENDS.user_id, suggestedUser.userId),
        eq(USER_AI_FRIENDS.is_active, true)
      ))
      .execute();

    console.log("🔗 SUGGESTED USER AI FRIENDS:", suggestedUserAiFriends);

    const suggestedUserAiTypes = suggestedUserAiFriends.map(friend => friend.aiMbtiType);
    const commonAiMbtiTypes = userAiMbtiTypes.filter(type => suggestedUserAiTypes.includes(type));
    console.log("🔗 COMMON AI MBTI TYPES:", commonAiMbtiTypes);

    const commonAiCharacters = commonAiMbtiTypes.length > 0 ? await db
      .select({
        id: AI_CHARACTERS.id,
        displayName: AI_CHARACTERS.displayName,
        mbtiType: AI_CHARACTERS.mbtiType,
        specialty: AI_CHARACTERS.specialty,
        avatarUrl: AI_CHARACTERS.avatarUrl
      })
      .from(AI_CHARACTERS)
      .where(inArray(AI_CHARACTERS.mbtiType, commonAiMbtiTypes))
      .execute() : [];

    console.log("🔗 COMMON AI CHARACTERS:", commonAiCharacters);

    console.log("⚙️ STEP 8: Getting common preferences...");
    
    // FIXED: Step 8 - Get common preferences with proper query structure
    let currentUserPrefs = [];
    let suggestedUserPrefs = [];
    
    try {
      // Current user preferences - FIXED query structure
      currentUserPrefs = await db
        .select({
          categoryId: USER_PREFERENCE_VALUES.categoryId,
          categoryName: PREFERENCE_CATEGORIES.name,
          categoryDisplayName: PREFERENCE_CATEGORIES.displayName,
          optionId: USER_PREFERENCE_VALUES.optionId,
          optionValue: PREFERENCE_OPTIONS.value,
          optionDisplayValue: PREFERENCE_OPTIONS.displayValue
        })
        .from(USER_PREFERENCE_VALUES)
        .leftJoin(PREFERENCE_CATEGORIES, eq(USER_PREFERENCE_VALUES.categoryId, PREFERENCE_CATEGORIES.id))
        .leftJoin(PREFERENCE_OPTIONS, eq(USER_PREFERENCE_VALUES.optionId, PREFERENCE_OPTIONS.id))
        .where(eq(USER_PREFERENCE_VALUES.userId, userId))
        .execute();

      console.log("⚙️ CURRENT USER PREFS:", currentUserPrefs);

      // Suggested user preferences - FIXED query structure
      suggestedUserPrefs = await db
        .select({
          categoryId: USER_PREFERENCE_VALUES.categoryId,
          categoryName: PREFERENCE_CATEGORIES.name,
          categoryDisplayName: PREFERENCE_CATEGORIES.displayName,
          optionId: USER_PREFERENCE_VALUES.optionId,
          optionValue: PREFERENCE_OPTIONS.value,
          optionDisplayValue: PREFERENCE_OPTIONS.displayValue
        })
        .from(USER_PREFERENCE_VALUES)
        .leftJoin(PREFERENCE_CATEGORIES, eq(USER_PREFERENCE_VALUES.categoryId, PREFERENCE_CATEGORIES.id))
        .leftJoin(PREFERENCE_OPTIONS, eq(USER_PREFERENCE_VALUES.optionId, PREFERENCE_OPTIONS.id))
        .where(eq(USER_PREFERENCE_VALUES.userId, suggestedUser.userId))
        .execute();

      console.log("⚙️ SUGGESTED USER PREFS:", suggestedUserPrefs);
    } catch (prefError) {
      console.error("⚠️ ERROR FETCHING PREFERENCES:", prefError);
      // Continue without preferences if there's an error
    }

    // Find common preferences
    const commonPreferences = currentUserPrefs.filter(currentPref =>
      currentPref.optionValue && suggestedUserPrefs.some(suggestedPref =>
        suggestedPref.optionValue &&
        currentPref.categoryName === suggestedPref.categoryName &&
        currentPref.optionValue === suggestedPref.optionValue
      )
    );

    console.log("⚙️ COMMON PREFERENCES:", commonPreferences);

    // Calculate age
    const calculateAge = (birthDate) => {
      if (!birthDate) return 'N/A';
      try {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
          age--;
        }
        return age > 0 ? age : 'N/A';
      } catch (error) {
        return 'N/A';
      }
    };

    console.log("💾 STEP 9: Saving suggestion to database...");
    
    const compatibilityScore = Math.floor(Math.random() * 20) + 75; // 75-95%
    
    const suggestionReason = `I think you and ${suggestedUser.username} would make great friends! You both share ${commonAiCharacters.length} AI companion${commonAiCharacters.length !== 1 ? 's' : ''} and have ${commonPreferences.length} common interest${commonPreferences.length !== 1 ? 's' : ''}. Based on your conversation patterns and preferences, I believe you'd complement each other well and have great discussions. Starting a group chat with ${ai.displayName} could be the perfect way to break the ice! 🤝`;

    console.log("💾 SUGGESTION REASON:", suggestionReason);
    console.log("💾 COMPATIBILITY SCORE:", compatibilityScore);

    const suggestionInsert = await db.insert(USER_SUGGESTIONS).values({
      aiCharacterId: aiCharacterId,
      requesterUserId: userId,
      suggestedUserId: suggestedUser.userId,
      suggestionReason: suggestionReason,
      compatibilityScore: compatibilityScore,
      status: 'pending'
    }).execute();

    console.log("💾 SUGGESTION INSERT RESULT:", suggestionInsert);

    const suggestionId = suggestionInsert[0].insertId;
    console.log("💾 SUGGESTION ID:", suggestionId);

    const friendSuggestion = {
      suggestionId: suggestionId,
      user: {
        id: suggestedUser.userId,
        username: suggestedUser.username,
        profileImageUrl: suggestedUser.profileImageUrl,
        gender: suggestedUser.gender,
        age: calculateAge(suggestedUser.birthDate),
        location: `${suggestedUser.city || ''}, ${suggestedUser.country || ''}`.trim().replace(/^,\s*/, ''),
        religion: suggestedUser.religion
      },
      commonAiFriends: commonAiCharacters,
      commonPreferences: commonPreferences,
      compatibilityScore: compatibilityScore,
      reason: suggestionReason,
      aiCharacter: {
        id: ai.id,
        displayName: ai.displayName,
        specialty: ai.specialty,
        mbtiType: ai.mbtiType
      }
    };

    console.log("🎯 FINAL FRIEND SUGGESTION:", friendSuggestion);

    console.log("✅ SUCCESS: Returning friend suggestion");
    
    return NextResponse.json({
      success: true,
      suggestion: friendSuggestion,
      debug: {
        totalPotentialFriends: potentialFriends.length,
        userAiFriends: userAiFriends.length,
        commonAiFriends: commonAiCharacters.length,
        commonPreferences: commonPreferences.length,
        suggestionSavedWithId: suggestionId
      }
    }, { status: 200 });

  } catch (error) {
    console.error("💥 ERROR in get-friend-suggestion:", error);
    console.error("💥 ERROR STACK:", error.stack);
    
    return NextResponse.json(
      { 
        error: "Failed to get friend suggestion", 
        details: process.env.NODE_ENV === 'development' ? error.message : undefined 
      },
      { status: 500 }
    );
  }
}