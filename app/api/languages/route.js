import { db } from '@/utils';
import { LANGUAGES } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';

export async function GET(req) {
  // Authenticate user
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    // Fetch all available languages
    const languages = await db
      .select()
      .from(LANGUAGES)
      .orderBy(LANGUAGES.title);

    return NextResponse.json(languages, { status: 200 });
  } catch (error) {
    console.error("Error fetching languages:", error);
    return NextResponse.json({ message: 'Error fetching languages' }, { status: 500 });
  }
}