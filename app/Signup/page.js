"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Country, State, City } from 'country-state-city';
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
  Church,
  Upload,
  Image,
  Briefcase,
  GraduationCap,
  Users,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import GlobalApi from "@/app/_services/GlobalApi";
import { encryptText } from "@/utils/encryption";
import ImageUploadService from "@/utils/ImageUploadService";

const ModernSignup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentSection, setCurrentSection] = useState(0);
  // const [profileImage, setProfileImage] = useState(null);
  // const [profileImagePreview, setProfileImagePreview] = useState(null);

  const [uploadedImages, setUploadedImages] = useState([]); // { file, preview, url, isProfile }
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState({})
  const isUploadingRef = useRef(false);

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [religions, setReligions] = useState([]);
  const [castes, setCastes] = useState([]);
  const [showCustomReligion, setShowCustomReligion] = useState(false);
  const [showCustomCaste, setShowCustomCaste] = useState(false);
  const [customReligion, setCustomReligion] = useState("");
  const [customCaste, setCustomCaste] = useState("");

  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    birthDate: "",
    gender: "",
    lookingFor: "",
    phone: "",
    email: "",
    country: "",
    state: "",
    city: "",
    religion: "",
    caste: "",
    height: "",
    weight: "",
    income: "",
    educationLevel: "",
    occupation: "",
    company: "",
    bio: "",
    languages: [],
  });

  useEffect(() => {
    // Load countries
    const countryList = Country.getAllCountries().map(country => ({
      value: country.isoCode,
      label: country.name
    }));
    setCountries(countryList);
    
    // Fetch religions from your API
    fetchReligions();
  }, []);

  useEffect(() => {
    if (formData.country) {
      const stateList = State.getStatesOfCountry(formData.country).map(state => ({
        value: state.isoCode,
        label: state.name
      }));
      setStates(stateList);
      setCities([]); // Reset cities when country changes
      handleInputChange('state', '');
      handleInputChange('city', '');
    }
  }, [formData.country]);

  useEffect(() => {
    if (formData.country && formData.state) {
      const cityList = City.getCitiesOfState(formData.country, formData.state).map(city => ({
        value: city.name,
        label: city.name
      }));
      setCities(cityList);
      handleInputChange('city', '');
    }
  }, [formData.country, formData.state]);

  useEffect(() => {
    if (formData.religion && formData.religion !== 'Other') {
      fetchCastes(formData.religion);
      setShowCustomReligion(false);
      setShowCustomCaste(false);
    } else if (formData.religion === 'Other') {
      setShowCustomReligion(true);
      setCastes([]);
      setShowCustomCaste(false);
    } else {
      setCastes([]);
      setShowCustomReligion(false);
      setShowCustomCaste(false);
    }
  }, [formData.religion]);

    const fetchReligions = async () => {
      try {
        const response = await fetch('/api/religions');
        const data = await response.json();
        
        if (data.success) {
          const religionList = data.data.map(religion => ({
            value: religion.id,
            label: religion.name
          }));
          // Add "Other" option
          religionList.push({ value: 'Other', label: 'Other' });
          setReligions(religionList);
        }
      } catch (error) {
        console.error('Error fetching religions:', error);
        // Fallback to empty religions list
        setReligions([{ value: 'Other', label: 'Other' }]);
      }
    };

    const fetchCastes = async (religionName) => {
      try {
        const response = await fetch(`/api/castes?religion=${encodeURIComponent(religionName)}`);
        const data = await response.json();
        
        if (data.success) {
          const casteList = data.data.map(caste => ({
            value: caste.id,
            label: caste.name
          }));
          // Add "Other" option
          casteList.push({ value: 'Other', label: 'Other' });
          setCastes(casteList);
        }
      } catch (error) {
        console.error('Error fetching castes:', error);
        // Fallback to empty castes list with Other option
        setCastes([{ value: 'Other', label: 'Other' }]);
      }
    };

  const availableLanguages = [
    "English",
    "Hindi",
    "Tamil",
    "Telugu",
    "Kannada",
    "Malayalam",
    "Bengali",
    "Marathi",
    "Gujarati",
    "Punjabi",
    "Urdu",
    "Odia",
    "Assamese",
    "Sanskrit",
  ];

  const formSections = [
    {
      title: "Basic Information",
      subtitle: "Let's start with the essentials",
      icon: <User className="h-6 w-6" />,
      fields: [
        "username",
        "password",
        "confirmPassword",
        "birthDate",
        "gender",
        "lookingFor",
      ],
    },
    {
      title: "Contact Details",
      subtitle: "How can others reach you?",
      icon: <Phone className="h-6 w-6" />,
      fields: ["phone", "email"],
    },
    {
      title: "Location",
      subtitle: "Where are you based?",
      icon: <MapPin className="h-6 w-6" />,
      fields: ["country", "state", "city"],
    },
    {
      title: "Personal Details",
      subtitle: "Tell us more about yourself",
      icon: <Sparkles className="h-6 w-6" />,
      fields: ["religion", "caste", "height", "weight", "income"],
    },
    {
      title: "Professional Info",
      subtitle: "Your education and career",
      icon: <Briefcase className="h-6 w-6" />,
      fields: ["educationLevel", "occupation", "company"],
    },
    {
      title: "Profile Photos & Details", // UPDATED TITLE
      subtitle: "Add your photos and complete your profile",
      icon: <Image className="h-6 w-6" />,
      fields: ["profileImages", "bio", "languages"], // UPDATED FIELD NAME
    },
  ];

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => {
      if (prev[field]) {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
      return prev;
    });
  }, []);

  const handleLanguageToggle = useCallback((language) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter((lang) => lang !== language)
        : [...prev.languages, language],
    }));
  }, []);

  // Handle adding new images (up to 3)
  const handleImageSelect = useCallback(async (e) => {
    const files = Array.from(e.target.files);
    
    if (uploadedImages.length + files.length > 3) {
      setErrors(prev => ({
        ...prev,
        images: 'You can upload maximum 3 images'
      }));
      return;
    }

    // Validate all files first
    const validationErrors = [];
    const validFiles = [];

    for (let i = 0; i < files.length; i++) {
      const validation = ImageUploadService.validateImage(files[i]);
      if (validation.isValid) {
        validFiles.push(files[i]);
      } else {
        validationErrors.push(`Image ${i + 1}: ${validation.error}`);
      }
    }

    if (validationErrors.length > 0) {
      setErrors(prev => ({
        ...prev,
        images: validationErrors.join(', ')
      }));
      return;
    }

    // Create previews for valid files
    try {
      const newImages = await Promise.all(
        validFiles.map(async (file, index) => {
          const preview = await ImageUploadService.createPreviewUrl(file);
          return {
            id: Date.now() + index,
            file,
            preview,
            url: null,
            isProfile: uploadedImages.length === 0 && index === 0 // First image is profile by default
          };
        })
      );

      setUploadedImages(prev => [...prev, ...newImages]);
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.images;
        return newErrors;
      });
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        images: 'Failed to process images'
      }));
    }
  }, [uploadedImages.length]);

  // Remove an image
  const handleRemoveImage = useCallback((imageId) => {
    setUploadedImages(prev => {
      const filtered = prev.filter(img => img.id !== imageId);
      
      // If we removed the profile image, make the first remaining image the profile
      if (filtered.length > 0 && !filtered.some(img => img.isProfile)) {
        filtered[0].isProfile = true;
      }
      
      return filtered;
    });
  }, []);

  // Set an image as profile image
  const handleSetProfileImage = useCallback((imageId) => {
    setUploadedImages(prev =>
      prev.map(img => ({
        ...img,
        isProfile: img.id === imageId
      }))
    );
  }, []);

  const uploadAllImages = useCallback(async () => {
    if (isUploadingRef.current) {
      console.warn("Upload already in progress, skipping duplicate call");
      return uploadedImages
        .filter(img => img.url)
        .map(img => ({ url: img.url, isProfile: img.isProfile }));
    }

    console.log("Starting uploadAllImages with", uploadedImages.length, "images");

    if (uploadedImages.length === 0) {
      throw new Error('No images to upload');
    }

    // Check if all images already have URLs
    const allHaveUrls = uploadedImages.every(img => img.url);
    if (allHaveUrls) {
      console.log("All images already uploaded, returning existing URLs");
      return uploadedImages.map(img => ({
        url: img.url,
        isProfile: img.isProfile
      }));
    }

    isUploadingRef.current = true;
    setUploadingImages(true);

    try {
      const imagesToUpload = uploadedImages.filter(img => !img.url);
      console.log("Images to upload:", imagesToUpload.length);

      const uploadResults = await ImageUploadService.uploadMultipleImagesWithStatus(
        imagesToUpload.map(img => img.file),
        'photo'
      );

      console.log("Upload results:", uploadResults);

      const failedUploads = [];

      // Build final array - combine already uploaded + newly uploaded
      const finalUrls = uploadedImages.map(img => {
        if (img.url) {
          // Already has URL, use it
          return { url: img.url, isProfile: img.isProfile };
        } else {
          // Find corresponding upload result
          const uploadIndex = imagesToUpload.findIndex(item => item.id === img.id);
          const result = uploadResults[uploadIndex];
          
          if (result && result.success) {
            return { url: result.url, isProfile: img.isProfile };
          } else {
            failedUploads.push(`Image ${uploadIndex + 1}: ${result?.error || 'Unknown error'}`);
            return null;
          }
        }
      }).filter(Boolean); // Remove null entries

      if (failedUploads.length > 0) {
        console.error('Some uploads failed:', failedUploads);
        throw new Error(failedUploads.join(', '));
      }

      if (finalUrls.length === 0) {
        throw new Error('No images were successfully uploaded');
      }

      console.log("Final URLs to send:", finalUrls);
      return finalUrls;
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    } finally {
      setUploadingImages(false);
      isUploadingRef.current = false;
    }
  }, [uploadedImages]);

  const validateCurrentSection = useCallback(() => {
    const newErrors = {};
    const currentFields = formSections[currentSection].fields;

    currentFields.forEach((field) => {
      if (field === "username") {
        if (!formData.username.trim()) {
          newErrors.username = "Username is required";
        } else if (formData.username.length < 3) {
          newErrors.username = "Username must be at least 3 characters";
        }
      }

      if (field === "password") {
        if (!formData.password) {
          newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
          newErrors.password = "Password must be at least 6 characters";
        } else if (!/(?=.*[!@#$%^&*])/.test(formData.password)) {
          newErrors.password =
            "Password must contain at least one special character";
        }
      }

      if (field === "confirmPassword") {
        if (!formData.confirmPassword) {
          newErrors.confirmPassword = "Please confirm your password";
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match";
        }
      }

      if (field === "birthDate") {
        if (!formData.birthDate) {
          newErrors.birthDate = "Date of birth is required";
        } else {
          const birthDate = new Date(formData.birthDate);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();

          if (
            age < 18 ||
            (age === 18 && monthDiff < 0) ||
            (age === 18 &&
              monthDiff === 0 &&
              today.getDate() < birthDate.getDate())
          ) {
            newErrors.birthDate = "You must be at least 18 years old";
          }
        }
      }

      if (field === "gender" && !formData.gender) {
        newErrors.gender = "Please select your gender";
      }

      if (field === "lookingFor" && !formData.lookingFor) {
        newErrors.lookingFor = "Please select who you're looking for";
      }

      // Mandatory fields validation
      if (field === "country" && !formData.country.trim()) {
        newErrors.country = "Country is required";
      }

      if (field === "state" && !formData.state.trim()) {
        newErrors.state = "State/Province is required";
      }

      if (field === "city" && !formData.city.trim()) {
        newErrors.city = "City is required";
      }

      if (field === "religion" && !formData.religion.trim()) {
        newErrors.religion = "Religion is required";
      }

      if (field === "caste" && !formData.caste.trim()) {
        newErrors.caste = "Caste is required";
      }

      if (field === "height") {
        if (!formData.height) {
          newErrors.height = "Height is required";
        } else if (parseFloat(formData.height) < 100 || parseFloat(formData.height) > 250) {
          newErrors.height = "Height must be between 100cm and 250cm";
        }
      }

      if (field === "weight") {
        if (!formData.weight) {
          newErrors.weight = "Weight is required";
        } else if (parseFloat(formData.weight) < 30 || parseFloat(formData.weight) > 200) {
          newErrors.weight = "Weight must be between 30kg and 200kg";
        }
      }

      if (field === "income" && !formData.income.trim()) {
        newErrors.income = "Annual income is required";
      }

      if (field === "educationLevel" && !formData.educationLevel) {
        newErrors.educationLevel = "Education level is required";
      }

      if (
        field === "email" &&
        formData.email &&
        !/\S+@\S+\.\S+/.test(formData.email)
      ) {
        newErrors.email = "Please enter a valid email address";
      }

      if (
        field === "phone" &&
        formData.phone &&
        !/^\+?[\d\s-()]{10,}$/.test(formData.phone)
      ) {
        newErrors.phone = "Please enter a valid phone number";
      }

      if (field === "bio" && formData.bio && formData.bio.length < 20) {
        newErrors.bio = "Bio should be at least 20 characters";
      }

      if (field === "bio" && formData.bio && formData.bio.length > 500) {
        newErrors.bio = "Bio should not exceed 500 characters";
      }
      if (field === "profileImages") {
        if (uploadedImages.length === 0) {
          newErrors.profileImages = "At least one profile photo is required";
        } else if (uploadedImages.length > 3) {
          newErrors.profileImages = "Maximum 3 photos allowed";
        } else if (!uploadedImages.some(img => img.isProfile)) {
          newErrors.profileImages = "Please select a profile photo";
        }
      }

      if (field === "country" && !formData.country) {
        newErrors.country = "Country is required";
      }

      if (field === "state" && !formData.state) {
        newErrors.state = "State/Province is required";
      }

      if (field === "city" && !formData.city) {
        newErrors.city = "City is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [currentSection, formData, formSections]);

  const handleNext = useCallback(() => {
    if (validateCurrentSection()) {
      if (currentSection < formSections.length - 1) {
        setCurrentSection((prev) => prev + 1);
      }
    }
  }, [currentSection, formSections.length, validateCurrentSection]);

  const handlePrevious = useCallback(() => {
    if (currentSection > 0) {
      setCurrentSection((prev) => prev - 1);
    }
  }, [currentSection]);

  const handleSubmit = useCallback(async () => {
    if (!validateCurrentSection()) return;

    if (uploadedImages.length === 0) {
      setErrors(prev => ({
        ...prev,
        profileImages: "At least one profile photo is required"
      }));
      return;
    }

    if (isLoading || isUploadingRef.current) {
      console.warn("Already processing, ignoring duplicate submit");
      return;
    }

    try {
      setIsLoading(true);

      // Upload all images first
      toast.loading('Uploading your photos...', { id: 'image-upload' });
      
      let finalImageUrls;
      try {
        finalImageUrls = await uploadAllImages();
        
        if (!finalImageUrls || finalImageUrls.length === 0) {
          throw new Error('No images were successfully uploaded');
        }
        
        toast.success('Photos ready!', { id: 'image-upload' });
      } catch (uploadError) {
        toast.error(uploadError.message || 'Failed to upload photos', { id: 'image-upload' });
        throw uploadError;
      }

      // Handle custom religion/caste
      let finalReligion = formData.religion;
      let finalCaste = formData.caste;

      if (formData.religion === 'Other' && customReligion) {
        finalReligion = customReligion;
      }

      if (showCustomCaste && customCaste) {
        finalCaste = customCaste;
      }

      const selectedCountry = countries.find(c => c.value === formData.country);
      const selectedState = states.find(s => s.value === formData.state);
      const selectedCity = cities.find(c => c.value === formData.city);

      // Encrypt password before sending
      const encryptedPassword = encryptText(formData.password);

      const signupData = {
        username: formData.username,
        password: encryptedPassword,
        birthDate: formData.birthDate,
        gender: formData.gender,
        lookingFor: formData.lookingFor,
        phone: formData.phone || null,
        email: formData.email || null,
        country: selectedCountry?.label || formData.country,
        country_code: formData.country,
        state: selectedState?.label || formData.state,
        state_code: formData.state,
        city: selectedCity?.label || formData.city,
        city_code: formData.city,
        religion: finalReligion,
        caste: finalCaste,
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        income: formData.income,
        educationLevel: formData.educationLevel,
        occupation: formData.occupation || null,
        company: formData.company || null,
        bio: formData.bio || null,
        languages: formData.languages,
        images: finalImageUrls
      };

      toast.loading('Creating your account...', { id: 'signup' });

      const response = await GlobalApi.CreateUserWithPreferences(signupData);

      if (response.data.success) {
        const { token } = response.data.data;
        localStorage.setItem("token", token);

        toast.success("Welcome to Qoupled! Account created successfully!", { id: 'signup' });

        setTimeout(() => {
          router.push("/quiz-section/1");
        }, 1500);
      } else {
        const errorMessage = response.data?.message || "Failed to create account.";
        toast.error(errorMessage, { id: 'signup' });
      }
    } catch (error) {
      console.error("Signup error:", error);
      let errorMessage = "Failed to create account. Please try again.";

      if (error.response) {
        errorMessage = error.response.data?.message || error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [formData, uploadedImages, validateCurrentSection, router, uploadAllImages]);

  const getFieldIcon = (fieldName) => {
    const icons = {
      username: <User className="h-5 w-5 text-gray-600" />,
      password: <Lock className="h-5 w-5 text-gray-600" />,
      confirmPassword: <Lock className="h-5 w-5 text-gray-600" />,
      birthDate: <Calendar className="h-5 w-5 text-gray-600" />,
      lookingFor: <Users className="h-5 w-5 text-gray-600" />,
      phone: <Phone className="h-5 w-5 text-gray-600" />,
      email: <Mail className="h-5 w-5 text-gray-600" />,
      country: <Globe className="h-5 w-5 text-gray-600" />,
      state: <MapPin className="h-5 w-5 text-gray-600" />,
      city: <MapPin className="h-5 w-5 text-gray-600" />,
      religion: <Church className="h-5 w-5 text-gray-600" />,
      height: <Ruler className="h-5 w-5 text-gray-600" />,
      weight: <Scale className="h-5 w-5 text-gray-600" />,
      income: <DollarSign className="h-5 w-5 text-gray-600" />,
      educationLevel: <GraduationCap className="h-5 w-5 text-gray-600" />,
      occupation: <Briefcase className="h-5 w-5 text-gray-600" />,
      company: <Briefcase className="h-5 w-5 text-gray-600" />,
    };
    return icons[fieldName] || <User className="h-5 w-5 text-gray-600" />;
  };

  const renderField = (fieldName) => {
    const commonInputClass =
      "w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400";

    const fieldConfigs = {
      username: {
        type: "text",
        placeholder: "Choose a unique username",
        label: "Username",
      },
      password: {
        type: showPassword ? "text" : "password",
        placeholder: "Create a strong password",
        label: "Password",
      },
      confirmPassword: {
        type: showConfirmPassword ? "text" : "password",
        placeholder: "Confirm your password",
        label: "Confirm Password",
      },
      birthDate: { type: "date", placeholder: "", label: "Date of Birth" },
      gender: {
        type: "select",
        placeholder: "Select your gender",
        label: "Gender",
      },
      lookingFor: {
        type: "select",
        placeholder: "Who are you looking for?",
        label: "Looking For",
      },
      phone: {
        type: "tel",
        placeholder: "Your phone number",
        label: "Phone Number (Optional)",
      },
      email: {
        type: "email",
        placeholder: "your.email@example.com",
        label: "Email Address (Optional)",
      },
      country: { type: "text", placeholder: "Your country", label: "Country" },
      state: {
        type: "text",
        placeholder: "Your state/province",
        label: "State/Province",
      },
      city: { type: "text", placeholder: "Your city", label: "City" },
      religion: {
        type: "text",
        placeholder: "Your religion",
        label: "Religion",
      },
      caste: {
        type: "text",
        placeholder: "Your caste",
        label: "Caste",
      },
      height: {
        type: "number",
        placeholder: "Height in cm",
        label: "Height (cm)",
      },
      weight: {
        type: "number",
        placeholder: "Weight in kg",
        label: "Weight (kg)",
      },
      income: {
        type: "text",
        placeholder: "Annual income",
        label: "Annual Income",
      },
      educationLevel: {
        type: "select",
        placeholder: "Select education level",
        label: "Education Level",
      },
      occupation: {
        type: "text",
        placeholder: "Your occupation (Optional)",
        label: "Occupation",
      },
      company: {
        type: "text",
        placeholder: "Company name (optional)",
        label: "Company",
      },
      bio: {
        type: "textarea",
        placeholder: "Tell us about yourself... (Optional)",
        label: "Bio",
      },
    };


    if (fieldName === "country") {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-2"
        >
          <label className="block text-sm font-semibold text-gray-700">
            Country
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Globe className="h-5 w-5 text-gray-600" />
            </div>
            <select
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              className="w-full py-4 pl-12 pr-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200 text-gray-800 appearance-none"
            >
              <option value="">Select your country</option>
              {countries.map(country => (
                <option key={country.value} value={country.value}>
                  {country.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {errors.country && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm flex items-center"
            >
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.country}
            </motion.p>
          )}
        </motion.div>
      );
    }

    if (fieldName === "state") {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-2"
        >
          <label className="block text-sm font-semibold text-gray-700">
            State/Province
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-600" />
            </div>
            <select
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              disabled={!formData.country}
              className="w-full py-4 pl-12 pr-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200 text-gray-800 appearance-none disabled:opacity-50"
            >
              <option value="">Select your state</option>
              {states.map(state => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {errors.state && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm flex items-center"
            >
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.state}
            </motion.p>
          )}
        </motion.div>
      );
    }

    if (fieldName === "city") {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-2"
        >
          <label className="block text-sm font-semibold text-gray-700">
            City
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-600" />
            </div>
            <select
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              disabled={!formData.state}
              className="w-full py-4 pl-12 pr-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200 text-gray-800 appearance-none disabled:opacity-50"
            >
              <option value="">Select your city</option>
              {cities.map(city => (
                <option key={city.value} value={city.value}>
                  {city.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {errors.city && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm flex items-center"
            >
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.city}
            </motion.p>
          )}
        </motion.div>
      );
    }

    if (fieldName === "religion") {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-2"
        >
          <label className="block text-sm font-semibold text-gray-700">
            Religion
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Church className="h-5 w-5 text-gray-600" />
            </div>
            <select
              value={formData.religion}
              onChange={(e) => {
                handleInputChange('religion', e.target.value);
                handleInputChange('caste', ''); // Reset caste when religion changes
                setCustomCaste(''); // Reset custom caste
              }}
              className="w-full py-4 pl-12 pr-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200 text-gray-800 appearance-none"
            >
              <option value="">Select your religion</option>
              {religions.map(religion => (
                <option key={religion.value} value={religion.label}>
                  {religion.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {showCustomReligion && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2"
            >
              <label className="block text-sm font-semibold text-gray-700">
                Specify Your Religion
              </label>
              <input
                type="text"
                value={customReligion}
                onChange={(e) => setCustomReligion(e.target.value)}
                placeholder="Enter your religion"
                className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
              />
            </motion.div>
          )}
          
          {errors.religion && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm flex items-center"
            >
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.religion}
            </motion.p>
          )}
        </motion.div>
      );
    }

    if (fieldName === "caste") {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-2"
        >
          <label className="block text-sm font-semibold text-gray-700">
            Caste/Denomination
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Users className="h-5 w-5 text-gray-600" />
            </div>
            <select
              value={formData.caste}
              onChange={(e) => {
                if (e.target.value === 'Other') {
                  setShowCustomCaste(true);
                } else {
                  setShowCustomCaste(false);
                  handleInputChange('caste', e.target.value);
                }
              }}
              disabled={!formData.religion || formData.religion === 'Other'}
              className="w-full py-4 pl-12 pr-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200 text-gray-800 appearance-none disabled:opacity-50"
            >
              <option value="">Select your caste</option>
              {castes.map(caste => (
                <option key={caste.value} value={caste.label}>
                  {caste.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {showCustomCaste && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2"
            >
              <label className="block text-sm font-semibold text-gray-700">
                Specify Your Caste/Denomination
              </label>
              <input
                type="text"
                value={customCaste}
                onChange={(e) => {
                  setCustomCaste(e.target.value);
                  handleInputChange('caste', e.target.value);
                }}
                placeholder="Enter your caste or denomination"
                className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
              />
            </motion.div>
          )}
          
          {errors.caste && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm flex items-center"
            >
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.caste}
            </motion.p>
          )}
        </motion.div>
      );
    }

    if (fieldName === "profileImages") {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <label className="block text-sm font-semibold text-gray-700">
            Profile Photos
            <span className="text-red-500 ml-1">*</span>
            <span className="text-xs font-normal text-gray-500 ml-2">
              (Minimum 1, Maximum 3)
            </span>
          </label>

          {/* Image Grid Display */}
          <div className="grid grid-cols-3 gap-4">
            {uploadedImages.map((image) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group"
              >
                <div className="aspect-square rounded-2xl overflow-hidden border-4 border-gray-200 relative">
                  <img
                    src={image.preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Profile Badge */}
                  {image.isProfile && (
                    <div className="absolute top-2 left-2 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <Heart className="h-3 w-3 fill-current" />
                      Profile
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    {!image.isProfile && (
                      <button
                        type="button"
                        onClick={() => handleSetProfileImage(image.id)}
                        className="p-2 bg-white rounded-full hover:bg-rose-50 transition-colors"
                        title="Set as profile photo"
                      >
                        <Heart className="h-4 w-4 text-rose-500" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(image.id)}
                      className="p-2 bg-white rounded-full hover:bg-red-50 transition-colors"
                      title="Remove photo"
                    >
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Upload Button */}
            {uploadedImages.length < 3 && (
              <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 hover:border-rose-400 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-rose-50 group">
                <Upload className="h-8 w-8 text-gray-400 group-hover:text-rose-500 transition-colors" />
                <span className="text-sm font-medium text-gray-600 group-hover:text-rose-600">
                  Add Photo
                </span>
                <span className="text-xs text-gray-400">
                  {uploadedImages.length}/3
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex gap-3">
              <Sparkles className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900">Photo Tips:</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Upload 1-3 clear photos of yourself</li>
                  <li>• First photo will be your main profile picture</li>
                  <li>• Click the heart icon to change profile photo</li>
                  <li>• Max size: 5MB per photo (JPG, PNG, WebP)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errors.profileImages && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm flex items-center"
            >
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.profileImages}
            </motion.p>
          )}
        </motion.div>
      );
    }

    if (fieldName === "languages") {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-2"
        >
          <label className="block text-sm font-semibold text-gray-700">
            Languages You Speak (Optional)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {availableLanguages.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => handleLanguageToggle(lang)}
                className={`py-2 px-4 rounded-xl border-2 transition-all duration-200 ${
                  formData.languages.includes(lang)
                    ? "bg-rose-500 border-rose-500 text-white"
                    : "bg-white border-gray-200 text-gray-700 hover:border-rose-300"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Selected:{" "}
            {formData.languages.length > 0
              ? formData.languages.join(", ")
              : "None"}
          </p>
        </motion.div>
      );
    }

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
          {[
            "country", "state", "city", "religion", "caste", 
            "height", "weight", "income", "educationLevel"
          ].includes(fieldName) && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
        <div className="relative">
          {config.type !== "textarea" && config.type !== "select" && (
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              {getFieldIcon(fieldName)}
            </div>
          )}

          {config.type === "select" ? (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                {getFieldIcon(fieldName)}
              </div>
              <select
                value={formData[fieldName]}
                onChange={(e) => handleInputChange(fieldName, e.target.value)}
                className="w-full py-4 pl-12 pr-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200 text-gray-800 appearance-none"
              >
                <option value="">{config.placeholder}</option>
                {fieldName === "gender" && (
                  <>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </>
                )}
                {fieldName === "lookingFor" && (
                  <>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Both">Both</option>
                    <option value="Any">Any</option>
                  </>
                )}
                {fieldName === "educationLevel" && (
                  <>
                    <option value="High School">High School</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="Doctorate/PhD">Doctorate/PhD</option>
                    <option value="Other">Other</option>
                  </>
                )}
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          ) : config.type === "textarea" ? (
            <textarea
              value={formData[fieldName]}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400 min-h-[120px]"
              placeholder={config.placeholder}
              maxLength={500}
            />
          ) : (
            <input
              type={config.type}
              value={formData[fieldName]}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              className={commonInputClass}
              placeholder={config.placeholder}
              step={
                fieldName === "height" || fieldName === "weight"
                  ? "0.1"
                  : undefined
              }
            />
          )}

          {(fieldName === "password" || fieldName === "confirmPassword") && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() =>
                fieldName === "password"
                  ? setShowPassword(!showPassword)
                  : setShowConfirmPassword(!showConfirmPassword)
              }
            >
              {(
                fieldName === "password" ? showPassword : showConfirmPassword
              ) ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
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
          <p className="text-xs text-gray-500">
            You must be at least 18 years old
          </p>
        )}
        {fieldName === "bio" && formData.bio && (
          <p className="text-xs text-gray-500">
            {formData.bio.length}/500 characters
          </p>
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
            background: "#363636",
            color: "#fff",
            borderRadius: "12px",
          },
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden"
      >
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

        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-8">
            {formSections.map((section, index) => (
              <React.Fragment key={index}>
                <motion.div
                  className={`flex flex-col items-center transition-all duration-300 ${
                    index <= currentSection ? "text-rose-500" : "text-gray-300"
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      index < currentSection
                        ? "bg-rose-500 text-white shadow-lg"
                        : index === currentSection
                        ? "bg-rose-100 text-rose-600 border-2 border-rose-500"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {index < currentSection ? (
                      <Sparkles className="h-4 w-4" />
                    ) : (
                      section.icon
                    )}
                  </div>
                </motion.div>
                {index < formSections.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded-full transition-all duration-500 ${
                      index < currentSection
                        ? "bg-gradient-to-r from-rose-400 to-red-500"
                        : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

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
                <div key={fieldName}>{renderField(fieldName)}</div>
              ))}
            </motion.div>
          </AnimatePresence>

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
              onClick={
                currentSection === formSections.length - 1
                  ? handleSubmit
                  : handleNext
              }
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

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-8"
          >
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-rose-600 font-semibold hover:text-rose-700 transition-colors"
              >
                Sign In
              </a>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ModernSignup;