import { db } from "@/utils";
import { QUIZ_SEQUENCES, USER_AI_FRIENDS } from "@/utils/schema";
import { and, eq } from "drizzle-orm";

// MBTI Compatibility Matrix - Each type gets 5 compatible AI friends
const MBTI_AI_FRIENDS = {
  // Analysts (NT)
  INTJ: ["ENFP", "ENTP", "INFJ", "INFP", "ENTJ"],
  INTP: ["ENFJ", "ENTJ", "INFJ", "ENFP", "ESTJ"],
  ENTJ: ["INFP", "INTP", "ENFP", "INTJ", "ENTP"],
  ENTP: ["INFJ", "INTJ", "ENFJ", "ISFJ", "INFP"],

  // Diplomats (NF)
  INFJ: ["ENTP", "ENFP", "INTJ", "INFP", "ENFJ"],
  INFP: ["ENFJ", "ENTJ", "INTJ", "ENFP", "INFJ"],
  ENFJ: ["INFP", "INTP", "ISFP", "ENFP", "INFJ"],
  ENFP: ["INTJ", "INFJ", "ENTJ", "INFP", "ENFJ"],

  // Sentinels (SJ)
  ISTJ: ["ESTP", "ESFP", "ESTJ", "ISFJ", "ESFJ"],
  ISFJ: ["ESTP", "ESFP", "ENTP", "ESTJ", "ISTJ"],
  ESTJ: ["ISTP", "INTP", "ISFP", "ISTJ", "ESFJ"],
  ESFJ: ["ISTP", "ISFP", "ISTJ", "ESTJ", "ISFJ"],

  // Explorers (SP)
  ISTP: ["ESTJ", "ESFJ", "ESTP", "ISFP", "ESFP"],
  ISFP: ["ENFJ", "ESTJ", "ESFJ", "ISTP", "ESFP"],
  ESTP: ["ISFJ", "ISTJ", "ISTP", "ESFP", "ISFP"],
  ESFP: ["ISFJ", "ISTJ", "ISTP", "ESTP", "ISFP"],
};

// Function to create AI friends for a user based on their MBTI type
const createAIFriends = async (userId, userMbtiType) => {
  try {
    const compatibleTypes = MBTI_AI_FRIENDS[userMbtiType];

    if (!compatibleTypes || compatibleTypes.length !== 5) {
      console.error(
        `No compatible AI friends found for MBTI type: ${userMbtiType}`
      );
      return;
    }

    // Check if AI friends already exist for this user
    const existingFriends = await db
      .select()
      .from(USER_AI_FRIENDS)
      .where(eq(USER_AI_FRIENDS.user_id, userId));

    if (existingFriends.length > 0) {
      console.log(`AI friends already exist for user ${userId}`);
      return;
    }

    // Create 5 AI friends
    const aiFriendsData = compatibleTypes.map((aiMbtiType, index) => ({
      user_id: userId,
      user_mbti_type: userMbtiType,
      ai_friend_mbti_type: aiMbtiType,
      friend_index: index + 1, // 1, 2, 3, 4, 5
      friendship_strength: calculateCompatibilityScore(
        userMbtiType,
        aiMbtiType
      ),
      is_active: true,
      total_interactions: 0,
    }));

    // Insert all AI friends at once
    await db.insert(USER_AI_FRIENDS).values(aiFriendsData);

    console.log(
      `Created 5 AI friends for user ${userId} with MBTI type ${userMbtiType}`
    );
  } catch (error) {
    console.error("Error creating AI friends:", error);
    throw error;
  }
};

// Calculate compatibility score based on MBTI types (0-100)
const calculateCompatibilityScore = (userType, aiType) => {
  // Base compatibility score
  let score = 50;

  // Same type gets highest score
  if (userType === aiType) {
    return 95;
  }

  // Analyze each dimension
  const userDimensions = userType.split("");
  const aiDimensions = aiType.split("");

  // E/I - Extraversion/Introversion
  if (userDimensions[0] !== aiDimensions[0]) score += 10; // Opposites attract

  // S/N - Sensing/Intuition
  if (userDimensions[1] === aiDimensions[1]) score += 15; // Same perception style

  // T/F - Thinking/Feeling
  if (userDimensions[2] !== aiDimensions[2]) score += 10; // Balance each other

  // J/P - Judging/Perceiving
  if (userDimensions[3] !== aiDimensions[3]) score += 10; // Complement each other

  // Ensure score stays within bounds
  return Math.min(Math.max(score, 20), 100);
};

export const createSequence = async (resultDataArray, userId, quizId) => {
  // Define which questions belong to each part
  const parts = {
    firstPart: [1, 2, 3], // questionId for the first part
    secondPart: [4, 5, 6], // questionId for the second part
    thirdPart: [7, 8, 9], // questionId for the third part
    fourthPart: [10, 11, 12], // questionId for the fourth part
  };

  const letterMap = {
    1: "E",
    2: "I",
    3: "S",
    4: "N",
    5: "T",
    6: "F",
    7: "J",
    8: "P",
  };

  // Function to get analytic IDs for a given part
  const getAnalyticIds = (questions, part) => {
    return questions
      .filter((question) => part.includes(question.question_id))
      .map((question) => question.analytic_id);
  };

  const quizParts = {
    firstPart: getAnalyticIds(resultDataArray, parts.firstPart),
    secondPart: getAnalyticIds(resultDataArray, parts.secondPart),
    thirdPart: getAnalyticIds(resultDataArray, parts.thirdPart),
    fourthPart: getAnalyticIds(resultDataArray, parts.fourthPart),
  };

  const getMostFrequentLetter = (ids) => {
    const frequency = new Map();

    ids.forEach((id) => {
      const letter = letterMap[id];
      if (letter) {
        frequency.set(letter, (frequency.get(letter) || 0) + 1);
      }
    });

    let mostFrequentLetter = "";
    let maxCount = 0;

    frequency.forEach((count, letter) => {
      if (count > maxCount) {
        mostFrequentLetter = letter;
        maxCount = count;
      }
    });

    return mostFrequentLetter;
  };

  const result = {
    firstPart: getMostFrequentLetter(quizParts.firstPart),
    secondPart: getMostFrequentLetter(quizParts.secondPart),
    thirdPart: getMostFrequentLetter(quizParts.thirdPart),
    fourthPart: getMostFrequentLetter(quizParts.fourthPart),
  };

  const personalityType = `${result.firstPart}${result.secondPart}${result.thirdPart}${result.fourthPart}`;

  try {
    // Update the existing quiz sequence record
    await db
      .update(QUIZ_SEQUENCES)
      .set({
        type_sequence: personalityType,
        isCompleted: true,
      })
      .where(
        and(
          eq(QUIZ_SEQUENCES.user_id, userId),
          eq(QUIZ_SEQUENCES.quiz_id, quizId)
        )
      );

    // ✅ NEW: Create AI friends based on the determined MBTI type
    await createAIFriends(userId, personalityType);

    console.log(
      `Successfully created personality type ${personalityType} and AI friends for user ${userId}`
    );
  } catch (error) {
    console.error("Error inserting personality sequence:", error);
    throw error;
  }
};
