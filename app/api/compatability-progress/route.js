import { db } from "@/utils";
import { QUIZ_COMPLETION, TEST_PROGRESS, USER_RED_FLAGS } from "@/utils/schema";
import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { authenticate } from "@/lib/jwtMiddleware";

export async function POST(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;
  const data = await req.json();
  const { questionId, optionId, points } = data;
  console.log(questionId, optionId, points);

  const testId = 2;
  try {
    // Check for existing records to avoid duplicates
    const existingRecords = await db
      .select()
      .from(TEST_PROGRESS)
      .where(
        and(
          eq(TEST_PROGRESS.user_id, userId),
          eq(TEST_PROGRESS.question_id, questionId)
        )
      )
      .execute();

    if (existingRecords.length > 0) {
      return NextResponse.json(
        { message: "Records already created for this question." },
        { status: 400 }
      );
    }

    try {
      // Insert the test progress data
      const insertData = {
        user_id: userId,
        test_id: testId,
        question_id: questionId,
        selected_answer_id: optionId,
        points_received: points,
      };

      await db.insert(TEST_PROGRESS).values(insertData);

      try {
        // Check if the record already exists in quiz completion
        const existingTask = await db
          .select()
          .from(QUIZ_COMPLETION)
          .where(eq(QUIZ_COMPLETION.user_id, userId));

        if (existingTask.length === 0) {
          // Record doesn't exist, so insert it
          await db.insert(QUIZ_COMPLETION).values({
            user_id: userId,
            isStarted: true,
            completed: "no",
            test_id: testId,
          });
          console.log("Inserted successfully");
        } else {
          console.log("Already exists, skipping insert");
        }
      } catch (error) {
        console.error("Error processing quiz sequence:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error adding progress:", error);
      throw error;
    }

    return NextResponse.json(
      { message: "Progress added successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { message: "Error processing request" },
      { status: 500 }
    );
  }
}

// New endpoint for saving red flags
export async function PUT(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;
  const { answerId } = await req.json();

  try {
    // Check if the user already has 3 red flags
    const existingRedFlags = await db
      .select()
      .from(USER_RED_FLAGS)
      .where(eq(USER_RED_FLAGS.user_id, userId))
      .execute();

    if (existingRedFlags.length >= 3) {
      return NextResponse.json(
        {
          message: "You can only select up to 3 red flags",
        },
        { status: 400 }
      );
    }

    // Check if this specific red flag already exists
    const existingSpecificFlag = await db
      .select()
      .from(USER_RED_FLAGS)
      .where(
        and(
          eq(USER_RED_FLAGS.user_id, userId),
          eq(USER_RED_FLAGS.answer_id, answerId)
        )
      )
      .execute();

    if (existingSpecificFlag.length > 0) {
      return NextResponse.json(
        {
          message: "This red flag is already selected",
        },
        { status: 400 }
      );
    }

    // Insert the red flag
    await db.insert(USER_RED_FLAGS).values({
      user_id: userId,
      answer_id: answerId,
    });

    return NextResponse.json(
      {
        message: "Red flag saved successfully",
        currentCount: existingRedFlags.length + 1,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving red flag:", error);
    return NextResponse.json(
      {
        message: "Error saving red flag",
      },
      { status: 500 }
    );
  }
}

// Endpoint to remove a red flag
export async function DELETE(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;
  const url = new URL(req.url);
  const answerId = url.searchParams.get("answerId");

  if (!answerId) {
    return NextResponse.json(
      {
        message: "Answer ID is required",
      },
      { status: 400 }
    );
  }

  try {
    // Delete the red flag
    await db
      .delete(USER_RED_FLAGS)
      .where(
        and(
          eq(USER_RED_FLAGS.user_id, userId),
          eq(USER_RED_FLAGS.answer_id, parseInt(answerId))
        )
      )
      .execute();

    // Get updated count
    const remainingRedFlags = await db
      .select()
      .from(USER_RED_FLAGS)
      .where(eq(USER_RED_FLAGS.user_id, userId))
      .execute();

    return NextResponse.json(
      {
        message: "Red flag removed successfully",
        currentCount: remainingRedFlags.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing red flag:", error);
    return NextResponse.json(
      {
        message: "Error removing red flag",
      },
      { status: 500 }
    );
  }
}

// Endpoint to get all red flags for a user
export async function GET(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;

  try {
    const userRedFlags = await db
      .select()
      .from(USER_RED_FLAGS)
      .where(eq(USER_RED_FLAGS.user_id, userId))
      .execute();

    return NextResponse.json(
      {
        redFlags: userRedFlags,
        count: userRedFlags.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching red flags:", error);
    return NextResponse.json(
      {
        message: "Error fetching red flags",
      },
      { status: 500 }
    );
  }
}
