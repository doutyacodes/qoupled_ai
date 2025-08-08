import { db } from '@/utils';
import { JOB_TITLES } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';

export async function GET(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    const jobTitles = await db
      .select({
        id: JOB_TITLES.id,
        title: JOB_TITLES.title,
      })
      .from(JOB_TITLES)
      .orderBy(JOB_TITLES.title);

    return NextResponse.json(
      { success: true, jobTitles },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching job titles:", error);
    return NextResponse.json(
      { success: false, message: 'Error fetching job titles' },
      { status: 500 }
    );
  }
}