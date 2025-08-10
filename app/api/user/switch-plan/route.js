// app/api/user/switch-plan/route.js
import { db } from "@/utils";
import {
  USER,
  USER_SUBSCRIPTIONS,
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_PAYMENTS,
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
    const { newPlanId, billingCycle } = await req.json();

    if (!newPlanId) {
      return NextResponse.json(
        {
          success: false,
          message: "Plan ID is required",
        },
        { status: 400 }
      );
    }

    // Get the new plan details
    const newPlan = await db
      .select()
      .from(SUBSCRIPTION_PLANS)
      .where(
        and(
          eq(SUBSCRIPTION_PLANS.id, newPlanId),
          eq(SUBSCRIPTION_PLANS.isActive, true)
        )
      )
      .limit(1)
      .execute();

    if (newPlan.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected plan not found",
        },
        { status: 404 }
      );
    }

    const selectedPlan = newPlan[0];

    // Get current user info
    const user = await db
      .select({
        id: USER.id,
        currentPlan: USER.currentPlan,
        subscriptionStatus: USER.subscriptionStatus,
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

    // Check if switching to the same plan
    if (currentUser.currentPlan === selectedPlan.planName) {
      return NextResponse.json(
        {
          success: false,
          message: "You are already on this plan",
        },
        { status: 400 }
      );
    }

    // Determine if this is an upgrade, downgrade, or switch
    const planHierarchy = { free: 0, pro: 1, elite: 2 };
    const currentLevel = planHierarchy[currentUser.currentPlan] || 0;
    const newLevel = planHierarchy[selectedPlan.planName] || 0;

    const isUpgrade = newLevel > currentLevel;
    const isDowngrade = newLevel < currentLevel;
    const isFreeSwitch = selectedPlan.planName === "free";

    // Calculate dates
    const now = new Date();
    const endDate = new Date();

    if (selectedPlan.billingPeriod === "monthly") {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (selectedPlan.billingPeriod === "quarterly") {
      endDate.setMonth(endDate.getMonth() + 3);
    } else if (selectedPlan.billingPeriod === "annual") {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    try {
      // Start transaction
      const result = await db.transaction(async (tx) => {
        // If switching to free plan
        if (isFreeSwitch) {
          // Cancel current subscription
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

          // Update user plan
          await tx
            .update(USER)
            .set({
              currentPlan: "free",
              subscriptionStatus: "expired",
              subscriptionEnds: null,
            })
            .where(eq(USER.id, userId))
            .execute();

          return {
            planSwitched: true,
            paymentRequired: false,
            message: "Successfully switched to Free plan",
          };
        }

        // For paid plans, create new subscription
        const newSubscription = await tx
          .insert(USER_SUBSCRIPTIONS)
          .values({
            userId: userId,
            planId: selectedPlan.id,
            status: "pending",
            startDate: now,
            endDate: endDate,
            autoRenew: true,
          })
          .execute();

        const subscriptionId = newSubscription[0].insertId;

        // Create payment record
        const paymentRecord = await tx
          .insert(SUBSCRIPTION_PAYMENTS)
          .values({
            userId: userId,
            subscriptionId: subscriptionId,
            amount: selectedPlan.price,
            currency: selectedPlan.currency || "INR",
            paymentMethod: "pending",
            paymentId: `temp_${Date.now()}`,
            status: "pending",
          })
          .execute();

        // For downgrades, apply immediately without payment
        if (isDowngrade) {
          // Cancel current subscription
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

          // Activate new subscription
          await tx
            .update(USER_SUBSCRIPTIONS)
            .set({
              status: "active",
              updatedAt: now,
            })
            .where(eq(USER_SUBSCRIPTIONS.id, subscriptionId))
            .execute();

          // Update payment as completed
          await tx
            .update(SUBSCRIPTION_PAYMENTS)
            .set({
              status: "completed",
              paymentMethod: "downgrade",
              paidAt: now,
            })
            .where(eq(SUBSCRIPTION_PAYMENTS.subscriptionId, subscriptionId))
            .execute();

          // Update user plan
          await tx
            .update(USER)
            .set({
              currentPlan: selectedPlan.planName,
              subscriptionStatus: "active",
              subscriptionEnds: endDate,
            })
            .where(eq(USER.id, userId))
            .execute();

          return {
            planSwitched: true,
            paymentRequired: false,
            message: `Successfully downgraded to ${selectedPlan.displayName}`,
          };
        }

        // For upgrades, require payment
        // In a real app, you'd integrate with Razorpay/Stripe here
        const paymentUrl = `/payment/process?subscriptionId=${subscriptionId}&amount=${selectedPlan.price}`;

        return {
          planSwitched: false,
          paymentRequired: true,
          paymentUrl: paymentUrl,
          subscriptionId: subscriptionId,
          amount: selectedPlan.price,
          message: "Payment required to complete upgrade",
        };
      });

      return NextResponse.json(
        {
          success: true,
          ...result,
        },
        { status: 200 }
      );
    } catch (transactionError) {
      console.error("Transaction error:", transactionError);
      throw transactionError;
    }
  } catch (error) {
    console.error("Error switching plan:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error switching plan. Please try again.",
      },
      { status: 500 }
    );
  }
}
