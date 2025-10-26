import { NextResponse } from "next/server";
import { authenticate } from "@/lib/jwtMiddleware";
import { USER, RELIGIONS, CASTES_OR_DENOMINATIONS, USER_IMAGES } from "@/utils/schema";
import { db } from "@/utils";
import { and, eq } from "drizzle-orm";

export async function GET(request) {
  const authResult = await authenticate(request);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId || userData.id;

  try {
    // Get user details + joined religion, caste, and profile image
    const users = await db
      .select({
        id: USER.id,
        username: USER.username,
        name: USER.username, // Using username as display name
        birthDate: USER.birthDate,
        gender: USER.gender,
        phone: USER.phone,
        email: USER.email,
        country: USER.country,
        state: USER.state,
        city: USER.city,
        religion: RELIGIONS.name,
        caste: CASTES_OR_DENOMINATIONS.name,
        profileImageUrl: USER_IMAGES.image_url,
        height: USER.height,
        weight: USER.weight,
        income: USER.income,
        isProfileVerified: USER.isProfileVerified,
        isProfileComplete: USER.isProfileComplete,
        currentPlan: USER.currentPlan,
        isVerified: USER.isVerified,
        subscriptionStatus: USER.subscriptionStatus,
      })
      .from(USER)
      .leftJoin(RELIGIONS, eq(USER.religion_id, RELIGIONS.id))
      .leftJoin(CASTES_OR_DENOMINATIONS, eq(USER.caste_id, CASTES_OR_DENOMINATIONS.id))
      .leftJoin(USER_IMAGES, and(
        eq(USER_IMAGES.user_id, USER.id),
        eq(USER_IMAGES.is_profile, true)
      ))
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

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          name: user.username,
          birthDate: user.birthDate,
          gender: user.gender,
          phone: user.phone,
          email: user.email,
          profileImageUrl: user.profileImageUrl || null,
          location:
            user.city && user.state && user.country
              ? `${user.city}, ${user.state}, ${user.country}`
              : user.country || "Location not set",
          religion: user.religion || "Not specified",
          caste: user.caste || "Not specified",
          height: user.height,
          weight: user.weight,
          income: user.income,
          isProfileVerified: user.isProfileVerified,
          isProfileComplete: user.isProfileComplete,
          currentPlan: user.currentPlan,
          isVerified: user.isVerified,
          subscriptionStatus: user.subscriptionStatus,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user details:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch user details",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
