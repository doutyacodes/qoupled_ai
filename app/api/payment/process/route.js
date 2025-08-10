// app/api/payment/process/route.js
import { db } from "@/utils";
import {
  USER,
  USER_SUBSCRIPTIONS,
  SUBSCRIPTION_PAYMENTS,
  SUBSCRIPTION_PLANS,
} from "@/utils/schema";
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
    const { subscriptionId, paymentId, paymentMethod, razorpayOrderId } =
      await req.json();

    if (!subscriptionId || !paymentId) {
      return NextResponse.json(
        {
          success: false,
          message: "Subscription ID and Payment ID are required",
        },
        { status: 400 }
      );
    }

    // Verify the subscription belongs to the user
    const subscription = await db
      .select()
      .from(USER_SUBSCRIPTIONS)
      .where(
        and(
          eq(USER_SUBSCRIPTIONS.id, subscriptionId),
          eq(USER_SUBSCRIPTIONS.userId, userId),
          eq(USER_SUBSCRIPTIONS.status, "pending")
        )
      )
      .limit(1)
      .execute();

    if (subscription.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Subscription not found or already processed",
        },
        { status: 404 }
      );
    }

    const userSubscription = subscription[0];
    const now = new Date();

    // Start transaction to activate subscription
    await db.transaction(async (tx) => {
      // Cancel any existing active subscriptions
      await tx
        .update(USER_SUBSCRIPTIONS)
        .set({
          status: "cancelled",
          updatedAt: now,
        })
        .where(
          and(
            eq(USER_SUBSCRIPTIONS.userId, userId),
            eq(USER_SUBSCRIPTIONS.status, "active")
          )
        )
        .execute();

      // Activate the new subscription
      await tx
        .update(USER_SUBSCRIPTIONS)
        .set({
          status: "active",
          updatedAt: now,
        })
        .where(eq(USER_SUBSCRIPTIONS.id, subscriptionId))
        .execute();

      // Update payment record
      await tx
        .update(SUBSCRIPTION_PAYMENTS)
        .set({
          paymentId: paymentId,
          paymentMethod: paymentMethod || "razorpay",
          status: "completed",
          paidAt: now,
        })
        .where(eq(SUBSCRIPTION_PAYMENTS.subscriptionId, subscriptionId))
        .execute();

      // Get the plan info to update user
      const planInfo = await tx
        .select({
          planName: SUBSCRIPTION_PLANS.planName,
        })
        .from(SUBSCRIPTION_PLANS)
        .where(eq(SUBSCRIPTION_PLANS.id, userSubscription.planId))
        .limit(1)
        .execute();

      if (planInfo.length > 0) {
        // Update user's current plan
        await tx
          .update(USER)
          .set({
            currentPlan: planInfo[0].planName,
            subscriptionStatus: "active",
            subscriptionEnds: userSubscription.endDate,
          })
          .where(eq(USER.id, userId))
          .execute();
      }
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Payment processed successfully! Your subscription is now active.",
        subscription: {
          id: subscriptionId,
          status: "active",
          startDate: userSubscription.startDate,
          endDate: userSubscription.endDate,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing payment:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error processing payment. Please contact support.",
      },
      { status: 500 }
    );
  }
}
