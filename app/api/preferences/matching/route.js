import { db } from "@/utils";
import { 
  PREFERENCE_CATEGORIES, 
  PREFERENCE_OPTIONS, 
  USER_MATCHING_PREFERENCES,
  USER_MATCHING_MULTI_PREFERENCES
} from "@/utils/schema";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { authenticate } from "@/lib/jwtMiddleware";

// GET: Fetch user's matching preferences
export async function GET(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;

  try {
    // Fetch user's single-selection matching preferences
    const singlePreferences = await db
      .select({
        id: USER_MATCHING_PREFERENCES.id,
        categoryId: USER_MATCHING_PREFERENCES.category_id,
        importance: USER_MATCHING_PREFERENCES.importance
      })
      .from(USER_MATCHING_PREFERENCES)
      .where(eq(USER_MATCHING_PREFERENCES.user_id, userId))
      .execute();

    // Fetch user's multi-selection matching preferences
    const multiPreferences = await db
      .select({
        id: USER_MATCHING_MULTI_PREFERENCES.id,
        categoryId: USER_MATCHING_MULTI_PREFERENCES.category_id,
        optionId: USER_MATCHING_MULTI_PREFERENCES.option_id,
        importance: USER_MATCHING_MULTI_PREFERENCES.importance
      })
      .from(USER_MATCHING_MULTI_PREFERENCES)
      .where(eq(USER_MATCHING_MULTI_PREFERENCES.user_id, userId))
      .execute();

    // Group multi preferences by category
    const groupedMultiPrefs = multiPreferences.reduce((acc, pref) => {
      if (!acc[pref.categoryId]) {
        acc[pref.categoryId] = {
          categoryId: pref.categoryId,
          optionIds: [],
          importance: pref.importance
        };
      }
      acc[pref.categoryId].optionIds.push(pref.optionId);
      return acc;
    }, {});

    // Combine single and multi preferences
    const allPreferences = [
      ...singlePreferences.map(pref => ({
        categoryId: pref.categoryId,
        optionIds: [],
        importance: pref.importance
      })),
      ...Object.values(groupedMultiPrefs)
    ];

    return NextResponse.json(
      { matchingPreferences: allPreferences },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching matching preferences:", error);
    return NextResponse.json(
      { message: "Error fetching matching preferences" },
      { status: 500 }
    );
  }
}

// POST: Save or update matching preferences
export async function POST(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;
  const { categoryId, optionIds, importance } = await req.json();

  if (!categoryId || !importance) {
    return NextResponse.json(
      { message: "Category ID and importance are required" },
      { status: 400 }
    );
  }

  try {
    // Determine if this is a multi-selection or single-selection preference
    const isMultiSelection = Array.isArray(optionIds) && optionIds.length > 0;

    if (isMultiSelection) {
      // Handle multi-selection preference
      
      // First, delete any existing preferences for this category
      await db
        .delete(USER_MATCHING_MULTI_PREFERENCES)
        .where(
          and(
            eq(USER_MATCHING_MULTI_PREFERENCES.user_id, userId),
            eq(USER_MATCHING_MULTI_PREFERENCES.category_id, categoryId)
          )
        )
        .execute();
      
      // Then insert new preferences
      for (const optionId of optionIds) {
        await db
          .insert(USER_MATCHING_MULTI_PREFERENCES)
          .values({
            user_id: userId,
            category_id: categoryId,
            option_id: optionId,
            importance: importance
          })
          .execute();
      }
    } else {
      // Handle single-selection preference
      
      // Check if preference already exists
      const existingPref = await db
        .select()
        .from(USER_MATCHING_PREFERENCES)
        .where(
          and(
            eq(USER_MATCHING_PREFERENCES.user_id, userId),
            eq(USER_MATCHING_PREFERENCES.category_id, categoryId)
          )
        )
        .execute();

      if (existingPref.length > 0) {
        // Update existing preference
        await db
          .update(USER_MATCHING_PREFERENCES)
          .set({
            importance: importance,
            updated_at: new Date()
          })
          .where(eq(USER_MATCHING_PREFERENCES.id, existingPref[0].id))
          .execute();
      } else {
        // Insert new preference
        await db
          .insert(USER_MATCHING_PREFERENCES)
          .values({
            user_id: userId,
            category_id: categoryId,
            importance: importance
          })
          .execute();
      }
    }

    return NextResponse.json(
      { message: "Matching preferences saved successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving matching preferences:", error);
    return NextResponse.json(
      { message: "Error saving matching preferences" },
      { status: 500 }
    );
  }
}