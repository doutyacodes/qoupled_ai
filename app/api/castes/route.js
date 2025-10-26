///api/castes/route.js

import { NextResponse } from 'next/server';
import { db } from '@/utils';
import { CASTES_OR_DENOMINATIONS, RELIGIONS } from '@/utils/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const religionName = searchParams.get('religion');

    if (!religionName) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Religion parameter is required' 
        },
        { status: 400 }
      );
    }

    // First find the religion by name
    const religion = await db
      .select({
        id: RELIGIONS.id
      })
      .from(RELIGIONS)
      .where(eq(RELIGIONS.name, religionName))
      .limit(1);

    if (!religion || religion.length === 0) {
      return NextResponse.json({
        success: true,
        data: [] // Return empty if religion not found
      });
    }

    const religionId = religion[0].id;

    // Fetch castes for this religion
    const castes = await db
      .select({
        id: CASTES_OR_DENOMINATIONS.id,
        name: CASTES_OR_DENOMINATIONS.name
      })
      .from(CASTES_OR_DENOMINATIONS)
      .where(
        and(
          eq(CASTES_OR_DENOMINATIONS.religion_id, religionId),
          eq(CASTES_OR_DENOMINATIONS.is_approved, true)
        )
      )
      .orderBy(CASTES_OR_DENOMINATIONS.name);

    return NextResponse.json({
      success: true,
      data: castes
    });
  } catch (error) {
    console.error('Error fetching castes:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch castes',
        error: error.message 
      },
      { status: 500 }
    );
  }
}