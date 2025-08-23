"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Shield,
  Loader2,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Lock,
  RefreshCw,
  Crown,
  Zap,
  Heart,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const PaymentProcessPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);

  const planId = searchParams.get("planId");
  const billingCycle = searchParams.get("billingCycle") || "quarterly";

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    if (!planId) {
      toast.error("Invalid payment request");
      router.push("/plan-switcher");
      return;
    }

    // Load Razorpay script
    const loadRazorpayScript = (retryCount = 0) => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          resolve(true);
          return;
        }

        // Remove any existing script
        const existingScript = document.querySelector('script[src*="razorpay"]');
        if (existingScript) {
          existingScript.remove();
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
          // Double check that Razorpay is actually available
          if (window.Razorpay) {
            resolve(true);
          } else {
            // Retry if Razorpay still not available
            setTimeout(() => {
              if (retryCount < 2) {
                loadRazorpayScript(retryCount + 1).then(resolve);
              } else {
                resolve(false);
              }
            }, 1000);
          }
        };
        script.onerror = () => {
          if (retryCount < 2) {
            setTimeout(() => {
              loadRazorpayScript(retryCount + 1).then(resolve);
            }, 1000);
          } else {
            resolve(false);
          }
        };
        document.head.appendChild(script);
      });
    };

    loadRazorpayScript().then((loaded) => {
      if (loaded) {
        createPaymentOrder();
      } else {
        toast.error("Failed to load payment gateway. Please check your internet connection and try again.");
        setTimeout(() => {
          router.push("/plan-switcher");
        }, 3000);
      }
    });
  }, [token, planId, billingCycle]);

  const createPaymentOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: planId,
          billingCycle: billingCycle,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOrderDetails(data);
        // Auto-initiate Razorpay after order creation
        setTimeout(() => {
          initiateRazorpayPayment(data);
        }, 1000);
      } else {
        toast.error(data.message || "Failed to create payment order");
        router.push("/plan-switcher");
      }
    } catch (error) {
      console.error("Error creating payment order:", error);
      toast.error("Failed to initialize payment");
      router.push("/plan-switcher");
    } finally {
      setLoading(false);
    }
  };

  const initiateRazorpayPayment = (orderData) => {
    if (!window.Razorpay) {
      toast.error("Payment gateway not loaded. Please refresh the page.");
      router.push("/plan-switcher");
      return;
    }

    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "Qoupled",
      description: `${orderData.planDetails.name} Plan - ${orderData.planDetails.billingCycle}`,
      order_id: orderData.orderId,
      prefill: {
        name: orderData.userDetails.name,
        email: orderData.userDetails.email,
        contact: orderData.userDetails.contact,
      },
      theme: {
        color: "#ef4444", // Rose color
      },
      modal: {
        ondismiss: () => {
          setProcessingPayment(false);
          toast.error("Payment cancelled");
        },
      },
      handler: async (response) => {
        await verifyPayment(response);
      },
    };

    setProcessingPayment(true);
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const verifyPayment = async (razorpayResponse) => {
    try {
      setProcessingPayment(true);
      const response = await fetch("/api/payment/verify", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          razorpay_order_id: razorpayResponse.razorpay_order_id,
          razorpay_payment_id: razorpayResponse.razorpay_payment_id,
          razorpay_signature: razorpayResponse.razorpay_signature,
          planId: planId,
          billingCycle: billingCycle,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPaymentSuccess(true);
        toast.success("Payment successful! Your plan has been activated.");
        
        // Redirect after a delay
        setTimeout(() => {
          router.push("/plan-switcher");
        }, 3000);
      } else {
        setPaymentError(data.message || "Payment verification failed");
        toast.error(data.message || "Payment verification failed");
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      setPaymentError("Payment verification failed");
      toast.error("Payment verification failed");
    } finally {
      setProcessingPayment(false);
    }
  };

  const retryPayment = () => {
    setPaymentError(null);
    setPaymentSuccess(false);
    if (orderDetails) {
      initiateRazorpayPayment(orderDetails);
    } else {
      createPaymentOrder();
    }
  };

  const getPlanIcon = (planName) => {
    switch (planName?.toLowerCase()) {
      case 'elite': return <Crown className="h-6 w-6" />;
      case 'pro': return <Zap className="h-6 w-6" />;
      default: return <Heart className="h-6 w-6" />;
    }
  };

  const getPlanColor = (planName) => {
    switch (planName?.toLowerCase()) {
      case 'elite': return 'from-purple-500 to-indigo-600';
      case 'pro': return 'from-rose-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-400 via-pink-500 to-purple-600">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
            borderRadius: "12px",
          },
        }}
      />

      <div className="container mx-auto max-w-4xl px-4 py-8 min-h-screen flex items-center justify-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20"
              >
                <div className="text-center">
                  <Loader2 className="h-16 w-16 text-white animate-spin mx-auto mb-6" />
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Preparing Your Payment
                  </h2>
                  <p className="text-white/80">
                    Please wait while we set up your secure payment...
                  </p>
                </div>
              </motion.div>
            )}

            {processingPayment && !loading && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20"
              >
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full mx-auto mb-6"
                  />
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Processing Payment
                  </h2>
                  <p className="text-white/80">
                    Please don't close this window while we verify your payment...
                  </p>
                </div>
              </motion.div>
            )}

            {paymentSuccess && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-green-400/50"
              >
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle className="h-10 w-10 text-white" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Payment Successful!
                  </h2>
                  <p className="text-white/80 mb-6">
                    Your subscription has been activated successfully.
                  </p>
                  {orderDetails && (
                    <div className="bg-white/20 rounded-2xl p-4 mb-6">
                      <div className="text-white/90 text-sm">
                        <div className="flex justify-between mb-2">
                          <span>Plan:</span>
                          <span className="font-semibold">
                            {orderDetails.planDetails.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Billing:</span>
                          <span className="font-semibold capitalize">
                            {billingCycle}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  <p className="text-white/60 text-sm">
                    Redirecting you back to your plans...
                  </p>
                </div>
              </motion.div>
            )}

            {paymentError && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-red-400/50"
              >
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <XCircle className="h-10 w-10 text-white" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Payment Failed
                  </h2>
                  <p className="text-white/80 mb-6">
                    {paymentError}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={retryPayment}
                      className="flex-1 bg-gradient-to-r from-rose-500 to-red-600 text-white py-3 px-6 rounded-2xl font-semibold hover:from-rose-600 hover:to-red-700 transition-colors flex items-center justify-center"
                    >
                      <RefreshCw className="h-5 w-5 mr-2" />
                      Retry Payment
                    </button>
                    <button
                      onClick={() => router.push("/plan-switcher")}
                      className="flex-1 bg-white/20 text-white py-3 px-6 rounded-2xl font-semibold hover:bg-white/30 transition-colors flex items-center justify-center"
                    >
                      <ArrowLeft className="h-5 w-5 mr-2" />
                      Go Back
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {orderDetails && !processingPayment && !paymentSuccess && !paymentError && (
              <motion.div
                key="payment-details"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20"
              >
                <motion.div variants={itemVariants} className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-rose-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Complete Your Payment
                  </h2>
                  <p className="text-white/80">
                    You're one step away from unlocking premium features
                  </p>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-4 mb-6">
                  <div className="bg-white/20 rounded-2xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/80">Plan:</span>
                      <span className="text-white font-semibold">
                        {orderDetails.planDetails.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/80">Amount:</span>
                      <span className="text-white font-semibold">
                        ₹{orderDetails.planDetails.price}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Billing:</span>
                      <span className="text-white font-semibold capitalize">
                        {billingCycle}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center text-white/60 text-sm">
                    <Shield className="h-4 w-4 mr-2" />
                    Secured by Razorpay SSL encryption
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="flex flex-col gap-4">
                  <button
                    onClick={() => initiateRazorpayPayment(orderDetails)}
                    className="w-full bg-gradient-to-r from-rose-500 to-red-600 text-white py-4 rounded-2xl font-semibold hover:from-rose-600 hover:to-red-700 transition-colors flex items-center justify-center"
                  >
                    <Lock className="h-5 w-5 mr-2" />
                    Pay Securely
                  </button>
                  
                  <button
                    onClick={() => router.push("/plan-switcher")}
                    className="w-full bg-white/20 text-white py-3 rounded-2xl font-semibold hover:bg-white/30 transition-colors flex items-center justify-center"
                  >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Cancel
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentProcessPage;