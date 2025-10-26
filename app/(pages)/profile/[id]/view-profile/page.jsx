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
  Globe,
  Target,
  Sparkles
} from 'lucide-react';
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { encryptText } from '@/utils/encryption';
import { motion } from 'framer-motion';
import { BASE_IMAGE_URL } from '@/utils/constants';
import { getDefaultImage } from '@/utils/defaultImages';

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

  const [compatibilityScore, setCompatibilityScore] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [loadingConnection, setLoadingConnection] = useState(false);

  const [showCompatibilityAlert, setShowCompatibilityAlert] = useState(false);
  const [compatibilityAlertMessage, setCompatibilityAlertMessage] = useState('');

  useEffect(() => {
    async function fetchUserData() {
      try {
        const token = localStorage.getItem("token");
        
        // Fetch user data
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
        
        // Fetch compatibility score
        const compatResponse = await fetch(`/api/users/${userId}/compatibility`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (compatResponse.ok) {
          const compatData = await compatResponse.json();
          if (compatData.hasCompatibility) {
            setCompatibilityScore(compatData.score);
          } else {
            // Store the message for showing in UI
            setCompatibilityScore(compatData);
          }
        }
        
        // Fetch connection status
        const connResponse = await fetch(`/api/connections/connect-status/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (connResponse.ok) {
          const connData = await connResponse.json();
          if (connData.hasConnection) {
            setConnectionStatus(connData);
          }
        }
        
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

  const handleSendConnectionRequest = async () => {
    setLoadingConnection(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch('/api/connections/send-request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: parseInt(userId),
          connectionType: 'regular',
          isPremiumConnection: false
        })
      });
      
      if (response.ok) {
        // Update connection status
        setConnectionStatus({
          hasConnection: true,
          status: 'pending',
          isCurrentUserSender: true
        });
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to send connection request');
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
      alert('Failed to send connection request');
    } finally {
      setLoadingConnection(false);
    }
  };

  const handleCompatibilityCheck = (e) => {
    if (compatibilityScore && typeof compatibilityScore !== 'number') {
      e.preventDefault();
      
      if (!compatibilityScore.targetUserCompletedTest) {
        setCompatibilityAlertMessage('This user has not completed the compatibility test yet. Compatibility score cannot be calculated.');
      } else if (!compatibilityScore.currentUserCompletedTest) {
        setCompatibilityAlertMessage('You need to complete the compatibility test first before checking compatibility with other users.');
      } else {
        setCompatibilityAlertMessage('Compatibility has not been calculated yet. Please try checking compatibility.');
      }
      
      setShowCompatibilityAlert(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl"
        >
          <div className="flex flex-col items-center">
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              <User className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Loading Profile</h2>
            <p className="text-white/80 text-sm">Getting user information...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl max-w-md w-full text-center"
        >
          <div className="bg-red-500/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <User className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            {error ? 'Error Loading Profile' : 'User Not Found'}
          </h2>
          <p className="text-white/80 mb-8">
            {error || "The user profile you're looking for doesn't exist."}
          </p>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.back()}
            className="bg-white text-rose-600 px-8 py-3 rounded-xl font-semibold transition-colors shadow-lg hover:bg-gray-100"
          >
            Go Back
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Verification items
  const verifications = [
    { 
      active: userData.isProfileVerified, 
      text: "Photo", 
      icon: <Shield className="h-4 w-4" />
    },
    { 
      active: userData.isEmailVerified, 
      text: "Email", 
      icon: <Mail className="h-4 w-4" />
    },
    { 
      active: userData.isPhoneVerified, 
      text: "Phone", 
      icon: <Phone className="h-4 w-4" />
    },
    { 
      active: true, 
      text: "Identity", 
      icon: <Verified className="h-4 w-4" />
    }
  ];

  // Profile stats
  const profileStats = [
    // { label: "Match Score", value: "92%", icon: <Star className="h-5 w-5" /> },
    { 
      label: "Compatibility", 
      value: compatibilityScore && typeof compatibilityScore === 'number' 
        ? `${compatibilityScore}%` 
        : compatibilityScore?.targetUserCompletedTest === false 
          ? "Not Taken" 
          : compatibilityScore?.currentUserCompletedTest === false
            ? "Take Test"
            : "N/A", 
      icon: <Heart className="h-5 w-5" />,
      alert: compatibilityScore && typeof compatibilityScore !== 'number'
    },
    // { label: "Profile Views", value: "1.2k", icon: <User className="h-5 w-5" /> }
  ];

  // Personal info items with lookingFor added
  const personalInfo = [
    { 
      icon: <Calendar className="h-5 w-5 text-white" />, 
      label: "Age", 
      value: userData.birthDate ? calculateAge(userData.birthDate) : "Not set",
      category: "basic"
    },
    { 
      icon: <User className="h-5 w-5 text-white" />, 
      label: "Gender", 
      value: userData.gender || "Not set",
      category: "basic"
    },
    { 
      icon: <Target className="h-5 w-5 text-white" />, 
      label: "Looking For", 
      value: userData.lookingFor || "Not set",
      category: "basic",
      highlight: true
    },
    { 
      icon: <MapPin className="h-5 w-5 text-white" />, 
      label: "Location", 
      value: userData.city ? `${userData.city}, ${userData.country || 'India'}` : "Not set",
      category: "basic"
    },
    { 
      icon: <BookOpen className="h-5 w-5 text-white" />, 
      label: "Religion", 
      value: userData.religion || "Not set",
      category: "personal"
    },
    { 
      icon: <Users className="h-5 w-5 text-white" />, 
      label: "Caste", 
      value: userData.caste || "Not set",
      category: "personal"
    },
    { 
      icon: <Ruler className="h-5 w-5 text-white" />, 
      label: "Height", 
      value: userData.height ? `${userData.height} cm` : "Not set",
      category: "physical"
    },
    { 
      icon: <Scale className="h-5 w-5 text-white" />, 
      label: "Weight", 
      value: userData.weight ? `${userData.weight} kg` : "Not set",
      category: "physical"
    },
    { 
      icon: <CircleDollarSign className="h-5 w-5 text-white" />, 
      label: "Income", 
      value: userData.income || "Not set",
      category: "professional"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-400 via-pink-500 to-purple-600">
      {/* Compatibility Alert Modal */}
      {showCompatibilityAlert && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowCompatibilityAlert(false)}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="bg-rose-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-rose-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Compatibility Test Required
              </h3>
              <p className="text-gray-600 mb-6">
                {compatibilityAlertMessage}
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCompatibilityAlert(false)}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:from-rose-600 hover:to-pink-700 transition-all"
              >
                Got It
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.back()}
            className="flex items-center bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl transition-all shadow-lg border border-white/30"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="font-medium">Back</span>
          </motion.button>
          
          <div className="flex items-center space-x-3">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleBookmark}
              className={`p-3 rounded-xl transition-all shadow-lg border border-white/30 ${
                isBookmarked 
                  ? 'bg-white text-rose-500' 
                  : 'bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white'
              }`}
            >
              {isBookmarked ? <BookmarkCheck className="h-6 w-6" /> : <Bookmark className="h-6 w-6" />}
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-xl transition-all shadow-lg border border-white/30"
            >
              <Share2 className="h-6 w-6" />
            </motion.button>
          </div>
        </motion.div>

        {/* Profile Header Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden mb-8"
        >
          <div className="p-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
              {/* Profile Image */}
              <div className="relative flex-shrink-0">
                <div className="w-40 h-40 lg:w-48 lg:h-48 rounded-3xl overflow-hidden border-4 border-white/30 shadow-2xl">
                  <Image 
                    src={userData.profileImageUrl ? `${BASE_IMAGE_URL}${userData.profileImageUrl}` : getDefaultImage(userData.gender)}
                    alt={userData.username}
                    width={192}
                    height={192}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Online status */}
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 border-4 border-white rounded-full flex items-center justify-center shadow-lg">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 w-full text-center lg:text-left">
                <div className="mb-6">
                  <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3 flex items-center justify-center lg:justify-start flex-wrap gap-3">
                    {userData.username}
                    {userData.isProfileVerified && (
                      <Verified className="h-8 w-8 text-blue-400" />
                    )}
                  </h1>
                  <p className="text-white/90 text-xl">
                    {calculateAge(userData.birthDate)} years old • {userData.city || 'Location not set'}
                  </p>
                </div>

                {/* Profile Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {profileStats.map((stat, index) => (
                    <motion.div 
                      key={index} 
                      whileHover={{ scale: 1.05 }}
                      className={`backdrop-blur-sm rounded-2xl p-4 text-center border ${
                        stat.alert 
                          ? 'bg-orange-500/20 border-orange-400/30' 
                          : 'bg-white/20 border-white/30'
                      }`}
                    >
                      <div className="flex items-center justify-center mb-2 text-white">
                        {stat.icon}
                      </div>
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-white/80 text-sm">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Verification Badges */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-6">
                  {verifications.map((verification, index) => (
                    <motion.div 
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className={`flex items-center px-4 py-2 rounded-full text-sm font-medium border-2 ${
                        verification.active 
                          ? 'bg-white text-rose-600 border-white shadow-lg' 
                          : 'bg-white/20 text-white border-white/30'
                      }`}
                    >
                      {verification.icon}
                      <span className="ml-2">{verification.text}</span>
                      {verification.active && <CheckCircle className="h-4 w-4 ml-2" />}
                    </motion.div>
                  ))}
                </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">

                {compatibilityScore && typeof compatibilityScore !== 'number' && !compatibilityScore.targetUserCompletedTest ? (
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCompatibilityCheck}
                      className="flex-1 flex items-center justify-center bg-white text-rose-600 px-6 py-4 rounded-xl font-bold transition-colors shadow-lg hover:bg-gray-100"
                    >
                      <Heart className="h-5 w-5 mr-2" />
                      Check Compatibility
                    </motion.button>
                  ) : (
                    <Link 
                      href={`/compatibility-check?userId=${encodeURIComponent(encryptText(`${userId}`))}`}
                      className="flex-1"
                      onClick={handleCompatibilityCheck}
                    >
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center bg-white text-rose-600 px-6 py-4 rounded-xl font-bold transition-colors shadow-lg hover:bg-gray-100"
                      >
                        <Heart className="h-5 w-5 mr-2" />
                        Check Compatibility
                      </motion.button>
                    </Link>
                  )}
                {/* Dynamic Connection/Message Button */}
                {!connectionStatus ? (
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSendConnectionRequest}
                    disabled={loadingConnection}
                    className="flex-1 flex items-center justify-center bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-4 rounded-xl font-bold transition-all border border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserPlus className="h-5 w-5 mr-2" />
                    {loadingConnection ? 'Sending...' : 'Send Connection Request'}
                  </motion.button>
                ) : connectionStatus.status === 'pending' ? (
                  <motion.button 
                    className="flex-1 flex items-center justify-center bg-yellow-500/20 backdrop-blur-sm text-white px-6 py-4 rounded-xl font-bold border border-yellow-500/30 cursor-default"
                  >
                    <Clock className="h-5 w-5 mr-2" />
                    Request Sent
                  </motion.button>
                ) : connectionStatus.status === 'accepted' ? (
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 flex items-center justify-center bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-4 rounded-xl font-bold transition-all border border-white/30"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Send Message
                  </motion.button>
                ) : null}
              </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8 overflow-x-auto"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-2 border border-white/20 shadow-xl">
            <div className="flex space-x-2 min-w-max">
              {[
                { id: 'overview', label: 'Overview', icon: <User className="h-5 w-5" /> },
                { id: 'details', label: 'Details', icon: <Globe className="h-5 w-5" /> },
                { id: 'education', label: 'Education', icon: <GraduationCap className="h-5 w-5" /> },
                { id: 'career', label: 'Career', icon: <Briefcase className="h-5 w-5" /> }
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-rose-600 shadow-lg'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  {tab.icon}
                  <span className="ml-2">{tab.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20"
              >
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <User className="h-6 w-6 mr-3" />
                  Personal Information
                </h3>
                <div className="space-y-4">
                  {personalInfo.filter(info => info.category === 'basic').map((info, index) => (
                    <motion.div 
                      key={index} 
                      whileHover={{ scale: 1.02 }}
                      className={`flex items-center justify-between p-4 rounded-2xl border ${
                        info.highlight 
                          ? 'bg-gradient-to-r from-rose-500/30 to-pink-500/30 border-white/40' 
                          : 'bg-white/10 border-white/20'
                      }`}
                    >
                      <div className="flex items-center">
                        {info.icon}
                        <span className="text-white font-semibold ml-3">{info.label}</span>
                      </div>
                      <span className="text-white font-bold">{info.value}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Contact Information */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20"
              >
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Mail className="h-6 w-6 mr-3" />
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/20"
                  >
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-white" />
                      <span className="text-white font-semibold ml-3">Email</span>
                    </div>
                    <span className="text-white font-bold text-sm break-all">{userData.email || "Not provided"}</span>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/20"
                  >
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-white" />
                      <span className="text-white font-semibold ml-3">Phone</span>
                    </div>
                    <span className="text-white font-bold">{userData.phone || "Not provided"}</span>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20"
              >
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <BookOpen className="h-6 w-6 mr-3" />
                  Personal Details
                </h3>
                <div className="space-y-4">
                  {personalInfo.filter(info => info.category === 'personal').map((info, index) => (
                    <motion.div 
                      key={index} 
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/20"
                    >
                      <div className="flex items-center">
                        {info.icon}
                        <span className="text-white font-semibold ml-3">{info.label}</span>
                      </div>
                      <span className="text-white font-bold">{info.value}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20"
              >
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Ruler className="h-6 w-6 mr-3" />
                  Physical Details
                </h3>
                <div className="space-y-4">
                  {personalInfo.filter(info => info.category === 'physical').map((info, index) => (
                    <motion.div 
                      key={index} 
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/20"
                    >
                      <div className="flex items-center">
                        {info.icon}
                        <span className="text-white font-semibold ml-3">{info.label}</span>
                      </div>
                      <span className="text-white font-bold">{info.value}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {/* Education & Career tabs remain similar but with updated styling */}
          {activeTab === 'education' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20"
            >
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <GraduationCap className="h-6 w-6 mr-3" />
                Education Background
              </h3>
              {userData.education && userData.education.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userData.education.map((edu, index) => (
                    <motion.div 
                      key={index} 
                      whileHover={{ scale: 1.02 }}
                      className="bg-white/10 p-6 rounded-2xl border border-white/20"
                    >
                      <div className="flex items-start">
                        <div className="bg-blue-500 rounded-full p-3 mr-4">
                          <GraduationCap className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-white mb-2">{edu.degree}</h4>
                          <p className="text-white/80 mb-2">{edu.levelName}</p>
                          <div className="flex items-center text-white/70">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span className="text-sm">Graduated in {edu.graduationYear}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <GraduationCap className="h-16 w-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/70 text-lg">No education information available</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'career' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20"
              >
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Briefcase className="h-6 w-6 mr-3" />
                  Work Experience
                </h3>
                {userData.jobs && userData.jobs.length > 0 ? (
                  <div className="space-y-6">
                    {userData.jobs.map((job, index) => (
                      <motion.div 
                        key={index} 
                        whileHover={{ scale: 1.02 }}
                        className="bg-white/10 p-6 rounded-2xl border border-white/20"
                      >
                        <div className="flex items-start">
                          <div className="bg-green-500 rounded-full p-3 mr-4">
                            <Building className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-xl font-bold text-white mb-2">{job.title}</h4>
                            <p className="text-white/80 mb-2">{job.company}</p>
                            <div className="flex items-center text-white/70">
                              <MapPin className="h-4 w-4 mr-2" />
                              <span className="text-sm">{job.location}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Briefcase className="h-16 w-16 text-white/30 mx-auto mb-4" />
                    <p className="text-white/70 text-lg">No work experience available</p>
                  </div>
                )}
              </motion.div>

              <div className="space-y-8">
                {/* Languages */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20"
                >
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <Languages className="h-6 w-6 mr-3" />
                    Languages
                  </h3>
                  {userData.languages && userData.languages.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {userData.languages.map((language, index) => (
                        <motion.span 
                          key={index} 
                          whileHover={{ scale: 1.05 }}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-3 rounded-full text-sm font-semibold shadow-lg"
                        >
                          {language}
                        </motion.span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Languages className="h-12 w-12 text-white/30 mx-auto mb-3" />
                      <p className="text-white/70">No languages listed</p>
                    </div>
                  )}
                </motion.div>

                {/* Professional Info */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20"
                >
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <CircleDollarSign className="h-6 w-6 mr-3" />
                    Professional Details
                  </h3>
                  <div className="space-y-4">
                    {personalInfo.filter(info => info.category === 'professional').map((info, index) => (
                      <motion.div 
                        key={index} 
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/20"
                      >
                        <div className="flex items-center">
                          {info.icon}
                          <span className="text-white font-semibold ml-3">{info.label}</span>
                        </div>
                        <span className="text-white font-bold">{info.value}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}