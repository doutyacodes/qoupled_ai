import { db } from '@/utils';
import { LANGUAGES } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';

export async function GET(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    const languages = await db
      .select({
        id: LANGUAGES.id,
        title: LANGUAGES.title,
      })
      .from(LANGUAGES)
      .orderBy(LANGUAGES.title);

    return NextResponse.json(
      { success: true, languages },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching languages:", error);
    return NextResponse.json(
      { success: false, message: 'Error fetching languages' },
      { status: 500 }
    );
  }
}