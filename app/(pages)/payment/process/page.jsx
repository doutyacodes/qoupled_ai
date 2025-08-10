//app/payment/process/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Shield, 
  Check, 
  ArrowLeft, 
  Loader2,
  Crown,
  Zap,
  Heart,
  Sparkles,
  Lock,
  Star
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const PaymentProcessPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const subscriptionId = searchParams.get('subscriptionId');
  const amount = searchParams.get('amount');

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Fetch subscription details
  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      if (!subscriptionId || !token) {
        router.push('/plan-switcher');
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/payment/subscription-details?subscriptionId=${subscriptionId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (data.success) {
          setSubscriptionDetails(data.subscription);
        } else {
          toast.error(data.message || 'Failed to load subscription details');
          router.push('/plan-switcher');
        }
      } catch (error) {
        console.error('Error fetching subscription details:', error);
        toast.error('Failed to load payment details');
        router.push('/plan-switcher');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionDetails();
  }, [subscriptionId, token, router]);

  // Countdown timer after payment completion
  useEffect(() => {
    if (paymentCompleted && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (paymentCompleted && countdown === 0) {
      router.push('/my-matches');
    }
  }, [paymentCompleted, countdown, router]);

  const handlePayment = async () => {
    try {
      setProcessing(true);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const response = await fetch('/api/payment/process', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscriptionId: subscriptionId,
          paymentId: `pay_${Date.now()}`,
          paymentMethod: 'simulated',
          razorpayOrderId: `order_${Date.now()}`
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Payment successful! Subscription activated!');
        setPaymentCompleted(true);
      } else {
        toast.error(data.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const getPlanIcon = (planName) => {
    switch (planName?.toLowerCase()) {
      case 'elite': return <Crown className="h-8 w-8" />;
      case 'pro': return <Zap className="h-8 w-8" />;
      default: return <Heart className="h-8 w-8" />;
    }
  };

  const getPlanColor = (planName) => {
    switch (planName?.toLowerCase()) {
      case 'elite': return 'from-purple-500 to-indigo-600';
      case 'pro': return 'from-rose-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-400 via-pink-500 to-purple-600 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl max-w-sm w-full"
        >
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-white animate-spin mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Loading Payment Details</h2>
            <p className="text-white/80 text-center text-sm">Please wait while we prepare your payment...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (paymentCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full text-center"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="mb-6 flex justify-center"
          >
            <div className="h-20 w-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
              <Check className="h-12 w-12 text-green-500" />
            </div>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4"
          >
            🎉 Payment Successful!
          </motion.h2>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-6"
          >
            <p className="text-gray-600 mb-4">
              Welcome to {subscriptionDetails?.planDisplayName}! Your subscription is now active.
            </p>
            
            <div className="bg-gray-50 rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-center mb-2">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getPlanColor(subscriptionDetails?.planName)} flex items-center justify-center text-white mr-3`}>
                  {getPlanIcon(subscriptionDetails?.planName)}
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{subscriptionDetails?.planDisplayName}</div>
                  <div className="text-sm text-gray-600">₹{amount} paid successfully</div>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex items-center justify-center text-gray-500 mb-6"
          >
            <Sparkles className="h-5 w-5 mr-2 text-gray-400" />
            <p className="text-sm">Redirecting to matches in {countdown} seconds</p>
          </motion.div>
          
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/my-matches')}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-4 rounded-2xl hover:shadow-lg transition-all duration-200 flex items-center justify-center"
          >
            <Heart className="mr-2 h-5 w-5" />
            Find My Matches Now
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-400 via-pink-500 to-purple-600">
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '12px',
          },
        }}
      />

      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Plans
          </button>
          
          <div className="flex items-center justify-center mb-4">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="bg-white/20 backdrop-blur-sm rounded-full p-4 mr-4"
            >
              <CreditCard className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">Complete Payment</h1>
          </div>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            You're just one step away from unlocking premium features
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Summary */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Shield className="h-6 w-6 mr-3" />
              Order Summary
            </h2>

            {subscriptionDetails && (
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-white/10 rounded-2xl">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getPlanColor(subscriptionDetails.planName)} flex items-center justify-center text-white mr-4`}>
                    {getPlanIcon(subscriptionDetails.planName)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{subscriptionDetails.planDisplayName}</h3>
                    <p className="text-white/70 text-sm">{subscriptionDetails.billingPeriod} billing</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">₹{amount}</div>
                  </div>
                </div>

                <div className="border-t border-white/20 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/80">Subtotal</span>
                    <span className="text-white">₹{amount}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/80">Tax</span>
                    <span className="text-white">₹0</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold text-white border-t border-white/20 pt-2">
                    <span>Total</span>
                    <span>₹{amount}</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-500/20 rounded-2xl">
                  <div className="flex items-center text-blue-200 text-sm">
                    <Lock className="h-4 w-4 mr-2" />
                    <span>Secure payment processing</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Payment Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-3xl p-8 shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment Details</h2>

            <div className="space-y-6">
              {/* Simulated Payment Form */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value="4111 1111 1111 1111"
                    readOnly
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent text-gray-500"
                  />
                  <CreditCard className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value="12/26"
                    readOnly
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    value="123"
                    readOnly
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value="Demo User"
                  readOnly
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent text-gray-500"
                />
              </div>

              {/* Demo Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center text-amber-800">
                  <Star className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">Demo Payment</span>
                </div>
                <p className="text-amber-700 text-sm mt-1">
                  This is a demonstration. No actual payment will be processed.
                </p>
              </div>

              {/* Payment Button */}
              <motion.button
                whileHover={{ scale: processing ? 1 : 1.02 }}
                whileTap={{ scale: processing ? 1 : 0.98 }}
                onClick={handlePayment}
                disabled={processing}
                className="w-full bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold py-4 rounded-2xl hover:from-rose-600 hover:to-red-700 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin mr-3" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-6 h-6 mr-3" />
                    Pay ₹{amount}
                  </>
                )}
              </motion.button>

              {/* Security Notice */}
              <div className="text-center text-sm text-gray-500">
                <Lock className="h-4 w-4 inline mr-1" />
                Your payment information is secure and encrypted
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PaymentProcessPage;