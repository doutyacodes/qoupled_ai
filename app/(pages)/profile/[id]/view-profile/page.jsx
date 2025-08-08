"use client";

import {
  BookOpen,
  Briefcase,
  CircleDollarSign,
  Clock,
  GraduationCap,
  Heart,
  Languages,
  Mail,
  MapPin,
  Phone,
  Ruler, 
  Scale,
  User,
  Users,
  Shield,
  CheckCircle,
  Star,
  ArrowLeft,
  Share2,
  Bookmark,
  BookmarkCheck,
  MessageCircle,
  UserPlus,
  Verified,
  Award,
  Calendar,
  Building,
  Globe
} from 'lucide-react';
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { encryptText } from '@/utils/encryption';

// Helper function to calculate age
function calculateAge(birthDate) {
  if (!birthDate) return "Not set";
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return `${age}`;
}

export default function ModernUserProfile() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id;
  
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const BASE_IMAGE_URL = 'https://wowfy.in/wowfy_app_codebase/photos/';

  useEffect(() => {
    async function fetchUserData() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/users/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await response.json();
        setUserData(data.user);
        
        // Check if bookmarked
        const bookmarks = JSON.parse(localStorage.getItem('savedProfiles') || '[]');
        setIsBookmarked(bookmarks.includes(parseInt(userId)));
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    fetchUserData();
  }, [userId]);

  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('savedProfiles') || '[]');
    const userIdNum = parseInt(userId);
    
    if (isBookmarked) {
      const newBookmarks = bookmarks.filter(id => id !== userIdNum);
      localStorage.setItem('savedProfiles', JSON.stringify(newBookmarks));
    } else {
      bookmarks.push(userIdNum);
      localStorage.setItem('savedProfiles', JSON.stringify(bookmarks));
    }
    setIsBookmarked(!isBookmarked);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-100 flex items-center justify-center p-4">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200/50">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-rose-500 rounded-full animate-spin"></div>
              <User className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-rose-500" />
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">Loading Profile</h2>
            <p className="text-gray-600 text-sm md:text-base">Getting user information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-100 flex items-center justify-center p-4">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg max-w-md w-full text-center border border-gray-200/50">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {error ? 'Error Loading Profile' : 'User Not Found'}
          </h2>
          <p className="text-gray-600 mb-6 text-sm md:text-base">
            {error || "The user profile you're looking for doesn't exist."}
          </p>
          <button 
            onClick={() => router.back()}
            className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Verification items with subtle styling
  const verifications = [
    { 
      active: userData.isProfileVerified, 
      text: "Photo", 
      icon: <Shield className="h-4 w-4" />,
      color: "bg-blue-500"
    },
    { 
      active: userData.isEmailVerified, 
      text: "Email", 
      icon: <Mail className="h-4 w-4" />,
      color: "bg-green-500"
    },
    { 
      active: userData.isPhoneVerified, 
      text: "Phone", 
      icon: <Phone className="h-4 w-4" />,
      color: "bg-purple-500"
    },
    { 
      active: true, 
      text: "Identity", 
      icon: <Verified className="h-4 w-4" />,
      color: "bg-amber-500"
    }
  ];

  // Profile stats for the header
  const profileStats = [
    { label: "Score", value: "92%", icon: <Star className="h-4 w-4" /> },
    { label: "Matches", value: "127", icon: <Heart className="h-4 w-4" /> },
    { label: "Views", value: "1.2k", icon: <User className="h-4 w-4" /> }
  ];

  // Personal info items
  const personalInfo = [
    { 
      icon: <Calendar className="h-4 w-4 text-rose-500" />, 
      label: "Age", 
      value: userData.birthDate ? calculateAge(userData.birthDate) : "Not set",
      category: "basic"
    },
    { 
      icon: <User className="h-4 w-4 text-rose-500" />, 
      label: "Gender", 
      value: userData.gender || "Not set",
      category: "basic"
    },
    { 
      icon: <MapPin className="h-4 w-4 text-rose-500" />, 
      label: "Location", 
      value: userData.city ? `${userData.city}, ${userData.country || 'India'}` : "Not set",
      category: "basic"
    },
    { 
      icon: <BookOpen className="h-4 w-4 text-rose-500" />, 
      label: "Religion", 
      value: userData.religion || "Not set",
      category: "personal"
    },
    { 
      icon: <Users className="h-4 w-4 text-rose-500" />, 
      label: "Caste", 
      value: userData.caste || "Not set",
      category: "personal"
    },
    { 
      icon: <Ruler className="h-4 w-4 text-rose-500" />, 
      label: "Height", 
      value: userData.height ? `${userData.height} cm` : "Not set",
      category: "physical"
    },
    { 
      icon: <Scale className="h-4 w-4 text-rose-500" />, 
      label: "Weight", 
      value: userData.weight ? `${userData.weight} kg` : "Not set",
      category: "physical"
    },
    { 
      icon: <CircleDollarSign className="h-4 w-4 text-rose-500" />, 
      label: "Income", 
      value: userData.income || "Not set",
      category: "professional"
    }
  ];

  const getDefaultImage = (gender) => {
    return gender === 'Female' 
      ? "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop"
      : "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-100">
      <div className="container mx-auto px-4 py-4 md:py-6 max-w-6xl">
        {/* Header with navigation */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <button 
            onClick={() => router.back()}
            className="flex items-center bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 px-3 py-2 md:px-4 md:py-2 rounded-lg transition-colors border border-gray-200/50 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" />
            <span className="text-sm md:text-base">Back</span>
          </button>
          
          <div className="flex items-center space-x-2 md:space-x-3">
            <button 
              onClick={toggleBookmark}
              className={`p-2 md:p-3 rounded-lg transition-colors border border-gray-200/50 shadow-sm ${
                isBookmarked 
                  ? 'bg-rose-500 text-white' 
                  : 'bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700'
              }`}
            >
              {isBookmarked ? <BookmarkCheck className="h-4 w-4 md:h-5 md:w-5" /> : <Bookmark className="h-4 w-4 md:h-5 md:w-5" />}
            </button>
            
            <button className="p-2 md:p-3 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 rounded-lg transition-colors border border-gray-200/50 shadow-sm">
              <Share2 className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          </div>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden mb-6 md:mb-8">
          <div className="p-4 md:p-8">
            <div className="flex flex-col items-center text-center md:flex-row md:text-left md:items-start gap-4 md:gap-8">
              {/* Profile Image */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
                  <Image 
                    src={userData.profileImageUrl ? `${BASE_IMAGE_URL}${userData.profileImageUrl}` : getDefaultImage(userData.gender)}
                    alt={userData.username}
                    width={160}
                    height={160}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Online status indicator */}
                <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 w-6 h-6 md:w-8 md:h-8 bg-green-500 border-3 md:border-4 border-white rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 md:w-3 md:h-3 bg-white rounded-full"></div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 w-full">
                <div className="mb-4">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center md:justify-start flex-wrap gap-2">
                    {userData.username}
                    {userData.isProfileVerified && (
                      <Verified className="h-6 w-6 md:h-8 md:w-8 text-blue-500" />
                    )}
                  </h1>
                  <p className="text-gray-600 text-base md:text-lg">
                    {calculateAge(userData.birthDate)} years old • {userData.city || 'Location not set'}
                  </p>
                </div>

                {/* Profile Stats */}
                <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6">
                  {profileStats.map((stat, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg md:rounded-xl p-3 md:p-4 text-center border border-gray-200/50">
                      <div className="flex items-center justify-center mb-1 md:mb-2 text-gray-600">
                        {stat.icon}
                      </div>
                      <div className="text-lg md:text-2xl font-bold text-gray-800">{stat.value}</div>
                      <div className="text-gray-600 text-xs md:text-sm">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Verification Badges */}
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4 md:mb-6">
                  {verifications.map((verification, index) => (
                    <div 
                      key={index}
                      className={`flex items-center px-2 py-1 md:px-3 md:py-2 rounded-full text-xs md:text-sm font-medium border ${
                        verification.active 
                          ? `${verification.color} text-white shadow-sm` 
                          : 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}
                    >
                      {verification.icon}
                      <span className="ml-1 md:ml-2">{verification.text}</span>
                      {verification.active && <CheckCircle className="h-3 w-3 md:h-4 md:w-4 ml-1" />}
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
                  <Link 
                    href={`/compatibility-check?userId=${encodeURIComponent(encryptText(`${userId}`))}`}
                    className="flex items-center justify-center bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium transition-colors shadow-md text-sm md:text-base"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Check Compatibility
                  </Link>
                  
                  <button className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium transition-colors border border-gray-200 text-sm md:text-base">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send Message
                  </button>
                  
                  <button className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium transition-colors border border-gray-200 text-sm md:text-base">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Connect
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-6 md:mb-8 overflow-x-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-1 md:p-2 border border-gray-200/50 shadow-sm">
            <div className="flex space-x-1 md:space-x-2 min-w-max">
              {[
                { id: 'overview', label: 'Overview', icon: <User className="h-3 w-3 md:h-4 md:w-4" /> },
                { id: 'details', label: 'Details', icon: <Globe className="h-3 w-3 md:h-4 md:w-4" /> },
                { id: 'education', label: 'Education', icon: <GraduationCap className="h-3 w-3 md:h-4 md:w-4" /> },
                { id: 'career', label: 'Career', icon: <Briefcase className="h-3 w-3 md:h-4 md:w-4" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-3 py-2 md:px-6 md:py-3 rounded-lg font-medium transition-all text-xs md:text-sm ${
                    activeTab === tab.id
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.icon}
                  <span className="ml-1 md:ml-2 whitespace-nowrap">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6 md:space-y-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {/* Personal Information */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-8 shadow-lg border border-gray-200/50">
                <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center">
                  <User className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3" />
                  Personal Information
                </h3>
                <div className="space-y-3 md:space-y-6">
                  {personalInfo.filter(info => info.category === 'basic').map((info, index) => (
                    <div key={index} className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg md:rounded-xl border border-gray-200/50">
                      <div className="flex items-center">
                        {info.icon}
                        <span className="text-gray-700 font-medium ml-2 md:ml-3 text-sm md:text-base">{info.label}</span>
                      </div>
                      <span className="text-gray-800 font-semibold text-sm md:text-base">{info.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-8 shadow-lg border border-gray-200/50">
                <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center">
                  <Mail className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3" />
                  Contact Information
                </h3>
                <div className="space-y-3 md:space-y-6">
                  <div className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg md:rounded-xl border border-gray-200/50">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-rose-500" />
                      <span className="text-gray-700 font-medium ml-2 md:ml-3 text-sm md:text-base">Email</span>
                    </div>
                    <span className="text-gray-800 font-semibold text-sm md:text-base break-all">{userData.email || "Not provided"}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg md:rounded-xl border border-gray-200/50">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-rose-500" />
                      <span className="text-gray-700 font-medium ml-2 md:ml-3 text-sm md:text-base">Phone</span>
                    </div>
                    <span className="text-gray-800 font-semibold text-sm md:text-base">{userData.phone || "Not provided"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {/* Personal Details */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-8 shadow-lg border border-gray-200/50">
                <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center">
                  <BookOpen className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3" />
                  Personal Details
                </h3>
                <div className="space-y-3 md:space-y-6">
                  {personalInfo.filter(info => info.category === 'personal').map((info, index) => (
                    <div key={index} className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg md:rounded-xl border border-gray-200/50">
                      <div className="flex items-center">
                        {info.icon}
                        <span className="text-gray-700 font-medium ml-2 md:ml-3 text-sm md:text-base">{info.label}</span>
                      </div>
                      <span className="text-gray-800 font-semibold text-sm md:text-base">{info.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Physical Details */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-8 shadow-lg border border-gray-200/50">
                <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center">
                  <Ruler className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3" />
                  Physical Details
                </h3>
                <div className="space-y-3 md:space-y-6">
                  {personalInfo.filter(info => info.category === 'physical').map((info, index) => (
                    <div key={index} className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg md:rounded-xl border border-gray-200/50">
                      <div className="flex items-center">
                        {info.icon}
                        <span className="text-gray-700 font-medium ml-2 md:ml-3 text-sm md:text-base">{info.label}</span>
                      </div>
                      <span className="text-gray-800 font-semibold text-sm md:text-base">{info.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Education Tab */}
          {activeTab === 'education' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-8 shadow-lg border border-gray-200/50">
              <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center">
                <GraduationCap className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3" />
                Education Background
              </h3>
              {userData.education && userData.education.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {userData.education.map((edu, index) => (
                    <div key={index} className="bg-gray-50 p-4 md:p-6 rounded-lg md:rounded-2xl border border-gray-200/50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-start">
                        <div className="bg-blue-500 rounded-full p-2 md:p-3 mr-3 md:mr-4">
                          <GraduationCap className="h-4 w-4 md:h-6 md:w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base md:text-xl font-semibold text-gray-800 mb-1 md:mb-2">{edu.degree}</h4>
                          <p className="text-gray-600 mb-1 md:mb-2 text-sm md:text-base">{edu.levelName}</p>
                          <div className="flex items-center text-gray-500">
                            <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                            <span className="text-xs md:text-sm">Graduated in {edu.graduationYear}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 md:py-12">
                  <GraduationCap className="h-12 w-12 md:h-16 md:w-16 text-gray-300 mx-auto mb-3 md:mb-4" />
                  <p className="text-gray-500 text-base md:text-lg">No education information available</p>
                </div>
              )}
            </div>
          )}

          {/* Career Tab */}
          {activeTab === 'career' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {/* Work Experience */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-8 shadow-lg border border-gray-200/50">
                <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center">
                  <Briefcase className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3" />
                  Work Experience
                </h3>
                {userData.jobs && userData.jobs.length > 0 ? (
                  <div className="space-y-4 md:space-y-6">
                    {userData.jobs.map((job, index) => (
                      <div key={index} className="bg-gray-50 p-4 md:p-6 rounded-lg md:rounded-2xl border border-gray-200/50 hover:bg-gray-100 transition-colors">
                        <div className="flex items-start">
                          <div className="bg-green-500 rounded-full p-2 md:p-3 mr-3 md:mr-4">
                            <Building className="h-4 w-4 md:h-6 md:w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-base md:text-xl font-semibold text-gray-800 mb-1 md:mb-2">{job.title}</h4>
                            <p className="text-gray-600 mb-1 md:mb-2 text-sm md:text-base">{job.company}</p>
                            <div className="flex items-center text-gray-500">
                              <MapPin className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                              <span className="text-xs md:text-sm">{job.location}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 md:py-12">
                    <Briefcase className="h-12 w-12 md:h-16 md:w-16 text-gray-300 mx-auto mb-3 md:mb-4" />
                    <p className="text-gray-500 text-base md:text-lg">No work experience available</p>
                  </div>
                )}
              </div>

              {/* Languages & Professional Info */}
              <div className="space-y-6 md:space-y-8">
                {/* Languages */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-8 shadow-lg border border-gray-200/50">
                  <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center">
                    <Languages className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3" />
                    Languages
                  </h3>
                  {userData.languages && userData.languages.length > 0 ? (
                    <div className="flex flex-wrap gap-2 md:gap-3">
                      {userData.languages.map((language, index) => (
                        <span 
                          key={index} 
                          className="bg-purple-500 text-white px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium shadow-sm"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 md:py-8">
                      <Languages className="h-8 w-8 md:h-12 md:w-12 text-gray-300 mx-auto mb-2 md:mb-3" />
                      <p className="text-gray-500 text-sm md:text-base">No languages listed</p>
                    </div>
                  )}
                </div>

                {/* Professional Info */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-8 shadow-lg border border-gray-200/50">
                  <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center">
                    <CircleDollarSign className="h-5 w-5 md:h-6 md:w-6 mr-2 md:mr-3" />
                    Professional Details
                  </h3>
                  <div className="space-y-3 md:space-y-4">
                    {personalInfo.filter(info => info.category === 'professional').map((info, index) => (
                      <div key={index} className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg md:rounded-xl border border-gray-200/50">
                        <div className="flex items-center">
                          {info.icon}
                          <span className="text-gray-700 font-medium ml-2 md:ml-3 text-sm md:text-base">{info.label}</span>
                        </div>
                        <span className="text-gray-800 font-semibold text-sm md:text-base">{info.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}