// app/api/users/user-details/route.js
import { db } from '@/utils';
import { LANGUAGES, EDUCATION_LEVELS, JOB_TITLES } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';
import { asc } from 'drizzle-orm';

export async function GET(req) {
  // Authenticate user
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    // Fetch all available languages
    const languagesResult = await db
      .select({
        id: LANGUAGES.id,
        title: LANGUAGES.title,
        name: LANGUAGES.title // Add name field to match frontend expectations
      })
      .from(LANGUAGES)
      .orderBy(asc(LANGUAGES.title));

    // Fetch all available education levels
    const educationLevelsResult = await db
      .select({
        id: EDUCATION_LEVELS.id,
        levelName: EDUCATION_LEVELS.levelName
      })
      .from(EDUCATION_LEVELS)
      .orderBy(asc(EDUCATION_LEVELS.levelName));

    // Fetch all available job titles
    const jobTitlesResult = await db
      .select({
        id: JOB_TITLES.id,
        title: JOB_TITLES.title
      })
      .from(JOB_TITLES)
      .orderBy(asc(JOB_TITLES.title));

    return NextResponse.json({
      success: true,
      languages: languagesResult || [],
      educationLevels: educationLevelsResult || [],
      jobTitles: jobTitlesResult || []
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching common data:", error);
    return NextResponse.json({ 
      success: false,
      message: 'Error fetching common data',
      error: error.message,
      languages: [],
      educationLevels: [],
      jobTitles: []
    }, { status: 500 });
  }
}