import Razorpay from 'razorpay';
import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';
import { db } from '@/utils';
import { USER, SUBSCRIPTION_PLANS, USER_SUBSCRIPTIONS } from '@/utils/schema';
import { eq } from 'drizzle-orm';

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
    const { planId, billingCycle = 'quarterly' } = body;

    if (!planId) {
      return NextResponse.json(
        { success: false, message: 'Plan ID is required' },
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
        { success: false, message: 'Plan not found' },
        { status: 404 }
      );
    }

    const selectedPlan = plan[0];

    // Get user details
    const user = await db
      .select()
      .from(USER)
      .where(eq(USER.id, userId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate amount (price is already in the correct format)
    const amount = selectedPlan.price * 100; // Convert to paise

    // Create Razorpay order
    const options = {
      amount: amount,
      currency: selectedPlan.currency || 'INR',
      receipt: `order_${userId}_${planId}_${Date.now()}`,
      notes: {
        userId: userId,
        planId: planId,
        planName: selectedPlan.planName,
        billingCycle: billingCycle,
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Store order details in database (you might want to create an ORDERS table)
    // For now, we'll return the order details

    return NextResponse.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      planDetails: {
        id: selectedPlan.id,
        name: selectedPlan.displayName,
        price: selectedPlan.price,
        billingCycle: billingCycle,
      },
      userDetails: {
        name: user[0].username,
        email: user[0].email || '',
        contact: user[0].phone || '',
      },
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}