import { authenticate } from "@/lib/jwtMiddleware";
import { db } from "@/utils";
import {
  PREFERENCE_CATEGORIES,
  PREFERENCE_OPTIONS,
  USER,
  USER_PREFERENCES
} from "@/utils/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET: Fetch all user preferences
export async function GET(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;

  try {
    // Fetch user's preferences with category and option details
    const userPreferences = await db
      .select({
        id: USER_PREFERENCES.id,
        categoryId: PREFERENCE_CATEGORIES.id,
        categoryName: PREFERENCE_CATEGORIES.name,
        displayName: PREFERENCE_CATEGORIES.display_name,
        optionId: PREFERENCE_OPTIONS.id,
        optionValue: PREFERENCE_OPTIONS.value,
        displayValue: PREFERENCE_OPTIONS.display_value,
      })
      .from(USER_PREFERENCES)
      .innerJoin(
        PREFERENCE_CATEGORIES,
        eq(USER_PREFERENCES.category_id, PREFERENCE_CATEGORIES.id)
      )
      .innerJoin(
        PREFERENCE_OPTIONS,
        eq(USER_PREFERENCES.option_id, PREFERENCE_OPTIONS.id)
      )
      .where(eq(USER_PREFERENCES.user_id, userId))
      .execute();

    // Fetch categories and options for those that haven't been set yet
    const allCategories = await db
      .select()
      .from(PREFERENCE_CATEGORIES)
      .where(eq(PREFERENCE_CATEGORIES.is_active, true))
      .execute();

    const allOptions = await db
      .select()
      .from(PREFERENCE_OPTIONS)
      .where(eq(PREFERENCE_OPTIONS.is_active, true))
      .execute();

    // Group options by category
    const optionsByCategory = allOptions.reduce((acc, option) => {
      if (!acc[option.category_id]) {
        acc[option.category_id] = [];
      }
      acc[option.category_id].push(option);
      return acc;
    }, {});

    return NextResponse.json(
      {
        userPreferences,
        categories: allCategories,
        optionsByCategory,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return NextResponse.json(
      { message: "Error fetching user preferences" },
      { status: 500 }
    );
  }
}

// POST: Save or update a user preference
export async function POST(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;
  const { categoryId, optionId } = await req.json();

  if (!categoryId || !optionId) {
    return NextResponse.json(
      { message: "Category ID and Option ID are required" },
      { status: 400 }
    );
  }

  try {
    // Check if preference already exists
    const existingPref = await db
      .select()
      .from(USER_PREFERENCES)
      .where(
        and(
          eq(USER_PREFERENCES.user_id, userId),
          eq(USER_PREFERENCES.category_id, categoryId)
        )
      )
      .execute();

    if (existingPref.length > 0) {
      // Update existing preference
      await db
        .update(USER_PREFERENCES)
        .set({
          option_id: optionId,
          updated_at: new Date(),
        })
        .where(eq(USER_PREFERENCES.id, existingPref[0].id))
        .execute();
    } else {
      // Insert new preference
      await db
        .insert(USER_PREFERENCES)
        .values({
          user_id: userId,
          category_id: categoryId,
          option_id: optionId,
        })
        .execute();
    }

    // Check if we should update the user.profile_complete status
    await updateProfileCompleteStatus(userId);

    return NextResponse.json(
      { message: "Preference saved successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving preference:", error);
    return NextResponse.json(
      { message: "Error saving preference" },
      { status: 500 }
    );
  }
}

// Helper function to check if profile is complete and update status
async function updateProfileCompleteStatus(userId) {
  try {
    // Get required preference categories
    const requiredCategories = await db
      .select()
      .from(PREFERENCE_CATEGORIES)
      .where(eq(PREFERENCE_CATEGORIES.is_active, true))
      .execute();
    
    // Get user's completed preferences
    const userPreferences = await db
      .select()
      .from(USER_PREFERENCES)
      .where(eq(USER_PREFERENCES.user_id, userId))
      .execute();
    
    // Get user from USER table
    const user = await db
      .select()
      .from(USER)
      .where(eq(USER.id, userId))
      .limit(1)
      .execute();
    
    if (user.length === 0) return;
    
    // Check if all required fields are filled
    const allRequired = requiredCategories.every((category) => 
      userPreferences.some((pref) => pref.category_id === category.id)
    );
    
    // Update user profile_complete status if needed
    if (allRequired && !user[0].isProfileComplete) {
      await db
        .update(USER)
        .set({ isProfileComplete: true })
        .where(eq(USER.id, userId))
        .execute();
    } else if (!allRequired && user[0].isProfileComplete) {
      await db
        .update(USER)
        .set({ isProfileComplete: false })
        .where(eq(USER.id, userId))
        .execute();
    }
  } catch (error) {
    console.error("Error updating profile complete status:", error);
  }
}