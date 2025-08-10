// app/api/user/subscription-info/route.js
import { db } from "@/utils";
import { USER, USER_SUBSCRIPTIONS, SUBSCRIPTION_PLANS } from "@/utils/schema";
import { NextResponse } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import { authenticate } from "@/lib/jwtMiddleware";

export async function GET(req) {
  // Authenticate user
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;

  try {
    // Get user's current plan
    const user = await db
      .select({
        id: USER.id,
        currentPlan: USER.currentPlan,
        subscriptionStatus: USER.subscriptionStatus,
        subscriptionEnds: USER.subscriptionEnds,
      })
      .from(USER)
      .where(eq(USER.id, userId))
      .limit(1)
      .execute();

    if (user.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const currentUser = user[0];

    // Get current subscription details
    let currentSubscription = null;
    if (currentUser.currentPlan && currentUser.currentPlan !== "free") {
      const subscription = await db
        .select({
          id: USER_SUBSCRIPTIONS.id,
          planId: USER_SUBSCRIPTIONS.planId,
          status: USER_SUBSCRIPTIONS.status,
          startDate: USER_SUBSCRIPTIONS.startDate,
          endDate: USER_SUBSCRIPTIONS.endDate,
          autoRenew: USER_SUBSCRIPTIONS.autoRenew,
          planName: SUBSCRIPTION_PLANS.planName,
          displayName: SUBSCRIPTION_PLANS.displayName,
          price: SUBSCRIPTION_PLANS.price,
          billingPeriod: SUBSCRIPTION_PLANS.billingPeriod,
        })
        .from(USER_SUBSCRIPTIONS)
        .innerJoin(
          SUBSCRIPTION_PLANS,
          eq(USER_SUBSCRIPTIONS.planId, SUBSCRIPTION_PLANS.id)
        )
        .where(
          and(
            eq(USER_SUBSCRIPTIONS.userId, userId),
            eq(USER_SUBSCRIPTIONS.status, "active")
          )
        )
        .orderBy(desc(USER_SUBSCRIPTIONS.startDate))
        .limit(1)
        .execute();

      if (subscription.length > 0) {
        currentSubscription = subscription[0];
      }
    }

    // Get all available plans
    const availablePlans = await db
      .select()
      .from(SUBSCRIPTION_PLANS)
      .where(eq(SUBSCRIPTION_PLANS.isActive, true))
      .orderBy(SUBSCRIPTION_PLANS.planName, SUBSCRIPTION_PLANS.billingPeriod)
      .execute();

    // Format current plan info
    const currentPlan = currentSubscription
      ? {
          planName: currentSubscription.planName,
          displayName: currentSubscription.displayName,
          price: currentSubscription.price,
          billingPeriod: currentSubscription.billingPeriod,
        }
      : {
          planName: "free",
          displayName: "Free Plan",
          price: 0,
          billingPeriod: "monthly",
        };

    return NextResponse.json(
      {
        success: true,
        currentPlan,
        subscription: currentSubscription,
        availablePlans,
        user: {
          subscriptionStatus: currentUser.subscriptionStatus,
          subscriptionEnds: currentUser.subscriptionEnds,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching subscription info:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching subscription information",
      },
      { status: 500 }
    );
  }
}
