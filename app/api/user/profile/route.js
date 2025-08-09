// app/api/user/profile/route.js
import { db } from '@/utils';
import { USER } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';

export async function GET(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;

  try {
    const user = await db
      .select({
        id: USER.id,
        username: USER.username,
        currentPlan: USER.currentPlan,
        subscriptionStatus: USER.subscriptionStatus,
        subscriptionEnds: USER.subscriptionEnds,
        isVerified: USER.isVerified,
        profileBoostActive: USER.profileBoostActive,
        profileBoostEnds: USER.profileBoostEnds
      })
      .from(USER)
      .where(eq(USER.id, userId))
      .limit(1)
      .execute();

    if (user.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: user[0]
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch user profile'
    }, { status: 500 });
  }
}