// app/api/user/quiz-completion-status/route.js
import { NextResponse } from "next/server";
import { authenticate } from "@/lib/jwtMiddleware";
import { 
  QUIZ_SEQUENCES,
  QUIZ_COMPLETION,
  USER
} from "@/utils/schema";
import { db } from "@/utils";
import { eq, and } from "drizzle-orm";

export async function GET(request) {
  const authResult = await authenticate(request);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId || userData.id;

  try {
    // Verify user exists
    const userExists = await db
      .select({ id: USER.id })
      .from(USER)
      .where(eq(USER.id, userId))
      .limit(1)
      .execute();

    if (userExists.length === 0) {
      return NextResponse.json(
        { error: "User not found. Please log in again." },
        { status: 404 }
      );
    }

    // Check QUIZ_SEQUENCES for personality test (quiz_id: 1)
    const personalitySequences = await db
      .select({
        quizId: QUIZ_SEQUENCES.quiz_id,
        isCompleted: QUIZ_SEQUENCES.isCompleted,
        isStarted: QUIZ_SEQUENCES.isStarted,
        typeSequence: QUIZ_SEQUENCES.type_sequence
      })
      .from(QUIZ_SEQUENCES)
      .where(and(
        eq(QUIZ_SEQUENCES.user_id, userId),
        eq(QUIZ_SEQUENCES.quiz_id, 1) // Personality test
      ))
      .execute();

    // Check QUIZ_COMPLETION for compatibility test (test_id: 2)
    const compatibilityCompletions = await db
      .select({
        testId: QUIZ_COMPLETION.test_id,
        completed: QUIZ_COMPLETION.completed,
        isStarted: QUIZ_COMPLETION.isStarted,
        completionTimestamp: QUIZ_COMPLETION.completion_timestamp
      })
      .from(QUIZ_COMPLETION)
      .where(and(
        eq(QUIZ_COMPLETION.user_id, userId),
        eq(QUIZ_COMPLETION.test_id, 2) // Compatibility test
      ))
      .execute();

    console.log("Personality sequences for user:", userId, personalitySequences);
    console.log("Compatibility completions for user:", userId, compatibilityCompletions);

    // Check personality test completion (from quiz_sequences table)
    const personalityCompleted = personalitySequences.some(seq => 
      seq.isCompleted === true || seq.isCompleted === 1
    );
    const personalityStarted = personalitySequences.some(seq => 
      seq.isStarted === true || seq.isStarted === 1
    );

    // Check compatibility test completion (from quiz_completion table)
    const compatibilityCompleted = compatibilityCompletions.some(comp => 
      comp.completed === 'yes' || comp.completed === 1 || comp.completed === true
    );
    const compatibilityStarted = compatibilityCompletions.some(comp => 
      comp.isStarted === true || comp.isStarted === 1
    );

    // Both quizzes completed
    const bothQuizzesCompleted = personalityCompleted && compatibilityCompleted;
    const canAccessChats = bothQuizzesCompleted;

    // Determine what the user needs to do next
    let nextStep = null;
    let nextStepUrl = null;

    if (!personalityCompleted) {
      nextStep = "Complete your personality assessment to get started";
      nextStepUrl = "/tests";
    } else if (!compatibilityCompleted) {
      nextStep = "Complete your compatibility preferences to find matches";
      nextStepUrl = "/compatability-quiz";
    } else {
      nextStep = "All assessments completed! You can now access chats and find friends";
      nextStepUrl = "/ai-chat";
    }

    console.log("Final status for user:", userId, {
      personalityCompleted,
      compatibilityCompleted,
      bothQuizzesCompleted,
      canAccessChats
    });

    return NextResponse.json({
      success: true,
      canAccessChats: canAccessChats,
      quizStatus: {
        personalityTest: {
          completed: personalityCompleted,
          started: personalityStarted,
          foundInDatabase: personalitySequences.length > 0
        },
        compatibilityTest: {
          completed: compatibilityCompleted,
          started: compatibilityStarted,
          foundInDatabase: compatibilityCompletions.length > 0
        },
        bothCompleted: bothQuizzesCompleted
      },
      nextStep: {
        message: nextStep,
        url: nextStepUrl
      },
      completionPercentage: ((personalityCompleted ? 50 : 0) + (compatibilityCompleted ? 50 : 0)),
      debug: {
        personalitySequencesFound: personalitySequences.length,
        compatibilityCompletionsFound: compatibilityCompletions.length,
        userId: userId,
        personalityData: personalitySequences,
        compatibilityData: compatibilityCompletions
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error checking quiz completion status:", error);
    return NextResponse.json(
      { 
        error: "Failed to check quiz completion status",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}