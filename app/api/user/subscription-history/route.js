// app/api/user/subscription-history/route.js
import { db } from "@/utils";
import {
  USER_SUBSCRIPTIONS,
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_PAYMENTS,
} from "@/utils/schema";
import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
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
    // Get subscription history
    const subscriptions = await db
      .select({
        id: USER_SUBSCRIPTIONS.id,
        planName: SUBSCRIPTION_PLANS.planName,
        displayName: SUBSCRIPTION_PLANS.displayName,
        price: SUBSCRIPTION_PLANS.price,
        billingPeriod: SUBSCRIPTION_PLANS.billingPeriod,
        status: USER_SUBSCRIPTIONS.status,
        startDate: USER_SUBSCRIPTIONS.startDate,
        endDate: USER_SUBSCRIPTIONS.endDate,
        autoRenew: USER_SUBSCRIPTIONS.autoRenew,
        createdAt: USER_SUBSCRIPTIONS.createdAt,
      })
      .from(USER_SUBSCRIPTIONS)
      .innerJoin(
        SUBSCRIPTION_PLANS,
        eq(USER_SUBSCRIPTIONS.planId, SUBSCRIPTION_PLANS.id)
      )
      .where(eq(USER_SUBSCRIPTIONS.userId, userId))
      .orderBy(desc(USER_SUBSCRIPTIONS.createdAt))
      .execute();

    // Get payment history
    const payments = await db
      .select({
        id: SUBSCRIPTION_PAYMENTS.id,
        subscriptionId: SUBSCRIPTION_PAYMENTS.subscriptionId,
        amount: SUBSCRIPTION_PAYMENTS.amount,
        currency: SUBSCRIPTION_PAYMENTS.currency,
        paymentMethod: SUBSCRIPTION_PAYMENTS.paymentMethod,
        status: SUBSCRIPTION_PAYMENTS.status,
        paidAt: SUBSCRIPTION_PAYMENTS.paidAt,
        createdAt: SUBSCRIPTION_PAYMENTS.createdAt,
      })
      .from(SUBSCRIPTION_PAYMENTS)
      .where(eq(SUBSCRIPTION_PAYMENTS.userId, userId))
      .orderBy(desc(SUBSCRIPTION_PAYMENTS.createdAt))
      .execute();

    return NextResponse.json(
      {
        success: true,
        subscriptions,
        payments,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching subscription history:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching subscription history",
      },
      { status: 500 }
    );
  }
}
