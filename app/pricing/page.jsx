"use client";

import React, { useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  Check, 
  Star, 
  Zap, 
  Crown, 
  Heart,
  Users,
  MessageCircle,
  Bot,
  Filter,
  TrendingUp,
  Shield,
  Sparkles,
  ArrowRight,
  X
} from 'lucide-react';

const PricingPage = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('pro');

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.6
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 40 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.02,
      y: -5,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '₹0',
      period: 'Forever',
      description: 'Perfect for getting started',
      features: [
        { text: 'Preference filtering', included: true },
        { text: 'Standard matching', included: true },
        { text: '5 connections per day', included: true },
        { text: 'Basic user chat', included: true },
        { text: 'AI chat', included: false },
        { text: 'Group chats', included: false },
        { text: 'Advanced filtering', included: false },
        { text: 'Profile verification', included: false }
      ],
      buttonText: 'Get Started',
      buttonStyle: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      popular: false,
      icon: <Heart className="h-6 w-6" />
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '₹999',
      period: '3 months',
      description: 'Best for active users',
      features: [
        { text: 'Everything in Free', included: true },
        { text: 'Unlimited connections', included: true },
        { text: 'AI chat assistant', included: true },
        { text: 'AI group chats', included: true },
        { text: 'Advanced filtering options', included: true },
        { text: 'Priority support', included: true },
        { text: 'Profile verification', included: false },
        { text: 'Elite badges', included: false }
      ],
      buttonText: 'Choose Pro',
      buttonStyle: 'bg-gradient-to-r from-rose-500 to-red-600 text-white hover:from-rose-600 hover:to-red-700',
      popular: true,
      icon: <Zap className="h-6 w-6" />
    },
    {
      id: 'elite',
      name: 'Elite',
      price: '₹1,499',
      period: '3 months',
      description: 'Premium experience',
      features: [
        { text: 'Everything in Pro', included: true },
        { text: '50 profile boosts/week', included: true },
        { text: 'Profile verification', included: true },
        { text: 'Top tier badge', included: true },
        { text: 'Priority matching', included: true },
        { text: 'Exclusive features', included: true },
        { text: 'VIP support', included: true },
        { text: 'Advanced analytics', included: true }
      ],
      buttonText: 'Go Elite',
      buttonStyle: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700',
      popular: false,
      icon: <Crown className="h-6 w-6" />
    }
  ];

  const addOns = [
    {
      name: 'Profile Boost',
      description: 'Get 10x more visibility for 7 days',
      price: '₹99',
      period: 'per week',
      icon: <TrendingUp className="h-5 w-5" />,
      benefits: ['10x more profile views', 'Priority in search results', 'Higher match probability']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      {/* Header Section */}
      <motion.div 
        className="relative overflow-hidden bg-gradient-to-br from-rose-500 to-red-600 py-16 sm:py-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-rose-600/20 to-red-700/20"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="mb-4">
              <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                <Sparkles className="mr-2 h-4 w-4" />
                Find Your Perfect Match
              </span>
            </motion.div>
            <motion.h1 
              variants={itemVariants}
              className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl"
            >
              Choose Your
              <span className="block bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-transparent">
                Love Journey
              </span>
            </motion.h1>
            <motion.p 
              variants={itemVariants}
              className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/90"
            >
              Find meaningful connections with our AI-powered matching system. 
              Choose the plan that fits your relationship goals.
            </motion.p>
          </motion.div>
        </div>
      </motion.div>

      {/* Pricing Section */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
       

        {/* Pricing Cards */}
        <motion.div 
          className="grid grid-cols-1 gap-10 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              className={`relative rounded-3xl bg-white p-8 shadow-xl ring-1 ring-gray-200 ${
                plan.popular ? 'ring-2 ring-rose-500 scale-105' : ''
              }`}
              variants={cardVariants}
              whileHover="hover"
              layout
            >
              {plan.popular && (
                <motion.div 
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-rose-500 to-red-600 px-4 py-1 text-sm font-medium text-white shadow-lg">
                    <Star className="mr-1 h-4 w-4" />
                    Most Popular
                  </span>
                </motion.div>
              )}

              <div className="flex items-center justify-between mb-6">
                <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${
                  plan.id === 'free' ? 'bg-gray-100 text-gray-600' :
                  plan.id === 'pro' ? 'bg-rose-100 text-rose-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  {plan.icon}
                </div>
                {plan.id === 'elite' && (
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    VIP
                  </div>
                )}
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-gray-600 mb-6">{plan.description}</p>

              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period !== 'Forever' && (
                    <span className="ml-2 text-gray-600">/{plan.period}</span>
                  )}
                </div>
                {isAnnual && plan.price !== '₹0' && (
                  <div className="mt-1">
                    <span className="text-sm text-green-600 font-medium">
                      Save ₹{plan.id === 'pro' ? '800' : '1200'} annually
                    </span>
                  </div>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <motion.li 
                    key={featureIndex}
                    className="flex items-center"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * featureIndex }}
                  >
                    {feature.included ? (
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-gray-300 mr-3 flex-shrink-0" />
                    )}
                    <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                      {feature.text}
                    </span>
                  </motion.li>
                ))}
              </ul>

              <motion.button
                className={`w-full rounded-xl px-6 py-3 text-sm font-semibold transition-all ${plan.buttonStyle}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.buttonText}
                <ArrowRight className="ml-2 h-4 w-4 inline" />
              </motion.button>
            </motion.div>
          ))}
        </motion.div>

        {/* Add-ons Section */}
        <motion.div 
          className="mt-20"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Boost Your Profile</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get more visibility and increase your chances of finding the perfect match
            </p>
          </div>

          <div className="max-w-md mx-auto">
            {addOns.map((addon, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-orange-100 text-orange-600 p-2 rounded-lg mr-3">
                      {addon.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{addon.name}</h3>
                      <p className="text-sm text-gray-600">{addon.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{addon.price}</div>
                    <div className="text-sm text-gray-500">{addon.period}</div>
                  </div>
                </div>
                
                <ul className="space-y-2 mb-4">
                  {addon.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center text-sm text-gray-600">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>

                <motion.button
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl px-4 py-2 font-medium hover:from-orange-600 hover:to-red-600 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Add Boost
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features Comparison */}
        <motion.div 
          className="mt-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Pro or Elite?</h2>
            <p className="text-lg text-gray-600">
              Unlock powerful features to enhance your dating experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Bot className="h-8 w-8" />,
                title: 'AI-Powered Matching',
                description: 'Our advanced AI analyzes personality compatibility for better matches',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: 'Group Conversations',
                description: 'Connect with multiple people in AI-facilitated group chats',
                color: 'from-green-500 to-emerald-500'
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: 'Verified Profiles',
                description: 'Elite members get verified badges for enhanced trust and credibility',
                color: 'from-purple-500 to-indigo-500'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + index * 0.1 }}
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} text-white mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          <div className="bg-gradient-to-r from-rose-500 to-red-600 rounded-3xl p-8 sm:p-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Find Your Perfect Match?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of successful couples who found love through our platform. 
              Start your journey today!
            </p>
            <motion.button
              className="bg-white text-rose-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5 inline" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PricingPage;