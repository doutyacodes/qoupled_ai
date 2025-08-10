// app/api/user/cancel-subscription/route.js
import { db } from "@/utils";
import { USER, USER_SUBSCRIPTIONS } from "@/utils/schema";
import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { authenticate } from "@/lib/jwtMiddleware";

export async function POST(req) {
  // Authenticate user
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;

  try {
    const { reason, feedback } = await req.json();

    // Get current subscription
    const currentSubscription = await db
      .select()
      .from(USER_SUBSCRIPTIONS)
      .where(
        and(
          eq(USER_SUBSCRIPTIONS.userId, userId),
          eq(USER_SUBSCRIPTIONS.status, "active")
        )
      )
      .limit(1)
      .execute();

    if (currentSubscription.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No active subscription found",
        },
        { status: 404 }
      );
    }

    const subscription = currentSubscription[0];
    const now = new Date();

    // Start transaction
    await db.transaction(async (tx) => {
      // Cancel subscription (but let it run until end date)
      await tx
        .update(USER_SUBSCRIPTIONS)
        .set({
          autoRenew: false,
          status: "cancelled",
          updatedAt: now,
        })
        .where(eq(USER_SUBSCRIPTIONS.id, subscription.id))
        .execute();

      // Don't update user plan immediately - let it expire naturally
      // User keeps benefits until subscription end date
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Subscription cancelled. You will continue to have access until your subscription expires.",
        expiresAt: subscription.endDate,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error cancelling subscription",
      },
      { status: 500 }
    );
  }
}
