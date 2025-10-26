///api/religions/route.js

import { NextResponse } from 'next/server';
import { RELIGIONS } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import { db } from '@/utils';

export async function GET() {
  try {
    const religions = await db
      .select({
        id: RELIGIONS.id,
        name: RELIGIONS.name
      })
      .from(RELIGIONS)
      .where(eq(RELIGIONS.is_approved, true))
      .orderBy(RELIGIONS.name);

    return NextResponse.json({
      success: true,
      data: religions
    });
  } catch (error) {
    console.error('Error fetching religions:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch religions',
        error: error.message 
      },
      { status: 500 }
    );
  }
}