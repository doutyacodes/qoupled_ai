//app/plan-switcher/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Crown, 
  Zap, 
  Star, 
  Check, 
  X, 
  ArrowRight, 
  Settings,
  User,
  Sparkles,
  Shield,
  TrendingUp,
  Users,
  MessageCircle,
  Bot,
  Filter,
  Award,
  Gem,
  Plus,
  Edit,
  Save,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const PlanSwitcherPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('plans');
  const [currentPlan, setCurrentPlan] = useState('free');
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState([]);
  const [userPreferences, setUserPreferences] = useState({});
  const [editingPreference, setEditingPreference] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [savingPreferences, setSavingPreferences] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Fetch user data and preferences
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        setLoading(true);

        // Fetch user plan and preferences
        const [userResponse, preferencesResponse] = await Promise.all([
          fetch('/api/user/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/preferences/all', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        const userData = await userResponse.json();
        const prefData = await preferencesResponse.json();

        if (userData.success) {
          setCurrentPlan(userData.user.currentPlan || 'free');
        }

        if (prefData.success) {
          setPreferences(prefData.categories);
          setUserPreferences(prefData.userPreferences || {});
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, router]);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '₹0',
      period: 'Forever',
      description: 'Perfect for getting started',
      icon: <Heart className="h-6 w-6" />,
      color: 'from-gray-500 to-gray-600',
      features: [
        { text: '5 connections per day', included: true },
        { text: 'Basic personality matching', included: true },
        { text: 'Basic chat features', included: true },
        { text: 'Limited profile views', included: true },
        { text: 'AI chat assistance', included: false },
        { text: 'Advanced compatibility', included: false },
        { text: 'Profile verification', included: false },
        { text: 'Priority support', included: false }
      ],
      buttonText: 'Current Plan',
      buttonStyle: 'bg-gray-200 text-gray-700 cursor-not-allowed'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '₹999',
      period: '3 months',
      description: 'Best for active daters',
      icon: <Zap className="h-6 w-6" />,
      color: 'from-rose-500 to-red-600',
      popular: true,
      features: [
        { text: 'Unlimited connections', included: true },
        { text: 'Advanced compatibility matching', included: true },
        { text: 'AI chat assistance', included: true },
        { text: 'Group chats', included: true },
        { text: 'Advanced filtering', included: true },
        { text: 'Priority support', included: true },
        { text: 'Profile verification', included: false },
        { text: 'Weekly profile boosts', included: false }
      ],
      buttonText: 'Upgrade to Pro',
      buttonStyle: 'bg-gradient-to-r from-rose-500 to-red-600 text-white hover:from-rose-600 hover:to-red-700'
    },
    {
      id: 'elite',
      name: 'Elite',
      price: '₹1,499',
      period: '3 months',
      description: 'Premium experience',
      icon: <Crown className="h-6 w-6" />,
      color: 'from-purple-600 to-indigo-600',
      features: [
        { text: 'Everything in Pro', included: true },
        { text: 'Profile verification', included: true },
        { text: '50 profile boosts/week', included: true },
        { text: 'Top tier badge', included: true },
        { text: 'Priority matching', included: true },
        { text: 'VIP support', included: true },
        { text: 'Advanced analytics', included: true },
        { text: 'Exclusive features', included: true }
      ],
      buttonText: 'Upgrade to Elite',
      buttonStyle: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700'
    }
  ];

  const handlePlanUpgrade = (planId) => {
    if (planId === currentPlan) return;
    
    // Redirect to payment page or handle plan upgrade
    router.push(`/upgrade?plan=${planId}`);
  };

  const handlePreferenceChange = (categoryId, value, type = 'option') => {
    setUserPreferences(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [type]: value,
        modified: true
      }
    }));
  };

  const handleSavePreferences = async () => {
    try {
      setSavingPreferences(true);

      // Filter only modified preferences
      const modifiedPrefs = Object.keys(userPreferences)
        .filter(key => userPreferences[key]?.modified)
        .reduce((obj, key) => {
          obj[key] = userPreferences[key];
          return obj;
        }, {});

      const response = await fetch('/api/preferences/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ preferences: modifiedPrefs })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Preferences updated successfully!');
        // Remove modified flags
        setUserPreferences(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(key => {
            if (updated[key]) {
              delete updated[key].modified;
            }
          });
          return updated;
        });
      } else {
        toast.error(data.message || 'Failed to update preferences');
      }

    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSavingPreferences(false);
    }
  };

  const toggleCategoryExpanded = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const renderPreferenceInput = (category) => {
    const userPref = userPreferences[category.id] || {};
    const isExpanded = expandedCategories[category.id];

    if (category.category_type === 'range') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Range: {userPref.range_min || 18} - {userPref.range_max || 40}
            </span>
            <div className="flex items-center space-x-2">
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={userPref.is_any_selected || false}
                  onChange={(e) => handlePreferenceChange(category.id, e.target.checked, 'is_any_selected')}
                  className="mr-2 rounded border-gray-300"
                />
                Any
              </label>
            </div>
          </div>
          
          {!userPref.is_any_selected && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Min</label>
                <input
                  type="number"
                  value={userPref.range_min || ''}
                  onChange={(e) => handlePreferenceChange(category.id, parseInt(e.target.value), 'range_min')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="Min"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Max</label>
                <input
                  type="number"
                  value={userPref.range_max || ''}
                  onChange={(e) => handlePreferenceChange(category.id, parseInt(e.target.value), 'range_max')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="Max"
                />
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {category.options?.map((option) => (
          <motion.button
            key={option.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (category.allows_multiple) {
                const current = userPref.selected_options || [];
                const newSelected = current.includes(option.id)
                  ? current.filter(id => id !== option.id)
                  : [...current, option.id];
                handlePreferenceChange(category.id, newSelected, 'selected_options');
              } else {
                handlePreferenceChange(category.id, option.id, 'option_id');
                if (option.is_any_option) {
                  handlePreferenceChange(category.id, true, 'is_any_selected');
                }
              }
            }}
            className={`w-full p-3 rounded-xl border-2 text-left transition-all duration-200 ${
              (category.allows_multiple && userPref.selected_options?.includes(option.id)) ||
              (!category.allows_multiple && userPref.option_id === option.id)
                ? 'border-rose-500 bg-rose-50 text-rose-700'
                : 'border-gray-200 hover:border-rose-300 hover:bg-rose-50/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {option.option_color && (
                  <div 
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: option.option_color }}
                  />
                )}
                <span className="font-medium">{option.display_value}</span>
                {option.is_any_option && (
                  <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    Includes All
                  </span>
                )}
              </div>
              
              {((category.allows_multiple && userPref.selected_options?.includes(option.id)) ||
                (!category.allows_multiple && userPref.option_id === option.id)) && (
                <Check className="h-5 w-5 text-rose-500" />
              )}
            </div>
          </motion.button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-400 via-pink-500 to-purple-600 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-white animate-spin mb-4" />
            <h2 className="text-xl font-semibold text-white">Loading your preferences...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-400 via-pink-500 to-purple-600">
      <Toaster position="top-center" />
      
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 mr-3">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">Plan & Preferences</h1>
          </div>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Manage your subscription and customize your matching preferences
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-2 flex">
            {[
              { id: 'plans', label: 'Subscription Plans', icon: <Crown className="h-5 w-5" /> },
              { id: 'preferences', label: 'Preferences', icon: <Filter className="h-5 w-5" /> }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-rose-600 shadow-lg'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {tab.icon}
                <span className="ml-2">{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'plans' ? (
            <motion.div
              key="plans"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20 ${
                    plan.popular ? 'ring-2 ring-white/50 scale-105' : ''
                  } ${currentPlan === plan.id ? 'ring-2 ring-green-400' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {currentPlan === plan.id && (
                    <div className="absolute -top-4 right-4">
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                        <Check className="h-4 w-4 mr-1" />
                        Current
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${plan.color} text-white mb-4`}>
                      {plan.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-white/80 mb-4">{plan.description}</p>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-white">{plan.price}</span>
                      <span className="text-white/70">/{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" />
                        )}
                        <span className={feature.included ? 'text-white' : 'text-white/50'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <motion.button
                    whileHover={currentPlan !== plan.id ? { scale: 1.02 } : {}}
                    whileTap={currentPlan !== plan.id ? { scale: 0.98 } : {}}
                    onClick={() => handlePlanUpgrade(plan.id)}
                    disabled={currentPlan === plan.id}
                    className={`w-full py-4 rounded-xl font-semibold transition-all ${
                      currentPlan === plan.id 
                        ? plan.buttonStyle
                        : plan.buttonStyle
                    }`}
                  >
                    {currentPlan === plan.id ? 'Current Plan' : plan.buttonText}
                    {currentPlan !== plan.id && <ArrowRight className="ml-2 h-5 w-5 inline" />}
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="preferences"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Preferences Header */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Your Matching Preferences</h2>
                    <p className="text-white/80">
                      Customize your preferences to find more compatible matches
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSavePreferences}
                    disabled={savingPreferences || !Object.keys(userPreferences).some(key => userPreferences[key]?.modified)}
                    className="bg-white text-rose-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {savingPreferences ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        Save Changes
                      </>
                    )}
                  </motion.button>
                </div>
              </div>

              {/* Preferences Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {preferences.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {category.display_name}
                        </h3>
                        {category.description && (
                          <p className="text-white/70 text-sm">{category.description}</p>
                        )}
                      </div>
                      
                      {category.options?.length > 4 && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleCategoryExpanded(category.id)}
                          className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                        >
                          {expandedCategories[category.id] ? (
                            <ChevronUp className="h-5 w-5 text-white" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-white" />
                          )}
                        </motion.button>
                      )}
                    </div>

                    <div className={`space-y-3 ${
                      category.options?.length > 4 && !expandedCategories[category.id] 
                        ? 'max-h-48 overflow-hidden' 
                        : ''
                    }`}>
                      {renderPreferenceInput(category)}
                    </div>

                    {/* Importance Selector */}
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Importance Level
                      </label>
                      <select
                        value={userPreferences[category.id]?.importance || 'nice_to_have'}
                        onChange={(e) => handlePreferenceChange(category.id, e.target.value, 'importance')}
                        className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-white/50"
                      >
                        <option value="must_have" className="text-gray-800">Must Have</option>
                        <option value="important" className="text-gray-800">Important</option>
                        <option value="nice_to_have" className="text-gray-800">Nice to Have</option>
                        <option value="not_important" className="text-gray-800">Not Important</option>
                      </select>
                    </div>

                    {/* Deal Breaker Toggle */}
                    <div className="mt-3">
                      <label className="flex items-center text-white/80">
                        <input
                          type="checkbox"
                          checked={userPreferences[category.id]?.is_deal_breaker || false}
                          onChange={(e) => handlePreferenceChange(category.id, e.target.checked, 'is_deal_breaker')}
                          className="mr-3 rounded border-white/30 text-rose-500 focus:ring-white/50 bg-white/20"
                        />
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Deal breaker (exclude non-matches)
                      </label>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Preferences Summary */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">Preferences Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-1">
                      {Object.keys(userPreferences).filter(key => 
                        userPreferences[key]?.importance === 'must_have'
                      ).length}
                    </div>
                    <div className="text-white/70 text-sm">Must Have</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-1">
                      {Object.keys(userPreferences).filter(key => 
                        userPreferences[key]?.importance === 'important'
                      ).length}
                    </div>
                    <div className="text-white/70 text-sm">Important</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-1">
                      {Object.keys(userPreferences).filter(key => 
                        userPreferences[key]?.is_deal_breaker
                      ).length}
                    </div>
                    <div className="text-white/70 text-sm">Deal Breakers</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PlanSwitcherPage;