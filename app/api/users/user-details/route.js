import { db } from '@/utils';
import { LANGUAGES, EDUCATION_LEVELS, JOB_TITLES } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';

export async function GET(req) {
  // Authenticate user
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    // Fetch all available languages, education levels, and job titles
    const languages = await db
      .select()
      .from(LANGUAGES)
      .orderBy(LANGUAGES.title);

    const educationLevels = await db
      .select()
      .from(EDUCATION_LEVELS)
      .orderBy(EDUCATION_LEVELS.levelName);

    const jobTitles = await db
      .select()
      .from(JOB_TITLES)
      .orderBy(JOB_TITLES.title);

    return NextResponse.json({
      languages,
      educationLevels,
      jobTitles
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching common data:", error);
    return NextResponse.json({ message: 'Error fetching common data' }, { status: 500 });
  }
}