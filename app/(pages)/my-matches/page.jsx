"use client";

import { BASE_IMAGE_URL } from "@/utils/constants";
import { getDefaultImage } from "@/utils/defaultImages";
import { encryptText } from "@/utils/encryption";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Briefcase,
  Calendar,
  ChevronDown,
  Crown,
  Eye,
  Filter,
  GraduationCap,
  Heart,
  Loader2,
  MapPin,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Verified,
  X,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Modal Component for Compatibility Test Prompt
const CompatibilityTestModal = ({ isOpen, onClose, onTakeTest }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/50"
      >
        <div className="text-center">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <Target className="h-10 w-10 text-white" />
          </div>

          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            Complete Compatibility Test
          </h3>

          <p className="text-gray-600 mb-6 leading-relaxed">
            To unlock full access to profile details, filters, and compatibility
            insights, please complete our compatibility test. This helps us find
            your perfect match!
          </p>

          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onTakeTest}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Take Compatibility Test
              <ArrowRight className="h-5 w-5 ml-2" />
            </motion.button>
            {/* 
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-300 transition-colors"
            >
              Maybe Later
            </motion.button>
             */}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function ModernMyMatches() {
  const router = useRouter();
  const [matches, setMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [savedProfiles, setSavedProfiles] = useState([]);
  const [userPlan, setUserPlan] = useState("free");
  const [hasCompletedCompatibilityTest, setHasCompletedCompatibilityTest] =
    useState(false);
  const [matchingType, setMatchingType] = useState("personality"); // 'personality' or 'compatibility'
  const [dynamicFilterOptions, setDynamicFilterOptions] = useState(null);
  const [showCompatibilityModal, setShowCompatibilityModal] = useState(false);
  const [compatibilityTestCompleted, setCompatibilityTestCompleted] =
    useState(false);
  const [checkingQuizStatus, setCheckingQuizStatus] = useState(true);

  const [locationOptions, setLocationOptions] = useState({
    countries: [],
    states: [],
    cities: []
  });
  const [religionOptions, setReligionOptions] = useState([]);
  const [casteOptions, setCasteOptions] = useState([]);

  // Filter states
  const [filters, setFilters] = useState({
    matchQuality: "all",
    hasRedFlags: "all",
    minAge: 18,
    maxAge: 40,
    country: "all",
    state: "all",
    city: "all",
    religion: "all",
    caste: "all",
    lookingFor: "all",
    educationLevel: "all",
    jobTitle: "all",
    languages: [],
    minHeight: 0,
    maxHeight: 250,
    minWeight: 0,
    maxWeight: 150,
    income: "all",
    isVerified: false,
  });

  const [filterOptions, setFilterOptions] = useState({
    countries: [],
  });


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

  useEffect(() => {
    const fetchReligionOptions = async () => {
      try {
        const response = await fetch('/api/religions');
        const data = await response.json();
        
        if (data.success) {
          setReligionOptions(data.data.map(religion => ({
            value: religion.id,
            label: religion.name
          })));
        }
      } catch (error) {
        console.error('Error fetching religions:', error);
      }
    };

    fetchReligionOptions();
  }, []);

  // Add this useEffect to fetch caste options when religion is selected
  useEffect(() => {
    const fetchCasteOptions = async () => {
      if (filters.religion && filters.religion !== 'all') {
        try {
          // Find religion name from ID
          const religion = religionOptions.find(r => r.value === parseInt(filters.religion));
          if (religion) {
            const response = await fetch(`/api/castes?religion=${encodeURIComponent(religion.label)}`);
            const data = await response.json();
            
            if (data.success) {
              setCasteOptions(data.data.map(caste => ({
                value: caste.id,
                label: caste.name
              })));
            }
          }
        } catch (error) {
          console.error('Error fetching castes:', error);
          setCasteOptions([]);
        }
      } else {
        setCasteOptions([]);
      }
    };

    fetchCasteOptions();
  }, [filters.religion, religionOptions]);

  // Add this useEffect to populate location options from country-state-city
  useEffect(() => {
    const { Country, State, City } = require('country-state-city');
    
    setLocationOptions({
      countries: Country.getAllCountries().map(country => ({
        value: country.isoCode,
        label: country.name
      })),
      states: filters.country && filters.country !== 'all' 
        ? State.getStatesOfCountry(filters.country).map(state => ({
            value: state.isoCode,
            label: state.name
          }))
        : [],
      cities: filters.state && filters.state !== 'all' 
        ? City.getCitiesOfState(filters.country, filters.state).map(city => ({
            value: city.name,
            label: city.name
          }))
        : []
    });
  }, [filters.country, filters.state]);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      if (!token) return;

      try {
        const response = await fetch("/api/matches/filter-options", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (data.success) {
          setDynamicFilterOptions(data.filterOptions);
          // Update age range defaults
          setFilters((prev) => ({
            ...prev,
            minAge: data.filterOptions.ranges.age.default.min,
            maxAge: data.filterOptions.ranges.age.default.max,
          }));
        }
      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    };

    fetchFilterOptions();
  }, [token]);
  // Fetch matches from API
  
  useEffect(() => {
    const fetchMatches = async () => {
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        setLoading(true);
        
        // Build query parameters from filters
        const queryParams = new URLSearchParams();
        
        if (filters.minAge) queryParams.append('minAge', filters.minAge);
        if (filters.maxAge) queryParams.append('maxAge', filters.maxAge);
        if (filters.country !== 'all') queryParams.append('country', filters.country);
        if (filters.state !== 'all') queryParams.append('state', filters.state);
        if (filters.city !== 'all') queryParams.append('city', filters.city);
        if (filters.religion !== 'all') queryParams.append('religion', filters.religion);
        if (filters.caste !== 'all') queryParams.append('caste', filters.caste);
        if (filters.minHeight > 0) queryParams.append('minHeight', filters.minHeight);
        if (filters.maxHeight < 250) queryParams.append('maxHeight', filters.maxHeight);
        if (filters.minWeight > 0) queryParams.append('minWeight', filters.minWeight);
        if (filters.maxWeight < 150) queryParams.append('maxWeight', filters.maxWeight);
        if (filters.isVerified) queryParams.append('isVerified', 'true');
        if (filters.matchQuality !== 'all') queryParams.append('matchQuality', filters.matchQuality);

        const response = await fetch(`/api/matches/top-soulmates?${queryParams.toString()}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (data.success) {
          setMatches(data.matches);
          setFilteredMatches(data.matches); // Both will be the same now
          setUserPlan(data.userPlan || "free");
          setHasCompletedCompatibilityTest(
            data.hasCompletedCompatibilityTest || false
          );
          setMatchingType(data.matchingType || "personality");

          // Load saved profiles
          const saved = JSON.parse(
            localStorage.getItem("savedProfiles") || "[]"
          );
          setSavedProfiles(saved);
        } else {
          setError(data.message || "Failed to fetch matches");
        }
      } catch (err) {
        console.error("Error fetching matches:", err);
        setError("Failed to load matches. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [token, router, filters]); // ADD filters as dependency

  // Check quiz completion status
  useEffect(() => {
    const checkQuizStatus = async () => {
      if (!token) return;

      try {
        setCheckingQuizStatus(true);
        const response = await fetch("/api/user/quiz-status", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (data.success) {
          setCompatibilityTestCompleted(data.compatibilityCompleted);
        }
      } catch (err) {
        console.error("Error checking quiz status:", err);
      } finally {
        setCheckingQuizStatus(false);
      }
    };

    checkQuizStatus();
  }, [token]);

  // // Apply filters
  // useEffect(() => {
  //   let result = [...matches];

  //   if (filters.matchQuality !== "all") {
  //     result = result.filter(
  //       (match) => match.matchQuality === filters.matchQuality
  //     );
  //   }

  //   // if (filters.country !== "all") {
  //   //   result = result.filter((match) => match.country === filters.country);
  //   // }

  //   // if (filters.state !== "all") {
  //   //   result = result.filter((match) => match.state === filters.state);
  //   // }

  //   // if (filters.city !== "all") {
  //   //   result = result.filter((match) => match.city === filters.city);
  //   // }

  //   // if (filters.religion !== "all") {
  //   //   result = result.filter((match) => match.religion === filters.religion);
  //   // }

  //   // if (filters.caste !== "all") {
  //   //   result = result.filter((match) => match.caste === filters.caste);
  //   // }

  //   // In your useEffect that applies filters, update the filtering logic:

  //   // Country filter (using both country code and country name)
  //   if (filters.country !== "all") {
  //     result = result.filter((match) => {
  //       // Check if match has country_code (new structure) or country (old structure)
  //       const matchCountry = match.country_code || match.country;
  //       return matchCountry === filters.country;
  //     });
  //   }

  //   // State filter
  //   if (filters.state !== "all") {
  //     result = result.filter((match) => {
  //       const matchState = match.state_code || match.state;
  //       return matchState === filters.state;
  //     });
  //   }

  //   // City filter
  //   if (filters.city !== "all") {
  //     result = result.filter((match) => match.city === filters.city);
  //   }

  //   // Religion filter (using religion_id)
  //   if (filters.religion !== "all") {
  //     result = result.filter((match) => 
  //       match.religion_id === parseInt(filters.religion)
  //     );
  //   }

  //   // Caste filter (using caste_id)
  //   if (filters.caste !== "all") {
  //     result = result.filter((match) => 
  //       match.caste_id === parseInt(filters.caste)
  //     );
  //   }

  //   if (filters.lookingFor !== "all") {
  //     result = result.filter(
  //       (match) => match.lookingFor === filters.lookingFor
  //     );
  //   }

  //   // Age range
  //   result = result.filter(
  //     (match) => match.age >= filters.minAge && match.age <= filters.maxAge
  //   );

  //   // Height range (if available)
  //   if (filters.minHeight > 0) {
  //     result = result.filter(
  //       (match) =>
  //         match.height >= filters.minHeight && match.height <= filters.maxHeight
  //     );
  //   }

  //   // Weight range (if available)
  //   if (filters.minWeight > 0) {
  //     result = result.filter(
  //       (match) =>
  //         match.weight >= filters.minWeight && match.weight <= filters.maxWeight
  //     );
  //   }

  //   if (filters.isVerified) {
  //     result = result.filter((match) => match.isProfileVerified);
  //   }

  //   setFilteredMatches(result);
  // }, [filters, matches]);

  const toggleSaveProfile = (userId) => {
    setSavedProfiles((prev) => {
      const newSaved = prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId];

      localStorage.setItem("savedProfiles", JSON.stringify(newSaved));
      return newSaved;
    });
  };

  const resetFilters = () => {
    setFilters({
      matchQuality: "all",
      hasRedFlags: "all",
      minAge: dynamicFilterOptions?.ranges.age.default.min || 18,
      maxAge: dynamicFilterOptions?.ranges.age.default.max || 40,
      country: "all",
      state: "all",
      city: "all",
      religion: "all",
      caste: "all",
      lookingFor: "all",
      educationLevel: "all",
      jobTitle: "all",
      languages: [],
      minHeight: dynamicFilterOptions?.ranges.height.default.min || 0,
      maxHeight: dynamicFilterOptions?.ranges.height.default.max || 250,
      minWeight: dynamicFilterOptions?.ranges.weight.default.min || 0,
      maxWeight: dynamicFilterOptions?.ranges.weight.default.max || 150,
      income: "all",
      isVerified: false,
    });
    setCasteOptions([]);
  };

  const handleProtectedAction = (action) => {
    if (!compatibilityTestCompleted) {
      setShowCompatibilityModal(true);
      return false;
    }
    action();
    return true;
  };

  const handleTakeCompatibilityTest = () => {
    setShowCompatibilityModal(false);
    router.push("/compatability-quiz");
  };

  const getQualityColor = (quality) => {
    switch (quality) {
      case "exceptional":
        return "from-emerald-500 to-green-600";
      case "great":
        return "from-blue-500 to-indigo-600";
      case "good":
        return "from-amber-500 to-orange-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getQualityText = (quality) => {
    switch (quality) {
      case "exceptional":
        return "Perfect Match";
      case "great":
        return "Great Match";
      case "good":
        return "Good Match";
      default:
        return "Match";
    }
  };

  const getPlanIcon = (plan) => {
    switch (plan) {
      case "elite":
        return <Crown className="h-5 w-5" />;
      case "pro":
        return <Zap className="h-5 w-5" />;
      default:
        return <Heart className="h-5 w-5" />;
    }
  };

  const getPlanColor = (plan) => {
    switch (plan) {
      case "elite":
        return "from-purple-500 to-indigo-600";
      case "pro":
        return "from-rose-500 to-red-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };


  if (loading || checkingQuizStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl max-w-sm w-full"
        >
          <div className="flex flex-col items-center">
            <div className="relative mb-6">
              <Loader2 className="h-12 w-12 text-white animate-spin" />
              <Heart className="h-6 w-6 text-white absolute top-3 left-3 animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              {checkingQuizStatus
                ? "Checking Your Status"
                : "Finding Your Perfect Matches"}
            </h2>
            <p className="text-white/80 text-sm text-center">
              {checkingQuizStatus
                ? "Verifying quiz completion..."
                : "Analyzing compatibility and personality traits..."}
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl max-w-md w-full text-center"
        >
          <AlertTriangle className="h-16 w-16 text-white mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-white/80 mb-6">{error}</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.reload()}
            className="bg-white text-rose-600 px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors shadow-lg"
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-400 via-pink-500 to-purple-600">
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
              <Heart className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              {matchingType === "compatibility"
                ? "Your Soulmates"
                : "Your Perfect Matches"}
            </h1>
          </div>
          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-6">
            {matchingType === "compatibility"
              ? "Discover your most compatible matches based on our advanced compatibility algorithm"
              : "Find amazing people with personalities that complement yours perfectly"}
          </p>

          {/* Plan Status Banner */}
          <div className="flex items-center justify-center space-x-4 mb-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className={`bg-gradient-to-r ${getPlanColor(
                userPlan
              )} px-6 py-3 rounded-full text-white font-semibold flex items-center shadow-lg`}
            >
              {getPlanIcon(userPlan)}
              <span className="ml-2 capitalize">{userPlan} Plan</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2"
            >
              <span className="text-white font-medium">
                {matchingType === "compatibility"
                  ? "Advanced Matching"
                  : "Personality Based"}
              </span>
            </motion.div>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <span className="text-white font-medium">
                {matches.length} Total Matches
              </span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <span className="text-white font-medium">
                {filteredMatches.length} Showing
              </span>
            </div>
          </div>
        </motion.div>

        {/* Plan-based CTA Section */}
        <AnimatePresence>
          {userPlan === "free" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-lg rounded-2xl p-6 border border-amber-300/30">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="flex items-center mb-4 md:mb-0">
                    <div className="bg-amber-500/20 rounded-full p-3 mr-4">
                      <TrendingUp className="h-6 w-6 text-amber-300" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">
                        Unlock Better Matches!
                      </h3>
                      <p className="text-white/80 text-sm">
                        Upgrade to Pro or Elite for advanced compatibility
                        matching and unlimited connections
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push("/plan-switcher")}
                      className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center shadow-lg"
                    >
                      <Crown className="h-5 w-5 mr-2" />
                      Upgrade Now
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {userPlan !== "free" && !hasCompletedCompatibilityTest && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-lg rounded-2xl p-6 border border-blue-300/30">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="flex items-center mb-4 md:mb-0">
                    <div className="bg-blue-500/20 rounded-full p-3 mr-4">
                      <Target className="h-6 w-6 text-blue-300" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">
                        Unlock Advanced Matching!
                      </h3>
                      <p className="text-white/80 text-sm">
                        Take our compatibility quiz to find your perfect
                        soulmates with precision matching
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push("/compatability-quiz")}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center shadow-lg"
                    >
                      <Sparkles className="h-5 w-5 mr-2" />
                      Take Quiz
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() =>
                handleProtectedAction(() => setShowFilters(!showFilters))
              }
              className="flex items-center bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg"
            >
              <Filter className="h-5 w-5 mr-2" />
              {showFilters ? "Hide Filters" : "Show Filters"}
              <ChevronDown
                className={`h-4 w-4 ml-2 transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </motion.button>

            {showFilters && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={resetFilters}
                className="text-white/80 hover:text-white text-sm font-medium flex items-center"
              >
                <X className="h-4 w-4 mr-1" />
                Reset All
              </motion.button>
            )}
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Match Quality Filter */}
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Match Quality
                    </label>
                    <select
                      value={filters.matchQuality}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          matchQuality: e.target.value,
                        }))
                      }
                      className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-white/50 focus:border-transparent"
                    >
                      <option value="all" className="text-gray-800">
                        All Qualities
                      </option>
                      <option value="exceptional" className="text-gray-800">
                        Perfect Match (80%+)
                      </option>
                      <option value="great" className="text-gray-800">
                        Great Match (60-79%)
                      </option>
                      <option value="good" className="text-gray-800">
                        Good Match (&lt;60%)
                      </option>
                    </select>
                  </div>

                  {/* Country Filter - Updated */}
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Country
                    </label>
                    <select
                      value={filters.country}
                      onChange={(e) => {
                        setFilters(prev => ({
                          ...prev,
                          country: e.target.value,
                          state: 'all', // Reset state when country changes
                          city: 'all'   // Reset city when country changes
                        }));
                      }}
                      className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-white/50 focus:border-transparent"
                    >
                      <option value="all" className="text-gray-800">All Countries</option>
                      {locationOptions.countries.map((country) => (
                        <option
                          key={country.value}
                          value={country.value}
                          className="text-gray-800"
                        >
                          {country.label}
                        </option>
                      ))}
                      {/* Fallback to database countries */}
                      {dynamicFilterOptions?.locations.dbCountries.map((country) => (
                        <option
                          key={`db-${country}`}
                          value={country}
                          className="text-gray-800"
                        >
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* State Filter - Updated */}
                  <div>
                    <label className="block text-white font-medium mb-2">
                      State
                    </label>
                    <select
                      value={filters.state}
                      onChange={(e) => {
                        setFilters(prev => ({
                          ...prev,
                          state: e.target.value,
                          city: 'all' // Reset city when state changes
                        }));
                      }}
                      disabled={!filters.country || filters.country === 'all'}
                      className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-white/50 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="all" className="text-gray-800">
                        {filters.country && filters.country !== 'all' ? 'All States' : 'Select Country First'}
                      </option>
                      {locationOptions.states.map((state) => (
                        <option
                          key={state.value}
                          value={state.value}
                          className="text-gray-800"
                        >
                          {state.label}
                        </option>
                      ))}
                      {/* Fallback to database states */}
                      {dynamicFilterOptions?.locations.dbStates.map((state) => (
                        <option
                          key={`db-${state}`}
                          value={state}
                          className="text-gray-800"
                        >
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* City Filter - Updated */}
                  <div>
                    <label className="block text-white font-medium mb-2">
                      City
                    </label>
                    <select
                      value={filters.city}
                      onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                      disabled={!filters.state || filters.state === 'all'}
                      className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-white/50 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="all" className="text-gray-800">
                        {filters.state && filters.state !== 'all' ? 'All Cities' : 'Select State First'}
                      </option>
                      {locationOptions.cities.map((city) => (
                        <option
                          key={city.value}
                          value={city.value}
                          className="text-gray-800"
                        >
                          {city.label}
                        </option>
                      ))}
                      {/* Fallback to database cities */}
                      {dynamicFilterOptions?.locations.dbCities.map((city) => (
                        <option
                          key={`db-${city}`}
                          value={city}
                          className="text-gray-800"
                        >
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Religion Filter - Updated */}
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Religion
                    </label>
                    <select
                      value={filters.religion}
                      onChange={(e) => {
                        setFilters(prev => ({
                          ...prev,
                          religion: e.target.value,
                          caste: 'all' // Reset caste when religion changes
                        }));
                      }}
                      className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-white/50 focus:border-transparent"
                    >
                      <option value="all" className="text-gray-800">All Religions</option>
                      {religionOptions.map((religion) => (
                        <option
                          key={religion.value}
                          value={religion.value}
                          className="text-gray-800"
                        >
                          {religion.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Caste Filter - Updated */}
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Caste/Denomination
                    </label>
                    <select
                      value={filters.caste}
                      onChange={(e) => setFilters(prev => ({ ...prev, caste: e.target.value }))}
                      disabled={!filters.religion || filters.religion === 'all'}
                      className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-white/50 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="all" className="text-gray-800">
                        {filters.religion && filters.religion !== 'all' ? 'All Castes' : 'Select Religion First'}
                      </option>
                      {casteOptions.map((caste) => (
                        <option
                          key={caste.value}
                          value={caste.value}
                          className="text-gray-800"
                        >
                          {caste.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Verified Profiles */}
                  <div className="flex items-center justify-center">
                    <label className="flex items-center text-white font-medium">
                      <input
                        type="checkbox"
                        checked={filters.isVerified}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            isVerified: e.target.checked,
                          }))
                        }
                        className="mr-3 rounded border-white/30 text-white focus:ring-white/50 bg-white/20"
                      />
                      <Shield className="h-5 w-5 mr-2" />
                      Verified profiles only
                    </label>
                  </div>

                  {/* Age Range */}
                  <div className="md:col-span-2">
                    <label className="block text-white font-medium mb-2">
                      Age Range: {filters.minAge} - {filters.maxAge} years
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="18"
                        max="60"
                        value={filters.minAge}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            minAge: parseInt(e.target.value),
                          }))
                        }
                        className="flex-1 accent-white"
                      />
                      <span className="text-white text-sm">to</span>
                      <input
                        type="range"
                        min="18"
                        max="60"
                        value={filters.maxAge}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            maxAge: parseInt(e.target.value),
                          }))
                        }
                        className="flex-1 accent-white"
                      />
                    </div>
                  </div>
                  {/* State Filter */}
                  {/* <div>
                    <label className="block text-white font-medium mb-2">
                      State
                    </label>
                    <select
                      value={filters.state}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          state: e.target.value,
                        }))
                      }
                      className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl px-4 py-3"
                    >
                      <option value="all" className="text-gray-800">
                        All States
                      </option>
                      {dynamicFilterOptions?.locations.states.map((state) => (
                        <option
                          key={state}
                          value={state}
                          className="text-gray-800"
                        >
                          {state}
                        </option>
                      ))}
                    </select>
                  </div> */}

                  {/* City Filter */}
                  {/* <div>
                    <label className="block text-white font-medium mb-2">
                      City
                    </label>
                    <select
                      value={filters.city}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                      className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl px-4 py-3"
                    >
                      <option value="all" className="text-gray-800">
                        All Cities
                      </option>
                      {dynamicFilterOptions?.locations.cities.map((city) => (
                        <option
                          key={city}
                          value={city}
                          className="text-gray-800"
                        >
                          {city}
                        </option>
                      ))}
                    </select>
                  </div> */}

                  {/* Height Range */}
                  <div className="md:col-span-2">
                    <label className="block text-white font-medium mb-2">
                      Height Range: {filters.minHeight} - {filters.maxHeight} cm
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min={dynamicFilterOptions?.ranges.height.min || 140}
                        max={dynamicFilterOptions?.ranges.height.max || 200}
                        value={filters.minHeight}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            minHeight: parseInt(e.target.value),
                          }))
                        }
                        className="flex-1 accent-white"
                      />
                      <span className="text-white text-sm">to</span>
                      <input
                        type="range"
                        min={dynamicFilterOptions?.ranges.height.min || 140}
                        max={dynamicFilterOptions?.ranges.height.max || 200}
                        value={filters.maxHeight}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            maxHeight: parseInt(e.target.value),
                          }))
                        }
                        className="flex-1 accent-white"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Matches Grid */}
        <AnimatePresence>
          {filteredMatches.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredMatches.map((match, index) => (
                <motion.div
                  key={match.id}
                  variants={cardVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group bg-white/10 backdrop-blur-lg rounded-3xl overflow-hidden shadow-xl border border-white/20 hover:bg-white/15 transition-all duration-300"
                >
                  {/* Image Section */}
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={
                        match.profileImageUrl
                          ? `${BASE_IMAGE_URL}${match.profileImageUrl}`
                          : getDefaultImage(match.gender)
                      }
                      alt={match.username}
                      width={400}
                      height={256}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* Overlay with rank and save button */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent">
                      <div className="absolute top-4 left-4 flex items-center space-x-2">
                        {index < 3 && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-lg"
                          >
                            #{index + 1}
                          </motion.div>
                        )}
                        <div
                          className={`bg-gradient-to-r ${getQualityColor(
                            match.matchQuality
                          )} text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg`}
                        >
                          {getQualityText(match.matchQuality)}
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          handleProtectedAction(() =>
                            toggleSaveProfile(match.id)
                          )
                        }
                        className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                      >
                        {savedProfiles.includes(match.id) ? (
                          <BookmarkCheck className="h-5 w-5 text-white" />
                        ) : (
                          <Bookmark className="h-5 w-5 text-white" />
                        )}
                      </motion.button>

                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-white">
                              {match.username}
                            </h3>
                            <div className="flex items-center text-white/90 text-sm mt-1">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>{match.age} years old</span>
                            </div>
                          </div>
                          {match.compatibilityScore && (
                            <div className="text-right">
                              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                                <div className="flex items-center text-white">
                                  <Sparkles className="h-4 w-4 mr-1" />
                                  <span className="font-bold">
                                    {match.compatibilityScore}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6">
                    {/* Location and Status */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-white/80 text-sm">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>
                          {match.city
                            ? `${match.city}, ${match.country}`
                            : match.country || "Location not shared"}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {match.isProfileVerified && (
                          <div className="bg-blue-500/20 backdrop-blur-sm rounded-full px-3 py-1 flex items-center">
                            <Verified className="h-3 w-3 text-blue-400 mr-1" />
                            <span className="text-blue-400 text-xs font-medium">
                              Verified
                            </span>
                          </div>
                        )}

                        {match.hasRedFlags && (
                          <div className="bg-red-500/20 backdrop-blur-sm rounded-full px-3 py-1 flex items-center">
                            <AlertTriangle className="h-3 w-3 text-red-400 mr-1" />
                            <span className="text-red-400 text-xs font-medium">
                              Red Flags
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="space-y-2 mb-4">
                      {match.job && (
                        <div className="flex items-center text-white/80 text-sm">
                          <Briefcase className="h-4 w-4 mr-2" />
                          <span>
                            {match.job.title}
                            {match.job.company && ` at ${match.job.company}`}
                          </span>
                        </div>
                      )}

                      {match.education && (
                        <div className="flex items-center text-white/80 text-sm">
                          <GraduationCap className="h-4 w-4 mr-2" />
                          <span>
                            {match.education.degree} in{" "}
                            {match.education.levelName}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          handleProtectedAction(() =>
                            router.push(`/profile/${match.id}/view-profile`)
                          )
                        }
                        className="flex items-center justify-center bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white py-3 px-4 rounded-xl font-medium transition-all border border-white/30"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">View Profile</span>
                        <span className="sm:hidden">View</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          handleProtectedAction(() =>
                            router.push(
                              `/compatibility-check?userId=${encodeURIComponent(
                                encryptText(String(match.id))
                              )}`
                            )
                          )
                        }
                        className="flex items-center justify-center bg-white text-purple-600 hover:bg-gray-100 py-3 px-4 rounded-xl font-medium transition-all shadow-lg"
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Details</span>
                        <span className="sm:hidden">Info</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md mx-auto">
                <Users className="h-16 w-16 text-white/60 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">
                  No matches found
                </h3>
                <p className="text-white/80 mb-6">
                  {matches.length === 0
                    ? "Complete your personality quiz to find your perfect matches!"
                    : "Try adjusting your filters to see more matches."}
                </p>

                {matches.length === 0 ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push("/quiz-section/1")}
                    className="bg-white text-purple-600 px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors shadow-lg"
                  >
                    Take Personality Quiz
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={resetFilters}
                    className="bg-white text-purple-600 px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors shadow-lg"
                  >
                    Reset Filters
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Compatibility Test Modal */}
      <AnimatePresence>
        {showCompatibilityModal && (
          <CompatibilityTestModal
            isOpen={showCompatibilityModal}
            onClose={() => setShowCompatibilityModal(false)}
            onTakeTest={handleTakeCompatibilityTest}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
