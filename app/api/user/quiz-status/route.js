// app/api/user/quiz-status/route.js
import { NextResponse } from "next/server";
import { authenticate } from "@/lib/jwtMiddleware";
import { QUIZ_SEQUENCES, QUIZ_COMPLETION } from "@/utils/schema";
import { db } from "@/utils";
import { eq, and } from "drizzle-orm";

export async function GET(request) {
  const authResult = await authenticate(request);
  if (!authResult.authenticated) return authResult.response;

  const userId = authResult.decoded_Data.userId || authResult.decoded_Data.id;

  try {
    // --- Check Personality Test (quiz_id: 1)
    const personality = await db
      .select({
        isCompleted: QUIZ_SEQUENCES.isCompleted,
      })
      .from(QUIZ_SEQUENCES)
      .where(and(eq(QUIZ_SEQUENCES.user_id, userId), eq(QUIZ_SEQUENCES.quiz_id, 1)))
      .execute();

    const personalityCompleted = personality.some(
      (p) => p.isCompleted === true || p.isCompleted === 1
    );

    // --- Check Compatibility Test (test_id: 2)
    const compatibility = await db
      .select({
        completed: QUIZ_COMPLETION.completed,
      })
      .from(QUIZ_COMPLETION)
      .where(and(eq(QUIZ_COMPLETION.user_id, userId), eq(QUIZ_COMPLETION.test_id, 2)))
      .execute();

    const compatibilityCompleted = compatibility.some(
      (c) => c.completed === true || c.completed === 1 || c.completed === "yes"
    );

    return NextResponse.json(
      {
        success: true,
        userId,
        personalityCompleted,
        compatibilityCompleted,
        bothCompleted: personalityCompleted && compatibilityCompleted,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking quiz status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check quiz status" },
      { status: 500 }
    );
  }
}