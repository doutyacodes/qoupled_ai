//app/plan-switcher/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Zap,
  Crown,
  Check,
  X,
  ArrowRight,
  Loader2,
  Star,
  Shield,
  TrendingUp,
  Users,
  MessageCircle,
  Bot,
  Filter,
  Award,
  Sparkles,
  AlertCircle,
  CreditCard,
  Calendar,
  RefreshCw,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const PlanSwitcherPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [userSubscription, setUserSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState("quarterly");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

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

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  // Fetch user subscription and available plans
  useEffect(() => {
    const fetchUserPlanInfo = async () => {
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        setLoading(true);
        const response = await fetch("/api/user/subscription-info", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (data.success) {
          setCurrentPlan(data.currentPlan);
          setUserSubscription(data.subscription);
          setPlans(data.availablePlans);
        } else {
          toast.error(data.message || "Failed to load subscription info");
        }
      } catch (error) {
        console.error("Error fetching subscription info:", error);
        toast.error("Failed to load subscription information");
      } finally {
        setLoading(false);
      }
    };

    fetchUserPlanInfo();
  }, [token, router]);

  const handlePlanSwitch = async () => {
    if (!selectedPlan) return;

    try {
      setSwitching(true);
      const response = await fetch("/api/user/switch-plan", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newPlanId: selectedPlan.id,
          billingCycle: billingCycle,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Only show success message if no payment is required
        if (data.paymentRequired) {
          // Payment required - redirect to payment page
          setShowConfirmation(false);
          if (data.paymentUrl) {
            router.push(data.paymentUrl);
          } else {
            toast.error("Payment URL not provided");
          }
        } else {
          // Plan switched successfully without payment
          toast.success(
            `Successfully switched to ${selectedPlan.displayName} plan!`
          );
          setCurrentPlan(selectedPlan);
          setShowConfirmation(false);
          
          // Refresh the page data
          window.location.reload();
        }
      } else {
        toast.error(data.message || "Failed to switch plan");
      }
    } catch (error) {
      console.error("Error switching plan:", error);
      toast.error("Failed to switch plan. Please try again.");
    } finally {
      setSwitching(false);
    }
  };

  const getPlanIcon = (planName) => {
    switch (planName?.toLowerCase()) {
      case "elite":
        return <Crown className="h-6 w-6" />;
      case "pro":
        return <Zap className="h-6 w-6" />;
      default:
        return <Heart className="h-6 w-6" />;
    }
  };

  const getPlanColor = (planName) => {
    switch (planName?.toLowerCase()) {
      case "elite":
        return "from-purple-500 to-indigo-600";
      case "pro":
        return "from-rose-500 to-red-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const isCurrentPlan = (plan) => {
    return (
      currentPlan?.planName?.toLowerCase() === plan.planName?.toLowerCase()
    );
  };

  const isUpgrade = (plan) => {
    const planHierarchy = { free: 0, pro: 1, elite: 2 };
    const currentLevel =
      planHierarchy[currentPlan?.planName?.toLowerCase()] || 0;
    const targetLevel = planHierarchy[plan.planName?.toLowerCase()] || 0;
    return targetLevel > currentLevel;
  };

  const isDowngrade = (plan) => {
    const planHierarchy = { free: 0, pro: 1, elite: 2 };
    const currentLevel =
      planHierarchy[currentPlan?.planName?.toLowerCase()] || 0;
    const targetLevel = planHierarchy[plan.planName?.toLowerCase()] || 0;
    return targetLevel < currentLevel;
  };

  const getActionText = (plan) => {
    if (isCurrentPlan(plan)) return "Current Plan";
    if (isUpgrade(plan)) return "Upgrade";
    if (isDowngrade(plan)) return "Downgrade";
    return "Switch";
  };

  const getActionColor = (plan) => {
    if (isCurrentPlan(plan))
      return "bg-gray-200 text-gray-500 cursor-not-allowed";
    if (isUpgrade(plan))
      return "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700";
    if (isDowngrade(plan))
      return "bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700";
    return "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700";
  };

  const formatFeatures = (features) => {
    if (typeof features === "string") {
      try {
        return JSON.parse(features);
      } catch {
        return {};
      }
    }
    return features || {};
  };

  const renderFeatureValue = (key, value) => {
    if (key === "connections_per_day") {
      return value === -1 ? "Unlimited" : `${value} per day`;
    }
    if (typeof value === "boolean") {
      return value ? "✓" : "✗";
    }
    if (typeof value === "number" && value > 0) {
      return value.toString();
    }
    return value ? "✓" : "✗";
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
            <h2 className="text-xl font-bold text-white mb-2">
              Loading Your Plans
            </h2>
            <p className="text-white/80 text-center text-sm">
              Please wait while we fetch your subscription details...
            </p>
          </div>
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
            background: "#363636",
            color: "#fff",
            borderRadius: "12px",
          },
        }}
      />

      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="bg-white/20 backdrop-blur-sm rounded-full p-4 mr-4"
            >
              <RefreshCw className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Switch Your Plan
            </h1>
          </div>
          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-6">
            Upgrade, downgrade, or modify your subscription to better suit your
            dating needs
          </p>

          {/* Current Plan Status */}
          {currentPlan && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg"
            >
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-r ${getPlanColor(
                  currentPlan.planName
                )} flex items-center justify-center mr-3`}
              >
                {getPlanIcon(currentPlan.planName)}
              </div>
              <div className="text-left">
                <div className="text-white font-semibold">
                  Current Plan: {currentPlan.displayName}
                </div>
                {userSubscription && (
                  <div className="text-white/80 text-sm">
                    {userSubscription.status === "active"
                      ? `Expires: ${new Date(
                          userSubscription.endDate
                        ).toLocaleDateString()}`
                      : `Status: ${userSubscription.status}`}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Billing Cycle Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-1 shadow-lg">
            <button
              onClick={() => setBillingCycle("quarterly")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === "quarterly"
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Quarterly
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === "annual"
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Annual
              <span className="ml-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded">
                Save 20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Plans Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 px-2 sm:px-0"
        >
          {plans
            .filter((plan) => plan.billingPeriod === billingCycle)
            .map((plan, index) => {
              const features = formatFeatures(plan.features);
              const isCurrent = isCurrentPlan(plan);

              return (
                <motion.div
                  key={plan.id}
                  variants={cardVariants}
                  whileHover={!isCurrent ? { y: -8, scale: 1.02 } : {}}
                  className={`relative bg-white/10 backdrop-blur-lg rounded-3xl overflow-hidden shadow-xl border-2 transition-all duration-300 ${
                    isCurrent
                      ? "border-green-400 bg-white/20"
                      : "border-white/20 hover:border-white/40"
                  } ${
                    selectedPlan?.id === plan.id
                      ? "ring-4 ring-yellow-400/50"
                      : ""
                  } ${plan.planName === "pro" ? "mt-8 sm:mt-0" : ""}`}
                >
                  {/* Popular Badge */}
                  {plan.planName === "pro" && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                      <span className="bg-gradient-to-r from-rose-500 to-red-600 text-white px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-medium shadow-lg whitespace-nowrap flex items-center">
                        <Star className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Current Plan Badge */}
                  {isCurrent && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                        <Check className="h-3 w-3 mr-1" />
                        Current
                      </div>
                    </div>
                  )}

                  <div className="p-4 sm:p-6 lg:p-8">
                    {/* Plan Header */}
                    <div className="text-center mb-6">
                      <div
                        className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-r ${getPlanColor(
                          plan.planName
                        )} text-white mb-4`}
                      >
                        {getPlanIcon(plan.planName)}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                        {plan.displayName}
                      </h3>

                      <div className="mb-4">
                        <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                          ₹{plan.price}
                        </span>
                        <span className="text-white/70 text-sm sm:text-base">
                          /{billingCycle === "quarterly" ? "3 months" : "year"}
                        </span>
                      </div>

                      {billingCycle === "annual" && (
                        <div className="text-green-300 text-xs sm:text-sm font-medium">
                          Save ₹{plan.planName === "pro" ? "800" : "1200"}{" "}
                          annually
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    <div className="space-y-3 mb-6">
                      {Object.entries(features).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center text-white/90 text-sm"
                        >
                          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center mr-3 flex-shrink-0">
                            {value && value !== false ? (
                              <Check className="h-3 w-3 text-green-400" />
                            ) : (
                              <X className="h-3 w-3 text-red-400" />
                            )}
                          </div>
                          <span className="capitalize">
                            {key.replace(/_/g, " ")}:{" "}
                            {renderFeatureValue(key, value)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Action Button */}
                    <motion.button
                      whileHover={!isCurrent ? { scale: 1.02 } : {}}
                      whileTap={!isCurrent ? { scale: 0.98 } : {}}
                      onClick={() => {
                        if (!isCurrent) {
                          setSelectedPlan(plan);
                          setShowConfirmation(true);
                        }
                      }}
                      disabled={isCurrent}
                      className={`w-full py-3 sm:py-4 rounded-2xl font-semibold transition-all duration-200 text-sm sm:text-base ${getActionColor(
                        plan
                      )}`}
                    >
                      {isCurrent ? (
                        <div className="flex items-center justify-center">
                          <Check className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                          <span className="hidden sm:inline">Current Plan</span>
                          <span className="sm:hidden">Current</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          {isUpgrade(plan) && (
                            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                          )}
                          {getActionText(plan)}
                          <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                        </div>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
        </motion.div>

        {/* Plan Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border border-white/20"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 text-center">
            Feature Comparison
          </h2>

          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="min-w-full inline-block align-middle">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left text-white font-semibold py-3 sm:py-4 px-2 sm:px-4 text-sm sm:text-base">
                      Feature
                    </th>
                    <th className="text-center text-white font-semibold py-3 sm:py-4 px-2 sm:px-4 text-sm sm:text-base">
                      Free
                    </th>
                    <th className="text-center text-white font-semibold py-3 sm:py-4 px-2 sm:px-4 text-sm sm:text-base">
                      Pro
                    </th>
                    <th className="text-center text-white font-semibold py-3 sm:py-4 px-2 sm:px-4 text-sm sm:text-base">
                      Elite
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/10">
                    <td className="text-white/90 py-3 sm:py-4 px-2 sm:px-4 text-sm sm:text-base">Daily Connections</td>
                    <td className="text-center text-white/70 py-3 sm:py-4 px-2 sm:px-4 text-sm sm:text-base">5</td>
                    <td className="text-center text-white/70 py-3 sm:py-4 px-2 sm:px-4 text-sm sm:text-base">Unlimited</td>
                    <td className="text-center text-white/70 py-3 sm:py-4 px-2 sm:px-4 text-sm sm:text-base">Unlimited</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="text-white/90 py-3 sm:py-4 px-2 sm:px-4 text-sm sm:text-base">AI Chat Assistant</td>
                    <td className="text-center text-red-400 py-3 sm:py-4 px-2 sm:px-4 text-sm sm:text-base">✗</td>
                    <td className="text-center text-green-400 py-3 sm:py-4 px-2 sm:px-4 text-sm sm:text-base">✓</td>
                    <td className="text-center text-green-400 py-3 sm:py-4 px-2 sm:px-4 text-sm sm:text-base">✓</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="text-white/90 py-3 sm:py-4 px-2 sm:px-4 text-sm sm:text-base">Profile Verification</td>
                    <td className="text-center text-red-400 py-3 sm:py-4 px-2 sm:px-4 text-sm sm:text-base">✗</td>
                    <td className="text-center text-red-400 py-3 sm:py-4 px-2 sm:px-4 text-sm sm:text-base">✗</td>
                    <td className="text-center text-green-400 py-3 sm:py-4 px-2 sm:px-4 text-sm sm:text-base">✓</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="text-white/90 py-3 sm:py-4 px-2 sm:px-4 text-sm sm:text-base">Weekly Profile Boosts</td>
                    <td className="text-center text-white/70 py-3 sm:py-4 px-2 sm:px-4 text-sm sm:text-base">0</td>
                    <td className="text-center text-white/70 py-3 sm:py-4 px-2 sm:px-4 text-sm sm:text-base">0</td>
                    <td className="text-center text-white/70 py-3 sm:py-4 px-2 sm:px-4 text-sm sm:text-base">50</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center mb-6">
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${getPlanColor(
                    selectedPlan.planName
                  )} text-white mb-4`}
                >
                  {getPlanIcon(selectedPlan.planName)}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {getActionText(selectedPlan)} to {selectedPlan.displayName}
                </h3>
                <p className="text-gray-600">
                  {isUpgrade(selectedPlan) &&
                    "Unlock more features and find better matches!"}
                  {isDowngrade(selectedPlan) &&
                    "Your features will be limited after downgrading."}
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700">Plan:</span>
                  <span className="text-gray-900">
                    {selectedPlan.displayName}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700">Price:</span>
                  <span className="text-gray-900">
                    ₹{selectedPlan.price}/
                    {billingCycle === "quarterly" ? "3 months" : "year"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Billing:</span>
                  <span className="text-gray-900 capitalize">
                    {billingCycle}
                  </span>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowConfirmation(false)}
                  disabled={switching}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePlanSwitch}
                  disabled={switching}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all ${getActionColor(
                    selectedPlan
                  )} flex items-center justify-center`}
                >
                  {switching ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 mr-2" />
                      Confirm {getActionText(selectedPlan)}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlanSwitcherPage;
