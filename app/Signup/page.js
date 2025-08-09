"use client"

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Eye, 
  EyeOff, 
  Calendar, 
  User, 
  Lock, 
  ArrowRight, 
  Heart, 
  Sparkles,
  AlertCircle,
  Loader2,
  Phone,
  Mail,
  MapPin,
  Globe,
  Ruler,
  Scale,
  DollarSign,
  Church
} from "lucide-react";
import GlobalApi from "@/app/_services/GlobalApi";
import { encryptText } from "@/utils/encryption";
import toast, { Toaster } from "react-hot-toast";

const ModernSignup = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentSection, setCurrentSection] = useState(0);
  
  // Form data state
  const [formData, setFormData] = useState({
    // Basic Info
    username: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    gender: '',
    
    // Contact Info
    phone: '',
    email: '',
    
    // Location Info
    country: '',
    state: '',
    city: '',
    
    // Personal Info
    religion: '',
    caste: '',
    height: '',
    weight: '',
    income: ''
  });

  // Form sections for better UX
  const formSections = [
    {
      title: "Basic Information",
      subtitle: "Let's start with the essentials",
      icon: <User className="h-6 w-6" />,
      fields: ['username', 'password', 'confirmPassword', 'birthDate', 'gender']
    },
    {
      title: "Contact Details", 
      subtitle: "How can others reach you?",
      icon: <Phone className="h-6 w-6" />,
      fields: ['phone', 'email']
    },
    {
      title: "Location",
      subtitle: "Where are you based?",
      icon: <MapPin className="h-6 w-6" />,
      fields: ['country', 'state', 'city']
    },
    {
      title: "Personal Details",
      subtitle: "Tell us more about yourself",
      icon: <Sparkles className="h-6 w-6" />,
      fields: ['religion', 'caste', 'height', 'weight', 'income']
    }
  ];

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

  const validateCurrentSection = useCallback(() => {
    const newErrors = {};
    const currentFields = formSections[currentSection].fields;
    
    currentFields.forEach(field => {
      if (field === 'username') {
        if (!formData.username.trim()) {
          newErrors.username = "Username is required";
        } else if (formData.username.length < 3) {
          newErrors.username = "Username must be at least 3 characters";
        }
      }
      
      if (field === 'password') {
        if (!formData.password) {
          newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
          newErrors.password = "Password must be at least 6 characters";
        } else if (!/(?=.*[!@#$%^&*])/.test(formData.password)) {
          newErrors.password = "Password must contain at least one special character";
        }
      }
      
      if (field === 'confirmPassword') {
        if (!formData.confirmPassword) {
          newErrors.confirmPassword = "Please confirm your password";
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match";
        }
      }
      
      if (field === 'birthDate') {
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
      }
      
      if (field === 'gender' && !formData.gender) {
        newErrors.gender = "Please select your gender";
      }
      
      if (field === 'email' && formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
      
      if (field === 'phone' && formData.phone && !/^\+?[\d\s-()]{10,}$/.test(formData.phone)) {
        newErrors.phone = "Please enter a valid phone number";
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [currentSection, formData, formSections]);

  const handleNext = useCallback(() => {
    if (validateCurrentSection()) {
      if (currentSection < formSections.length - 1) {
        setCurrentSection(prev => prev + 1);
      }
    }
  }, [currentSection, formSections.length, validateCurrentSection]);

  const handlePrevious = useCallback(() => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    }
  }, [currentSection]);

  const handleSubmit = useCallback(async () => {
    if (!validateCurrentSection()) return;

    try {
      setIsLoading(true);
      
      // Encrypt password before sending
      const encryptedPassword = encryptText(formData.password);
      
      const signupData = {
        username: formData.username,
        password: encryptedPassword,
        birthDate: formData.birthDate,
        gender: formData.gender,
        phone: formData.phone || null,
        email: formData.email || null,
        country: formData.country || null,
        state: formData.state || null,
        city: formData.city || null,
        religion: formData.religion || null,
        caste: formData.caste || null,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        income: formData.income || null
      };

      const response = await GlobalApi.CreateUserWithPreferences(signupData);
      
      if (response.data.success) {
        const { token } = response.data.data;
        localStorage.setItem("token", token);
        
        toast.success("Welcome to Qoupled! Account created successfully!");
        
        // Redirect to quiz section
        setTimeout(() => {
          router.push("/quiz-section/1");
        }, 1500);
      } else {
        const errorMessage = response.data?.message || "Failed to create account.";
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
      
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [formData, router, validateCurrentSection]);

  const toggleShowPassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const toggleShowConfirmPassword = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  const getFieldIcon = (fieldName) => {
    const icons = {
      username: <User className="h-5 w-5" />,
      password: <Lock className="h-5 w-5" />,
      confirmPassword: <Lock className="h-5 w-5" />,
      birthDate: <Calendar className="h-5 w-5" />,
      phone: <Phone className="h-5 w-5" />,
      email: <Mail className="h-5 w-5" />,
      country: <Globe className="h-5 w-5" />,
      state: <MapPin className="h-5 w-5" />,
      city: <MapPin className="h-5 w-5" />,
      religion: <Church className="h-5 w-5" />,
      height: <Ruler className="h-5 w-5" />,
      weight: <Scale className="h-5 w-5" />,
      income: <DollarSign className="h-5 w-5" />
    };
    return icons[fieldName] || <User className="h-5 w-5" />;
  };

  const renderField = (fieldName) => {
    const commonInputClass = "w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400";
    
    const fieldConfigs = {
      username: { type: "text", placeholder: "Choose a unique username", label: "Username" },
      password: { type: showPassword ? "text" : "password", placeholder: "Create a strong password", label: "Password" },
      confirmPassword: { type: showConfirmPassword ? "text" : "password", placeholder: "Confirm your password", label: "Confirm Password" },
      birthDate: { type: "date", placeholder: "", label: "Date of Birth" },
      gender: { type: "select", placeholder: "Select your gender", label: "Gender" },
      phone: { type: "tel", placeholder: "Your phone number", label: "Phone Number" },
      email: { type: "email", placeholder: "your.email@example.com", label: "Email Address" },
      country: { type: "text", placeholder: "Your country", label: "Country" },
      state: { type: "text", placeholder: "Your state/province", label: "State/Province" },
      city: { type: "text", placeholder: "Your city", label: "City" },
      religion: { type: "text", placeholder: "Your religion (optional)", label: "Religion" },
      caste: { type: "text", placeholder: "Your caste (optional)", label: "Caste" },
      height: { type: "number", placeholder: "Height in cm", label: "Height (cm)" },
      weight: { type: "number", placeholder: "Weight in kg", label: "Weight (kg)" },
      income: { type: "text", placeholder: "Annual income (optional)", label: "Annual Income" }
    };

    const config = fieldConfigs[fieldName];
    if (!config) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-2"
      >
        <label className="block text-sm font-semibold text-gray-700">
          {config.label}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {getFieldIcon(fieldName)}
          </div>
          
          {config.type === "select" && fieldName === "gender" ? (
            <select
              value={formData[fieldName]}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              className="w-full py-4 px-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200 text-gray-800"
            >
              <option value="">Select your gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          ) : (
            <input
              type={config.type}
              value={formData[fieldName]}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              className={commonInputClass}
              placeholder={config.placeholder}
              step={fieldName === "height" || fieldName === "weight" ? "0.1" : undefined}
            />
          )}
          
          {(fieldName === "password" || fieldName === "confirmPassword") && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              onClick={fieldName === "password" ? toggleShowPassword : toggleShowConfirmPassword}
            >
              {(fieldName === "password" ? showPassword : showConfirmPassword) ? 
                <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          )}
        </div>
        
        {errors[fieldName] && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm flex items-center"
          >
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors[fieldName]}
          </motion.p>
        )}
        
        {fieldName === "birthDate" && (
          <p className="text-xs text-gray-500">You must be at least 18 years old</p>
        )}
      </motion.div>
    );
  };

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
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-500 to-red-600 px-8 py-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-600/20 to-red-700/20"></div>
          <div className="relative z-10">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="flex justify-center items-center mb-4"
            >
              <Heart className="w-10 h-10 text-white mr-3" />
              <h1 className="text-3xl font-bold text-white">Qoupled</h1>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl font-medium text-white/95 mb-2"
            >
              {formSections[currentSection].title}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-sm text-white/80"
            >
              {formSections[currentSection].subtitle}
            </motion.p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-8">
            {formSections.map((section, index) => (
              <React.Fragment key={index}>
                <motion.div 
                  className={`flex flex-col items-center transition-all duration-300 ${
                    index <= currentSection ? 'text-rose-500' : 'text-gray-300'
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    index < currentSection ? 'bg-rose-500 text-white shadow-lg' :
                    index === currentSection ? 'bg-rose-100 text-rose-600 border-2 border-rose-500' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {index < currentSection ? <Sparkles className="h-5 w-5" /> : section.icon}
                  </div>
                  <div className="text-xs mt-2 text-center max-w-16">
                    {section.title.split(' ')[0]}
                  </div>
                </motion.div>
                {index < formSections.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-500 ${
                    index < currentSection ? 'bg-gradient-to-r from-rose-400 to-red-500' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Form Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {formSections[currentSection].fields.map((fieldName) => (
                <div key={fieldName}>
                  {renderField(fieldName)}
                </div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="mt-10 flex gap-4">
            {currentSection > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePrevious}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center py-4 px-6 border-2 border-gray-300 rounded-2xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowRight className="h-5 w-5 mr-2 rotate-180" />
                Previous
              </motion.button>
            )}
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={currentSection === formSections.length - 1 ? handleSubmit : handleNext}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold py-4 px-6 rounded-2xl hover:from-rose-600 hover:to-red-700 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin mr-3" />
                  Creating Account...
                </>
              ) : currentSection === formSections.length - 1 ? (
                <>
                  <Sparkles className="mr-3 h-5 w-5" />
                  Complete Signup
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="ml-3 h-5 w-5" />
                </>
              )}
            </motion.button>
          </div>

          {/* Login Link */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-8"
          >
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-rose-600 font-semibold hover:text-rose-700 transition-colors"
              >
                Sign In
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ModernSignup;