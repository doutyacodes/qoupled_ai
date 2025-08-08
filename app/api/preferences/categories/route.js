import { db } from "@/utils";
import { 
  PREFERENCE_CATEGORIES, 
  PREFERENCE_OPTIONS
} from "@/utils/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { authenticate } from "@/lib/jwtMiddleware";

// GET: Fetch all preference categories and their options
export async function GET(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    // Fetch all active categories
    const categories = await db
      .select()
      .from(PREFERENCE_CATEGORIES)
      .where(eq(PREFERENCE_CATEGORIES.is_active, true))
      .execute();

    // Fetch all active options
    const options = await db
      .select()
      .from(PREFERENCE_OPTIONS)
      .where(eq(PREFERENCE_OPTIONS.is_active, true))
      .execute();

    // Group options by category
    const optionsByCategory = options.reduce((acc, option) => {
      if (!acc[option.category_id]) {
        acc[option.category_id] = [];
      }
      acc[option.category_id].push(option);
      return acc;
    }, {});

    return NextResponse.json(
      {
        categories,
        optionsByCategory,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching preference categories:", error);
    return NextResponse.json(
      { message: "Error fetching preference categories" },
      { status: 500 }
    );
  }
}