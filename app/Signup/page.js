"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Eye, 
  EyeOff, 
  Calendar, 
  User, 
  Lock, 
  ArrowRight, 
  ArrowLeft,
  Heart, 
  Check, 
  Sparkles,
  Star,
  UserCheck,
  Wine,
  Cigarette,
  Utensils,
  Dumbbell,
  Baby,
  PawPrint,
  Filter,
  AlertCircle,
  Loader2
} from "lucide-react";
import GlobalApi from "@/app/_services/GlobalApi";
import { encryptText, decryptText } from "@/utils/encryption";
import toast, { Toaster } from "react-hot-toast";

const ModernSignup = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [inviteUserId, setInviteUserId] = useState('');
  const [preferences, setPreferences] = useState({});
  const [saveMessage, setSaveMessage] = useState(null);
  const [errors, setErrors] = useState({});
  const [preferenceCategories, setPreferenceCategories] = useState([]);
  const [optionsByCategory, setOptionsByCategory] = useState({});
  
  // Form data state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    gender: ''
  });

  // Fetch preference categories on component mount
  useEffect(() => {
    const fetchPreferenceCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await GlobalApi.GetPreferenceCategoriesForSignup();
        
        if (response.data.success) {
          setPreferenceCategories(response.data.categories);
          setOptionsByCategory(response.data.optionsByCategory);
        } else {
          toast.error("Failed to load preference options");
        }
      } catch (error) {
        console.error("Error fetching preference categories:", error);
        toast.error("Failed to load preference options");
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchPreferenceCategories();
  }, []);

  // Handle URL parameters for invite
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.has('userId')) {
        const encryptedUserId = searchParams.get('userId');
        try {
          const decryptedUserId = decryptText(encryptedUserId);
          if (decryptedUserId) {
            setInviteUserId(decryptedUserId);
          }
        } catch (error) {
          console.error("Error decrypting invite user ID:", error);
        }
      }
    }
  }, []);

  // Memoize the icon function to prevent re-creation
  const getCategoryIcon = useCallback((categoryName) => {
    const icons = {
      looking_for: <Heart className="h-5 w-5" />,
      gender: <User className="h-5 w-5" />,
      smoking: <Cigarette className="h-5 w-5" />,
      drinking: <Wine className="h-5 w-5" />,
      diet: <Utensils className="h-5 w-5" />,
      exercise: <Dumbbell className="h-5 w-5" />,
      children: <Baby className="h-5 w-5" />,
      pets: <PawPrint className="h-5 w-5" />,
      relationship_type: <Sparkles className="h-5 w-5" />
    };
    return icons[categoryName] || <Filter className="h-5 w-5" />;
  }, []);

  // Memoize input change handler to prevent re-creation
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field
    setErrors(prev => {
      if (prev[field]) {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
      return prev;
    });
  }, []);

  // Memoize preference change handler
  const handlePreferenceChange = useCallback((categoryId, optionId) => {
    setPreferences(prev => ({
      ...prev,
      [categoryId]: optionId
    }));
  }, []);

  // Memoize validation function
  const validateStep1 = useCallback(() => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/(?=.*[!@#$%^&*])/.test(formData.password)) {
      newErrors.password = "Password must contain at least one special character";
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    if (!formData.birthDate) {
      newErrors.birthDate = "Date of birth is required";
    } else {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (age < 18 || (age === 18 && monthDiff < 0) || 
          (age === 18 && monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        newErrors.birthDate = "You must be at least 18 years old";
      }
    }
    
    if (!formData.gender) {
      newErrors.gender = "Please select your gender";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Memoize continue handler
  const handleContinue = useCallback(() => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  }, [validateStep1]);

  // Memoize submit handler
  const handleSubmit = useCallback(async () => {
    try {
      setIsLoading(true);
      setSaveMessage(null);
      
      // Encrypt password before sending
      const encryptedPassword = encryptText(formData.password);
      
      const signupData = {
        username: formData.username,
        password: encryptedPassword,
        birthDate: formData.birthDate,
        gender: formData.gender,
        preferences: preferences,
        inviteUserId: inviteUserId || null
      };

      const response = await GlobalApi.CreateUserWithPreferences(signupData);
      
      if (response.data.success) {
        const { token } = response.data.data;
        localStorage.setItem("token", token);
        
        setSaveMessage({ type: 'success', text: 'Account created successfully!' });
        toast.success("Welcome to Qoupled! Account created successfully!");
        
        // Handle invitation if present
        if (inviteUserId) {
          try {
            await GlobalApi.SaveInvitation(inviteUserId, token);
          } catch (inviteError) {
            console.warn("Failed to save invitation:", inviteError);
          }
        }
        
        // Redirect after success
        setTimeout(() => {
          router.push("/tests");
        }, 1500);
      } else {
        const errorMessage = response.data?.message || "Failed to create account.";
        setSaveMessage({ type: 'error', text: errorMessage });
        toast.error(`Error: ${errorMessage}`);
      }

    } catch (error) {
      console.error("Signup error:", error);
      let errorMessage = "Failed to create account. Please try again.";
      
      if (error.response) {
        errorMessage = error.response.data?.message || error.message;
      } else {
        errorMessage = error.message;
      }
      
      setSaveMessage({ type: 'error', text: errorMessage });
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [formData, preferences, inviteUserId, router]);

  // Memoize password toggle handlers
  const toggleShowPassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const toggleShowConfirmPassword = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  // Create encrypted invite URL for login link
  const encryptedInviteUserId = useMemo(() => {
    return inviteUserId ? encryptText(inviteUserId) : "";
  }, [inviteUserId]);

  // Memoize step indicator to prevent re-renders
  const StepIndicator = useMemo(() => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
          currentStep >= 1 ? 'bg-rose-500 text-white shadow-lg scale-110' : 'bg-gray-200 text-gray-500'
        }`}>
          {currentStep > 1 ? <Check className="h-5 w-5" /> : '1'}
        </div>
        <div className={`w-16 h-1 mx-3 rounded-full transition-all duration-500 ${
          currentStep >= 2 ? 'bg-gradient-to-r from-rose-400 to-red-500' : 'bg-gray-200'
        }`}></div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
          currentStep >= 2 ? 'bg-rose-500 text-white shadow-lg scale-110' : 'bg-gray-200 text-gray-500'
        }`}>
          {currentStep > 2 ? <Check className="h-5 w-5" /> : '2'}
        </div>
      </div>
    </div>
  ), [currentStep]);

  // Memoize input components to prevent re-creation
  const UsernameInput = useMemo(() => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Username
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <User className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={formData.username}
          onChange={(e) => handleInputChange('username', e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
          placeholder="Choose a unique username"
        />
      </div>
      {errors.username && <p className="text-red-500 text-sm mt-2 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errors.username}</p>}
    </div>
  ), [formData.username, errors.username, handleInputChange]);

  const PasswordInput = useMemo(() => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Password
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Lock className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type={showPassword ? "text" : "password"}
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
          placeholder="Create a strong password"
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          onClick={toggleShowPassword}
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      {errors.password && <p className="text-red-500 text-sm mt-2 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errors.password}</p>}
    </div>
  ), [formData.password, errors.password, showPassword, handleInputChange, toggleShowPassword]);

  const ConfirmPasswordInput = useMemo(() => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Confirm Password
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Lock className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type={showConfirmPassword ? "text" : "password"}
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
          className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
          placeholder="Confirm your password"
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          onClick={toggleShowConfirmPassword}
        >
          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      {errors.confirmPassword && <p className="text-red-500 text-sm mt-2 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errors.confirmPassword}</p>}
    </div>
  ), [formData.confirmPassword, errors.confirmPassword, showConfirmPassword, handleInputChange, toggleShowConfirmPassword]);

  const BirthDateInput = useMemo(() => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Date of Birth
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Calendar className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="date"
          value={formData.birthDate}
          onChange={(e) => handleInputChange('birthDate', e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200 text-gray-800"
        />
      </div>
      {errors.birthDate && <p className="text-red-500 text-sm mt-2 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errors.birthDate}</p>}
      <p className="text-xs text-gray-500 mt-2">You must be at least 18 years old</p>
    </div>
  ), [formData.birthDate, errors.birthDate, handleInputChange]);

  const GenderSelect = useMemo(() => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Gender
      </label>
      <select
        value={formData.gender}
        onChange={(e) => handleInputChange('gender', e.target.value)}
        className="w-full py-4 px-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200 text-gray-800"
      >
        <option value="">Select your gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>
      {errors.gender && <p className="text-red-500 text-sm mt-2 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{errors.gender}</p>}
    </div>
  ), [formData.gender, errors.gender, handleInputChange]);

  const StepOne = useMemo(() => (
    <div className="space-y-6">
      {UsernameInput}
      {PasswordInput}
      {ConfirmPasswordInput}
      {BirthDateInput}
      {GenderSelect}
    </div>
  ), [UsernameInput, PasswordInput, ConfirmPasswordInput, BirthDateInput, GenderSelect]);

  const StepTwo = useMemo(() => {
    if (categoriesLoading) {
      return (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="h-8 w-8 text-rose-500 animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Loading preferences...</h3>
            <p className="text-sm text-gray-500">Please wait while we fetch your options</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-rose-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Tell us about yourself</h3>
          <p className="text-sm text-gray-500">This helps us find your perfect match</p>
        </div>

        <div className="space-y-6">
          {preferenceCategories.map(category => (
            <div key={category.id} className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-rose-500 to-red-500 rounded-xl flex items-center justify-center text-white">
                  {getCategoryIcon(category.name)}
                </div>
                <label className="text-base font-semibold text-gray-800">
                  {category.display_name}
                </label>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {optionsByCategory[category.id]?.map(option => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handlePreferenceChange(category.id, option.id)}
                    className={`
                      p-4 rounded-xl border-2 text-left transition-all duration-200 group hover:scale-[1.02]
                      ${preferences[category.id] === option.id 
                        ? 'border-rose-500 bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 shadow-lg' 
                        : 'border-gray-300 bg-white hover:border-rose-300 hover:bg-rose-50 hover:shadow-md text-gray-800'}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold">
                        {option.display_value}
                      </span>
                      {preferences[category.id] === option.id && (
                        <div className="w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {saveMessage && (
          <div className={`p-4 rounded-xl border-2 ${
            saveMessage.type === 'success' 
              ? 'bg-green-50 text-green-800 border-green-200' 
              : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            <div className="flex items-center">
              {saveMessage.type === 'success' 
                ? <Check className="h-5 w-5 mr-3 text-green-600" /> 
                : <AlertCircle className="h-5 w-5 mr-3 text-red-600" />}
              <p className="text-sm font-medium">{saveMessage.text}</p>
            </div>
          </div>
        )}
      </div>
    );
  }, [categoriesLoading, preferenceCategories, optionsByCategory, getCategoryIcon, handlePreferenceChange, preferences, saveMessage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-400 via-red-500 to-pink-600 flex items-center justify-center p-4">
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
      
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-500 to-red-600 px-8 py-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-600/20 to-red-700/20"></div>
          <div className="relative z-10">
            <div className="flex justify-center items-center mb-4">
              <Heart className="w-10 h-10 text-white mr-3" />
              <h1 className="text-3xl font-bold text-white">Qoupled</h1>
            </div>
            <h2 className="text-xl font-medium text-white/95 mb-2">
              {currentStep === 1 ? "Create Your Account" : "Complete Your Profile"}
            </h2>
            <p className="text-sm text-white/80">
              {currentStep === 1 ? "Join thousands finding love" : "Help us find your perfect match"}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-10">
          {StepIndicator}
          
          {currentStep === 1 ? StepOne : StepTwo}
          
          {/* Action Buttons */}
          <div className="mt-10 space-y-4">
            {currentStep === 2 && (
              <button
                onClick={() => setCurrentStep(1)}
                disabled={isLoading}
                className="w-full flex items-center justify-center py-4 px-6 border-2 border-gray-300 rounded-2xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Basic Info
              </button>
            )}
            
            <button
              onClick={currentStep === 1 ? handleContinue : handleSubmit}
              disabled={isLoading || categoriesLoading || (currentStep === 2 && Object.keys(preferences).length === 0)}
              className="w-full bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold py-4 px-6 rounded-2xl hover:from-rose-600 hover:to-red-700 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin mr-3" />
                  Creating Account...
                </>
              ) : currentStep === 1 ? (
                <>
                  Continue to Preferences
                  <ArrowRight className="ml-3 h-5 w-5" />
                </>
              ) : (
                <>
                  <Star className="mr-3 h-5 w-5" />
                  Complete Signup
                </>
              )}
            </button>
          </div>

          {/* Login Link */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href={inviteUserId ? `/login?userId=${encryptedInviteUserId}` : '/login'}
                className="text-rose-600 font-semibold hover:text-rose-700 transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernSignup;