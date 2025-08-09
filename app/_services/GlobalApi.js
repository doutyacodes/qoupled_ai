const { default: axios } = require("axios");

const CreateNewUser = (data) => axios.post("/api/createUser", data);
const LoginUser = (data) => axios.post("/api/login", data);
const CreateUser = (data) => axios.post("/api/createNewUser", data);

// Updated method to create user with preferences
const CreateUserWithPreferences = (data) =>
  axios.post("/api/createNewUser", data);

// New method to fetch preference categories for signup form
const GetPreferenceCategoriesForSignup = () => axios.get("/api/createNewUser");

const GetUserData = (token) => {
  return axios.get("/api/getUserDetails", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
const GetQuizData = (id, token) => {
  return axios.get(`/api/getQuizData/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
const GetDashboarCheck = (token) => {
  return axios.get(`/api/getDashboardCheckData`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
const SaveQuizProgress = (data, token, quizId) => {
  const payload = {
    quizId,
    results: data,
  };

  return axios.post(`/api/quizProgress`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
const GetCompatabilityQuiz = (token) => {
  return axios.get("/api/getCompatability-quiz", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
const SaveCompatabilityProgress = (data, token) => {
  return axios.post(`/api/compatability-progress`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
const SaveCompatabilityResult = (token) => {
  return axios.post(
    `/api/submit-Compatability`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
const SaveQuizResult = (token) => {
  return axios.post(
    "/api/quizResult",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

const VerifyAuth = (token) => {
  return axios.post(
    `/api/authVerify`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

const SaveInvitation = (userId, token) => {
  const payload = {
    userId,
  };

  return axios.post(`/api/save-invite`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const CheckInvites = (token) => {
  return axios.get("/api/check-invites", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const CompatabilityStatus = (inviteUserId, token) => {
  return axios.get(`/api/getCompatabilityStatus/${inviteUserId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const GetCompatibilityResults = (inviteUserId, token) => {
  return axios.get(`/api/compatability-results/${inviteUserId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const GetPreviousSessions = (token) => {
  return axios.get(`/api/getPreviousSessions/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const AddCoupleRequest = (coupleId, token) => {
  const payload = {
    coupleId,
  };

  return axios.post("/api/add-couple", payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// New functions for red flags
const SaveRedFlag = (data, token) => {
  return axios.post("/api/user-red-flags", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const RemoveRedFlag = (answerId, token) => {
  return axios.delete(`/api/user-red-flags?answerId=${answerId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const GetRedFlags = (token) => {
  return axios.get("/api/user-red-flags", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Add these methods to your existing GlobalApi service

// Get all compatible matches for the current user
const GetMatchedUsers = (
  token,
  minCompatibility = 50,
  compatibleOnly = false,
  limit = 100
) => {
  return axios.get(
    `/api/compatibility-matches?minCompatibility=${minCompatibility}&compatibleOnly=${compatibleOnly}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

// Calculate compatibility score with a specific user
const GetCompatibilityWithUser = (userId, token) => {
  return axios.get(`/api/compatibility-results/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Run a batch calculation of compatibility for all users (admin only)
const CalculateAllCompatibility = (token) => {
  return axios.post(
    "/api/calculate-all-compatibility",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

// Search users by criteria
const SearchUsers = (searchQuery, token) => {
  return axios.get(`/api/search-users?q=${encodeURIComponent(searchQuery)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Save or remove a favorite profile
const ToggleFavoriteProfile = (userId, action = "add", token) => {
  return axios.post(
    "/api/favorite-profiles",
    {
      userId,
      action, // 'add' or 'remove'
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};



const SendConnectionRequest = (receiverId, token) => {
  return axios.post(
    "/api/connections/send",
    { receiverId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

// Get all preference categories
const GetPreferenceCategories = (token) => {
  return axios.get("/api/preferences/categories", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Get user's current preferences
const GetUserPreferences = (token) => {
  return axios.get("/api/preferences/user", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Save or update a user preference
const SaveUserPreference = (data, token) => {
  return axios.post("/api/preferences/user", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Get matching preferences (what user is looking for)
const GetUserMatchingPreferences = (token) => {
  return axios.get("/api/preferences/matching", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Save matching preference
const SaveUserMatchingPreference = (data, token) => {
  return axios.post("/api/preferences/matching", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Save multi-selection preference (for interests, languages, etc.)
const SaveUserMultiPreference = (data, token) => {
  return axios.post("/api/preferences/multi", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Delete a multi-selection preference
const DeleteUserMultiPreference = (optionId, token) => {
  return axios.delete(`/api/preferences/multi?optionId=${optionId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Friend suggestion functions
const GetFriendSuggestion = (aiCharacterId, token) => {
  return axios.post(
    "/api/ai-chat/get-friend-suggestion",
    { aiCharacterId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

// Respond to friend suggestion (uses existing respond-suggestion route)
const RespondToFriendSuggestion = (data, token) => {
  return axios.post("/api/ai-chat/respond-suggestion", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};



// Add these methods to your existing GlobalApi.js file

// ============================================
// PREFERENCES API METHODS
// ============================================

// Get all preference categories and user preferences
const GetAllPreferences = (token) => {
  return axios.get("/api/preferences/all", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Update user preferences
const UpdateUserPreferences = (data, token) => {
  return axios.post("/api/preferences/update", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};



// Create new preference category (admin)
const CreatePreferenceCategory = (data, token) => {
  return axios.post("/api/preferences/categories", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Create new preference option (admin)
const CreatePreferenceOption = (data, token) => {
  return axios.post("/api/preferences/options", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Update preference option (admin)
const UpdatePreferenceOption = (data, token) => {
  return axios.put("/api/preferences/options", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Delete preference option (admin)
const DeletePreferenceOption = (optionId, token) => {
  return axios.delete(`/api/preferences/options?optionId=${optionId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ============================================
// USER PROFILE API METHODS
// ============================================

// Get user profile with subscription info
const GetUserProfile = (token) => {
  return axios.get("/api/user/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Update user subscription plan
const UpdateUserPlan = (planData, token) => {
  return axios.post("/api/user/plan/update", planData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ============================================
// PLAN MANAGEMENT API METHODS
// ============================================

// Get available subscription plans
const GetSubscriptionPlans = () => {
  return axios.get("/api/plans/available");
};

// Initiate plan upgrade
const InitiatePlanUpgrade = (planId, token) => {
  return axios.post("/api/plans/upgrade", { planId }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Verify payment and activate plan
const VerifyPlanPayment = (paymentData, token) => {
  return axios.post("/api/plans/verify-payment", paymentData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Cancel subscription
const CancelSubscription = (token) => {
  return axios.post("/api/plans/cancel", {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Get subscription history
const GetSubscriptionHistory = (token) => {
  return axios.get("/api/plans/history", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ============================================
// PROFILE BOOST API METHODS
// ============================================

// Purchase profile boost
const PurchaseProfileBoost = (boostData, token) => {
  return axios.post("/api/boosts/purchase", boostData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Get boost history
const GetBoostHistory = (token) => {
  return axios.get("/api/boosts/history", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ============================================
// ENHANCED MATCHING API METHODS
// ============================================

// Get matches based on preferences and plan
const GetPersonalizedMatches = (filters, token) => {
  const queryParams = new URLSearchParams(filters).toString();
  return axios.get(`/api/matches/personalized?${queryParams}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Get compatibility score with specific user
const GetDetailedCompatibility = (userId, token) => {
  return axios.get(`/api/compatibility/detailed/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Save/unsave a profile
const ToggleProfileSave = (userId, action, token) => {
  return axios.post("/api/profiles/save", { userId, action }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Get saved profiles
const GetSavedProfiles = (token) => {
  return axios.get("/api/profiles/saved", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ============================================
// ANALYTICS API METHODS
// ============================================

// Get user matching analytics
const GetMatchingAnalytics = (token) => {
  return axios.get("/api/analytics/matching", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Get profile performance stats
const GetProfileStats = (token) => {
  return axios.get("/api/analytics/profile-stats", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// ============================================
// UPDATED EXPORT WITH NEW METHODS
// ============================================


export default {
    // Existing methods
  CreateUserWithPreferences,
  GetPreferenceCategoriesForSignup,
  CreateNewUser,
  GetUserData,
  GetQuizData,
  CreateUser,
  LoginUser,
  GetDashboarCheck,
  SaveQuizProgress,
  GetCompatabilityQuiz,
  SaveCompatabilityProgress,
  SaveCompatabilityResult,
  SaveQuizResult,
  VerifyAuth,
  SaveInvitation,
  CheckInvites,
  CompatabilityStatus,
  GetCompatibilityResults,
  GetPreviousSessions,
  AddCoupleRequest,
  SaveRedFlag,
  RemoveRedFlag,
  GetRedFlags,
  GetMatchedUsers,
  GetCompatibilityWithUser,
  CalculateAllCompatibility,
  SearchUsers,
  ToggleFavoriteProfile,
  GetSavedProfiles,
  SendConnectionRequest,
  GetPreferenceCategories,
  GetUserPreferences,
  SaveUserPreference,
  GetUserMatchingPreferences,
  SaveUserMatchingPreference,
  SaveUserMultiPreference,
  DeleteUserMultiPreference,
  GetFriendSuggestion,
  RespondToFriendSuggestion,

  // New Preferences Methods
  GetAllPreferences,
  UpdateUserPreferences,
  CreatePreferenceCategory,
  CreatePreferenceOption,
  UpdatePreferenceOption,
  DeletePreferenceOption,

  // User Profile Methods
  GetUserProfile,
  UpdateUserPlan,

  // Plan Management Methods
  GetSubscriptionPlans,
  InitiatePlanUpgrade,
  VerifyPlanPayment,
  CancelSubscription,
  GetSubscriptionHistory,

  // Profile Boost Methods
  PurchaseProfileBoost,
  GetBoostHistory,

  // Enhanced Matching Methods
  GetPersonalizedMatches,
  GetDetailedCompatibility,
  ToggleProfileSave,

  // Analytics Methods
  GetMatchingAnalytics,
  GetProfileStats
};
