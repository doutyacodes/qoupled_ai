"use client"
import React, { useState, useEffect } from 'react';
import Image from "next/image";
import { 
  Heart, 
  Upload, 
  Pencil, 
  Save, 
  Trash2, 
  Languages, 
  CheckCircle,
  MapPin, 
  UserCheck, 
  Mail, 
  Phone, 
  User,
  BookOpen,
  Briefcase,
  CircleDollarSign,
  Scale,
  Ruler,
  Users,
  Clock,
  X,
  MoreHorizontal,
  Plus,
  Calendar,
  GraduationCap,
  Building2
} from "lucide-react";

import axios from 'axios';
import { toast } from 'react-hot-toast';
import ModernNavbar from '@/app/_components/Navbar';
import ProfileImagesManager from '../_components/ProfileImagesManager';
import { BASE_IMAGE_URL } from '@/utils/constants';

export default function UserProfile() {
  const [editMode, setEditMode] = useState(false);
  // const [profileImage, setProfileImage] = useState(null);
  // const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPhotosEditMode, setIsPhotosEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [userData, setUserData] = useState({
    id: '',
    username: '',
    birthDate: '',
    gender: '',
    phone: '',
    isPhoneVerified: false,
    email: '',
    isEmailVerified: false,
    profileImages: [],
    country: '',
    state: '',
    city: '',
    religion: '',
    caste: '',
    height: '',
    weight: '',
    income: '',
    isProfileVerified: false,
    isProfileComplete: false,
    education: [],
    jobs: [],
    languages: []
  });
  
  // State for form fields
  const [formData, setFormData] = useState({...userData});
  
  // State for new items
  const [newEducation, setNewEducation] = useState({ 
    education_level_id: '', 
    degree: '', 
    graduationYear: '' 
  });

  const [newJob, setNewJob] = useState({ 
    job_title_id: '', 
    company: '', 
    location: '' 
  });
  const [newLanguage, setNewLanguage] = useState('');
  
  // State for common data
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [educationLevels, setEducationLevels] = useState([]);
  const [jobTitles, setJobTitles] = useState([]);
  
  useEffect(() => {
    fetchUserProfile();
    fetchCommonData();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication failed. Please log in again.');
        return;
      }
      
      const response = await axios.get('/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setUserData(response.data);
        setFormData(response.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCommonData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/users/user-details', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setAvailableLanguages(response.data.languages || []);
        setEducationLevels(response.data.educationLevels || []);
        setJobTitles(response.data.jobTitles || []);
      }
    } catch (error) {
      console.error('Error fetching common data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // const handleImageChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     setProfileImage(file);
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setImagePreview(reader.result);
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  // const uploadImageToCPanel = async (file) => {
  //   if (!file) return null;
    
  //   const formData = new FormData();
  //   formData.append('coverImage', file);
  //   formData.append('type', 'photo');
    
  //   try {
  //     const response = await axios.post(
  //       'https://wowfy.in/wowfy_app_codebase/upload.php',
  //       formData,
  //       { headers: { 'Content-Type': 'multipart/form-data' } }
  //     );
      
  //     if (response.data.success) {
  //       return response.data.filePath;
  //     }
  //     throw new Error(response.data.error);
  //   } catch (error) {
  //     console.error('Upload error:', error);
  //     toast.error('Failed to upload image');
  //     return null;
  //   }
  // };

  const addEducation = () => {
    if (newEducation.education_level_id === '') {
      toast.error('Please select an education level');
      return;
    }
    
    if (newEducation.degree.trim() === '') {
      toast.error('Please enter a degree');
      return;
    }
    
    // Find the level name to display it
    const selectedLevel = educationLevels.find(
      level => level.id === parseInt(newEducation.education_level_id)
    );
    
    const newItem = {
      ...newEducation,
      education_level_id: parseInt(newEducation.education_level_id),
      levelName: selectedLevel ? selectedLevel.levelName : ''
    };
    
    setFormData(prev => {
      const updated = {
        ...prev,
        education: [...prev.education, newItem]
      };
      return updated;
    });
    
    setNewEducation({ education_level_id: '', degree: '', graduationYear: '' });
  };

  const removeEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const addJob = () => {
    if (newJob.job_title_id === '') {
      toast.error('Please select a job title');
      return;
    }
    
    // Find the job title to display it
    const selectedJobTitle = jobTitles.find(
      job => job.id === parseInt(newJob.job_title_id)
    );
    
    setFormData(prev => ({
      ...prev,
      jobs: [...prev.jobs, {
        ...newJob,
        job_title_id: parseInt(newJob.job_title_id),
        title: selectedJobTitle ? selectedJobTitle.title : ''
      }]
    }));
    
    setNewJob({ job_title_id: '', company: '', location: '' });
  };

  const removeJob = (index) => {
    setFormData(prev => ({
      ...prev,
      jobs: prev.jobs.filter((_, i) => i !== index)
    }));
  };

  const addLanguage = () => {
    if (newLanguage === '') {
      toast.error('Please select a language');
      return;
    }
    
    // Check if language already exists
    if (formData.languages.some(lang => lang.id === parseInt(newLanguage))) {
      toast.error('Language already added');
      return;
    }
    
    const selectedLanguage = availableLanguages.find(lang => lang.id === parseInt(newLanguage));
    
    if (selectedLanguage) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, {
          id: selectedLanguage.id,
          name: selectedLanguage.title
        }]
      }));
      
      setNewLanguage('');
    }
  };

  const removeLanguage = (id) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang.id !== id)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate at least one image exists
    if (!formData.profileImages || formData.profileImages.length === 0) {
      toast.error('Please upload at least one profile photo');
      return;
    }
    
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      // Remove the old image upload code - images are now uploaded immediately
      const dataToSubmit = {
        ...formData
      };
      
      const response = await axios.put('/api/users/profile', dataToSubmit, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.status === 200) {
        toast.success('Profile updated successfully');
        setUserData(response.data);
        setEditMode(false);
        fetchUserProfile();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return '';
    const dob = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const verifications = [
    { 
      icon: <CheckCircle size={22} />, 
      color: userData.isProfileVerified ? "text-blue-500" : "text-gray-400", 
      text: "Profile" 
    },
    { 
      icon: <Phone size={22} />, 
      color: userData.isPhoneVerified ? "text-green-500" : "text-gray-400", 
      text: "Phone" 
    },
    { 
      icon: <Mail size={22} />, 
      color: userData.isEmailVerified ? "text-green-500" : "text-gray-400", 
      text: "Email" 
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  const personalInfoItems = [
    { 
      icon: <MapPin size={20} className="text-rose-500" />, 
      label: "Location", 
      value: userData.city ? `${userData.city}${userData.state ? `, ${userData.state}` : ''}` : "Not set"
    },
    { 
      icon: <Clock size={20} className="text-rose-500" />, 
      label: "Age", 
      value: userData.birthDate ? `${calculateAge(userData.birthDate)} years` : "Not set"
    },
    { 
      icon: <User size={20} className="text-rose-500" />, 
      label: "Gender", 
      value: userData.gender || "Not set"
    },
    { 
      icon: <Phone size={20} className="text-rose-500" />, 
      label: "Phone", 
      value: userData.phone || "Not set" 
    },
    { 
      icon: <Mail size={20} className="text-rose-500" />, 
      label: "Email", 
      value: userData.email || "Not set" 
    },
    { 
      icon: <BookOpen size={20} className="text-rose-500" />, 
      label: "Religion", 
      value: userData.religion || "Not set" 
    },
    { 
      icon: <Users size={20} className="text-rose-500" />, 
      label: "Caste", 
      value: userData.caste || "Not set" 
    },
    { 
      icon: <Ruler size={20} className="text-rose-500" />, 
      label: "Height", 
      value: userData.height || "Not set" 
    },
    { 
      icon: <Scale size={20} className="text-rose-500" />, 
      label: "Weight", 
      value: userData.weight || "Not set" 
    },
    { 
      icon: <CircleDollarSign size={20} className="text-rose-500" />, 
      label: "Income", 
      value: userData.income || "Not set" 
    }
  ];


  return (
    <div className="min-h-screen bg-gradient-to-r from-rose-500 to-red-600">
      
      <div className="mx-auto py-8 px-4 sm:px-6 lg:px-8 pt-20">
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          {/* Cover Photo with Gradient Overlay */}
          <div className="h-40 bg-gradient-to-r from-rose-400 to-red-500 relative">
            {!editMode ? (
              <button 
                onClick={() => setEditMode(true)}
                className="absolute top-4 right-4 bg-white p-2 rounded-full hover:bg-gray-100 transition-colors shadow-md"
                aria-label="Edit profile"
              >
                <Pencil size={18} className="text-gray-700" />
              </button>
            ) : null}
          </div>
          
          {/* Profile Content */}
          <div className="relative px-6 pb-6">
            {/* Profile Image */}
            <div className="absolute -top-16 left-6">
              <ProfileImagesManager
                images={editMode ? formData.profileImages : userData.profileImages}
                onUpdate={(images) => setFormData(prev => ({ ...prev, profileImages: images }))}
                editMode={false}
                BASE_IMAGE_URL={BASE_IMAGE_URL}
              />
            </div>

            {/* Profile Info */}
            <div className="pt-20 sm:pt-4 sm:pl-36">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                <div>
                  {editMode ? (
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="text-2xl font-bold border-b-2 border-gray-300 focus:border-rose-500 focus:outline-none px-2 py-1 mb-1 bg-white text-gray-900"
                      placeholder="Your name"
                    />
                  ) : (
                    <h1 className="text-2xl font-bold text-gray-900">{userData.username || "Your Name"}</h1>
                  )}
                  
                  <div className="flex items-center text-gray-500 text-sm mt-1">
                    {userData.city && (
                      <div className="flex items-center mr-3">
                        <MapPin size={14} className="mr-1" />
                        <span>{userData.city}{userData.state ? `, ${userData.state}` : ''}</span>
                      </div>
                    )}
                    {userData.birthDate && (
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        <span>{calculateAge(userData.birthDate)} years</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Verification Badges */}
                <div className="flex space-x-3 mt-4 sm:mt-0">
                  {verifications.map((item, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className={`${item.color} mb-1`}>
                        {item.icon}
                      </div>
                      <span className="text-xs text-gray-500">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Tabs Navigation */}
          <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
            <div className="flex overflow-x-auto scrollbar-hide">
              <button 
                type="button"
                className={`px-4 py-3 font-medium text-sm flex-1 whitespace-nowrap ${activeTab === 'personal' ? 'text-rose-600 border-b-2 border-rose-500' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                onClick={() => {
                  setActiveTab('personal');
                  setIsPhotosEditMode(false);
                }}
              >
                Personal Info
              </button>
              <button 
                type="button"
                className={`px-4 py-3 font-medium text-sm flex-1 whitespace-nowrap ${activeTab === 'education' ? 'text-rose-600 border-b-2 border-rose-500' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                onClick={() => {
                  setActiveTab('education');
                  setIsPhotosEditMode(false);
                }}
              >
                Education
              </button>
              <button 
                type="button"
                className={`px-4 py-3 font-medium text-sm flex-1 whitespace-nowrap ${activeTab === 'career' ? 'text-rose-600 border-b-2 border-rose-500' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                onClick={() => {
                  setActiveTab('career');
                  setIsPhotosEditMode(false);
                }}
              >
                Career
              </button>
              <button 
                type="button"
                className={`px-4 py-3 font-medium text-sm flex-1 whitespace-nowrap ${activeTab === 'languages' ? 'text-rose-600 border-b-2 border-rose-500' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                onClick={() => {
                  setActiveTab('languages');
                  setIsPhotosEditMode(false);
                }}
              >
                Languages
              </button>
              <button 
                type="button"
                className={`px-4 py-3 font-medium text-sm flex-1 whitespace-nowrap ${activeTab === 'images' ? 'text-rose-600 border-b-2 border-rose-500' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                onClick={() => {
                  setActiveTab('images');
                  setIsPhotosEditMode(true); // Special edit mode just for photos
                }}
              >
                Photos
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            {/* Personal Info Tab */}

            {/* Profile Images Section */}
            {activeTab === 'images' && (
              <ProfileImagesManager 
                images={isPhotosEditMode ? formData.profileImages : userData.profileImages}
                onUpdate={(images) => {
                  setFormData(prev => ({ ...prev, profileImages: images }));
                  setEditMode(true); // Set edit mode to true when images are updated
                }}
                editMode={isPhotosEditMode}
                BASE_IMAGE_URL={BASE_IMAGE_URL}
              />
            )}
            {activeTab === 'personal' && (
              <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-900">Personal Information</h2>
                
                {editMode ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="date"
                          name="birthDate"
                          value={formData.birthDate}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 text-sm bg-white text-gray-900"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User size={16} className="text-gray-400" />
                        </div>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 text-sm bg-white text-gray-900"
                        >
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 text-sm bg-white text-gray-900"
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 text-sm bg-white text-gray-900"
                          placeholder="Enter email address"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPin size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 text-sm bg-white text-gray-900"
                          placeholder="Enter country"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 text-sm bg-white text-gray-900"
                        placeholder="Enter state"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 text-sm bg-white text-gray-900"
                        placeholder="Enter city"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Religion</label>
                      <input
                        type="text"
                        name="religion"
                        value={formData.religion}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 text-sm bg-white text-gray-900"
                        placeholder="Enter religion"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Caste</label>
                      <input
                        type="text"
                        name="caste"
                        value={formData.caste}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 text-sm bg-white text-gray-900"
                        placeholder="Enter caste"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                      <input
                        type="text"
                        name="height"
                        value={formData.height}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 text-sm bg-white text-gray-900"
                        placeholder="e.g. 5'10''"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                      <input
                        type="text"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 text-sm bg-white text-gray-900"
                        placeholder="e.g. 70 kg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Income</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CircleDollarSign size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="income"
                          value={formData.income}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 text-sm bg-white text-gray-900"
                          placeholder="Enter income"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6">
                    {personalInfoItems.map((item, index) => (
                      <div key={index} className="flex items-center">
                        <div className="mr-3 flex-shrink-0">{item.icon}</div>
                        <div>
                          <p className="text-xs text-gray-500">{item.label}</p>
                          <p className="font-medium text-gray-900">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Education Tab */}
            {activeTab === 'education' && (
              <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-900">Education</h2>
                
                {editMode ? (
                  <div>
                    {formData.education && formData.education.length > 0 ? (
                      <div className="space-y-3 mb-6">
                        {formData.education.map((edu, index) => (
                          <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex items-center">
                              <div className="bg-rose-100 p-2 rounded-lg mr-3">
                                <GraduationCap className="text-rose-500" size={20} />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{edu.levelName}</div>
                                <div className="text-sm text-gray-700">{edu.degree}</div>
                                {edu.graduationYear && (
                                  <div className="text-xs text-gray-500">{edu.graduationYear}</div>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeEducation(index)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500 mb-6 bg-gray-50 p-4 rounded-lg text-center">
                        No education added yet
                      </div>
                    )}
                    
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                      <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                        <Plus size={18} className="mr-2 text-rose-500" />
                        Add New Education
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Education Level</label>
                          <select
                            value={newEducation.education_level_id}
                            onChange={(e) => setNewEducation({...newEducation, education_level_id: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 text-sm bg-white text-gray-900"
                          >
                            <option value="">Select Level</option>
                            {educationLevels.map((level) => (
                              <option key={level.id} value={level.id}>
                                {level.levelName}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Degree / Course</label>
                          <input
                            type="text"
                            placeholder="e.g. Computer Science"
                            value={newEducation.degree}
                            onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 text-sm bg-white text-gray-900"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
                          <input
                            type="text"
                            placeholder="e.g. 2023"
                            value={newEducation.graduationYear}
                            onChange={(e) => setNewEducation({...newEducation, graduationYear: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 text-sm bg-white text-gray-900"
                          />
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={addEducation}
                        className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors text-sm font-medium"
                      >
                        Add Education
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {userData.education && userData.education.length > 0 ? (
                      <div className="space-y-4">
                        {userData.education.map((edu, index) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex items-start">
                            <div className="bg-rose-100 p-2 rounded-lg mr-3 mt-1">
                              <GraduationCap className="text-rose-500" size={20} />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{edu.levelName}</div>
                              <div className="text-gray-700">{edu.degree}</div>
                              {edu.graduationYear && (
                                <div className="text-sm text-gray-500 mt-1">Graduated: {edu.graduationYear}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                        <GraduationCap size={32} className="mx-auto mb-2 text-gray-400" />
                        <p>No education information available</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Career Tab */}
            {activeTab === 'career' && (
              <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-900">Career</h2>
                
                {editMode ? (
                  <div>
                    {formData.jobs && formData.jobs.length > 0 ? (
                      <div className="space-y-3 mb-6">
                        {formData.jobs.map((job, index) => (
                          <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex items-center">
                              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                                <Briefcase className="text-blue-500" size={20} />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{job.title}</div>
                                {job.company && <div className="text-sm text-gray-700">{job.company}</div>}
                                {job.location && <div className="text-xs text-gray-500">{job.location}</div>}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeJob(index)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500 mb-6 bg-gray-50 p-4 rounded-lg text-center">
                        No job history added yet
                      </div>
                    )}
                    
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                      <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                        <Plus size={18} className="mr-2 text-blue-500" />
                        Add New Job
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                          <select
                            value={newJob.job_title_id}
                            onChange={(e) => setNewJob({...newJob, job_title_id: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-900"
                          >
                            <option value="">Select Job Title</option>
                            {jobTitles.map((job) => (
                              <option key={job.id} value={job.id}>
                                {job.title}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Building2 size={16} className="text-gray-400" />
                            </div>
                            <input
                              type="text"
                              placeholder="e.g. Apple Inc."
                              value={newJob.company}
                              onChange={(e) => setNewJob({...newJob, company: e.target.value})}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-900"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <MapPin size={16} className="text-gray-400" />
                            </div>
                            <input
                              type="text"
                              placeholder="e.g. New York, NY"
                              value={newJob.location}
                              onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-900"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={addJob}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                      >
                        Add Job
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {userData.jobs && userData.jobs.length > 0 ? (
                      <div className="space-y-4">
                        {userData.jobs.map((job, index) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex items-start">
                            <div className="bg-blue-100 p-2 rounded-lg mr-3 mt-1">
                              <Briefcase className="text-blue-500" size={20} />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{job.title}</div>
                              {job.company && <div className="text-gray-700">{job.company}</div>}
                              {job.location && <div className="text-sm text-gray-500 mt-1">{job.location}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                        <Briefcase size={32} className="mx-auto mb-2 text-gray-400" />
                        <p>No career information available</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Languages Tab */}
            {activeTab === 'languages' && (
              <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-900">Languages</h2>
                
                {editMode ? (
                  <div>
                    {formData.languages && formData.languages.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {formData.languages.map((lang) => (
                          <div key={lang.id} className="flex items-center bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                            <Languages size={16} className="text-purple-500 mr-2" />
                            <span className="text-gray-900">{lang.name}</span>
                            <button
                              type="button"
                              onClick={() => removeLanguage(lang.id)}
                              className="ml-2 text-gray-400 hover:text-red-500"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500 mb-6 bg-gray-50 p-4 rounded-lg text-center">
                        No languages added yet
                      </div>
                    )}
                    
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                      <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                        <Plus size={18} className="mr-2 text-purple-500" />
                        Add New Language
                      </h3>
                      
                      <div className="flex gap-3">
                        <select
                          value={newLanguage}
                          onChange={(e) => setNewLanguage(e.target.value)}
                          className="flex-grow px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-sm bg-white text-gray-900"
                        >
                          <option value="">Select a language</option>
                          {availableLanguages.map((lang) => (
                            <option key={lang.id} value={lang.id}>
                              {lang.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={addLanguage}
                          className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    {userData.languages && userData.languages.length > 0 ? (
                      <div className="flex flex-wrap gap-3">
                        {userData.languages.map((lang) => (
                          <div key={lang.id} className="flex items-center bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
                            <Languages className="text-purple-500 mr-2" size={18} />
                            <span className="font-medium text-gray-900">{lang.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                        <Languages size={32} className="mx-auto mb-2 text-gray-400" />
                        <p>No language information available</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            {editMode ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    setFormData({...userData});
                  }}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors flex items-center"
                >
                  <X size={16} className="mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-rose-500 text-white hover:bg-rose-600 font-medium text-sm transition-colors flex items-center shadow-sm"
                >
                  <Save size={16} className="mr-2" />
                  Save Changes
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setEditMode(true)}
                className="px-5 py-2.5 rounded-lg bg-rose-500 text-white hover:bg-rose-600 font-medium text-sm transition-colors flex items-center shadow-sm"
              >
                <Pencil size={16} className="mr-2" />
                Edit Profile
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}