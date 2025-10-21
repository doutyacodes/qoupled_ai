import { NextResponse } from "next/server";
import { authenticate } from "@/lib/jwtMiddleware";
import { USER } from "@/utils/schema";
import { db } from "@/utils";
import { eq } from "drizzle-orm";

export async function GET(request) {
  const authResult = await authenticate(request);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId || userData.id;

  try {
    // Get user details from USER table
    const users = await db
      .select({
        id: USER.id,
        username: USER.username,
        name: USER.username, // Using username as name since there's no separate name field
        birthDate: USER.birthDate,
        gender: USER.gender,
        phone: USER.phone,
        email: USER.email,
        profileImageUrl: USER.profileImageUrl,
        country: USER.country,
        state: USER.state,
        city: USER.city,
        religion: USER.religion,
        caste: USER.caste,
        height: USER.height,
        weight: USER.weight,
        income: USER.income,
        isProfileVerified: USER.isProfileVerified,
        isProfileComplete: USER.isProfileComplete,
        currentPlan: USER.currentPlan,
        isVerified: USER.isVerified,
        subscriptionStatus: USER.subscriptionStatus
      })
      .from(USER)
      .where(eq(USER.id, userId))
      .limit(1)
      .execute();

    if (users.length === 0) {
      return NextResponse.json(
        { error: "User not found. Please log in again." },
        { status: 404 }
      );
    }

    const user = users[0];

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.username, // Using username as display name
        birthDate: user.birthDate,
        gender: user.gender,
        phone: user.phone,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
        location: user.city && user.state && user.country 
          ? `${user.city}, ${user.state}, ${user.country}`
          : user.country || 'Location not set',
        religion: user.religion,
        caste: user.caste,
        height: user.height,
        weight: user.weight,
        income: user.income,
        isProfileVerified: user.isProfileVerified,
        isProfileComplete: user.isProfileComplete,
        currentPlan: user.currentPlan,
        isVerified: user.isVerified,
        subscriptionStatus: user.subscriptionStatus
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching user details:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch user details",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}