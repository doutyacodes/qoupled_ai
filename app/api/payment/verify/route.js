import Razorpay from "razorpay";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { authenticate } from "@/lib/jwtMiddleware";
import { db } from "@/utils";
import {
  USER,
  SUBSCRIPTION_PLANS,
  USER_SUBSCRIPTIONS,
  SUBSCRIPTION_PAYMENTS,
} from "@/utils/schema";
import { eq, and } from "drizzle-orm";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request) {
  try {
    // Verify JWT token
    const authResult = await authenticate(request);
    if (!authResult.authenticated) {
      return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
      billingCycle = "quarterly",
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Missing payment verification parameters" },
        { status: 400 }
      );
    }

    // Verify payment signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return NextResponse.json(
        { success: false, message: "Payment verification failed" },
        { status: 400 }
      );
    }

    // Get plan details
    const plan = await db
      .select()
      .from(SUBSCRIPTION_PLANS)
      .where(eq(SUBSCRIPTION_PLANS.id, planId))
      .limit(1);

    if (plan.length === 0) {
      return NextResponse.json(
        { success: false, message: "Plan not found" },
        { status: 404 }
      );
    }

    const selectedPlan = plan[0];

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();

    if (billingCycle === "quarterly") {
      endDate.setMonth(endDate.getMonth() + 3);
    } else if (billingCycle === "annual") {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1); // monthly fallback
    }

    // Start database transaction
    const result = await db.transaction(async (tx) => {
      // Cancel any existing active subscriptions
      await tx
        .update(USER_SUBSCRIPTIONS)
        .set({
          status: "cancelled",
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(USER_SUBSCRIPTIONS.userId, userId),
            eq(USER_SUBSCRIPTIONS.status, "active")
          )
        );

      const subscriptionResult = await tx.insert(USER_SUBSCRIPTIONS).values({
        userId,
        planId,
        status: "active",
        startDate,
        endDate,
        autoRenew: true,
      });

      console.log("Insert result:", subscriptionResult); // debug

      const subscriptionId = subscriptionResult[0].insertId;
      if (!subscriptionId) {
        throw new Error("Failed to get subscriptionId after insert");
      }

      // Record payment
      await tx.insert(SUBSCRIPTION_PAYMENTS).values({
        userId: userId,
        subscriptionId: subscriptionId,
        amount: selectedPlan.price,
        currency: selectedPlan.currency || "INR",
        paymentMethod: "razorpay",
        paymentId: razorpay_payment_id,
        status: "completed",
        paidAt: new Date(),
      });

      // Update user's current plan
      await tx
        .update(USER)
        .set({
          currentPlan: selectedPlan.planName,
          subscriptionStatus: "active",
          subscriptionEnds: endDate,
        })
        .where(eq(USER.id, userId));

      return {
        id: subscriptionId,
        planId: planId,
        status: "active",
        startDate,
        endDate,
      };
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified and subscription activated successfully",
      subscription: result,
      planName: selectedPlan.planName,
      endDate: endDate.toISOString(),
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { success: false, message: "Payment verification failed" },
      { status: 500 }
    );
  }
}
