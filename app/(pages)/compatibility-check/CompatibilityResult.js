"use client"
import React, { useEffect, useState } from 'react';
import ModernNavbar from '@/app/_components/Navbar';
import GlobalApi from '@/app/_services/GlobalApi';
import { useRouter } from 'next/navigation';
import { decryptText } from '@/utils/encryption';
import { Heart, Loader2, AlertTriangle, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const CompatibilityResult = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [compatibilityScore, setCompatibilityScore] = useState(null);
  const [inviterDetails, setInviterDetails] = useState([]);
  const [hasRedFlags, setHasRedFlags] = useState(false);
  const router = useRouter();
  const [inviteUserId, setInviteUserId] = useState('');
  const BASE_IMAGE_URL = 'https://wowfy.in/wowfy_app_codebase/photos/';

  const [isRequestSending, setIsRequestSending] = useState(false);
  const [requestStatus, setRequestStatus] = useState(null);

  console.log("inviteUserId", inviteUserId)
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      
      if (searchParams.has('userId')) {        
        const encryptedUserId = searchParams.get('userId');
        console.log("encryptedUserId", encryptedUserId)
        const decryptedUserId = decryptText(encryptedUserId);
        console.log("decryptedUserId", decryptedUserId)

        if (decryptedUserId) {
            setInviteUserId(decryptedUserId);
        }
      }
    }
  }, []); 

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const CheckCompatibility = async () => {
    try {
      setIsLoading(true);
      const resp = await GlobalApi.GetCompatibilityResults(inviteUserId, token);
      if (resp.status === 200) {
        setCompatibilityScore(resp.data.compatibilityScore);
        setInviterDetails(resp.data.inviter);
        
        // Check if API returned red flag information
        if (resp.data.hasRedFlags !== undefined) {
          setHasRedFlags(resp.data.hasRedFlags);
        }
      } else {
        console.error(`Error checking compatibility: Received status ${resp.status}`);
        toast.error("There was an error checking compatibility. Please try again later.");
      }
    } catch (error) {
      console.error("Error fetching Compatibility:", error.message);
      toast.error("There was an error fetching Compatibility. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if(inviteUserId) {
      CheckCompatibility();
    }
  }, [inviteUserId]);

  // Determine the image URL based on inviter's gender
  const inviterImageUrl = inviterDetails.imageUrl
    ? `${BASE_IMAGE_URL}${inviterDetails.imageUrl}`
    : inviterDetails.gender === 'Male'
      ? "https://media.istockphoto.com/id/587805156/vector/profile-picture-vector-illustration.jpg?s=1024x1024&w=is&k=20&c=N14PaYcMX9dfjIQx-gOrJcAUGyYRZ0Ohkbj5lH-GkQs="
      : "https://media.istockphoto.com/id/2060009001/vector/avatar-user-profile-person-icon-profile-picture-for-social-media-profiles-icons-screensavers.jpg?s=1024x1024&w=is&k=20&c=f8-AK6NbqIXHOCGHkZCm_5rqm8t4H7ij9Soiu1OZNdk=";
      
  // Calculate the percentage fill for the compatibility ring
  const circleFill = compatibilityScore ? compatibilityScore : 0;
  const circleCircumference = 2 * Math.PI * 70; // radius 70
  const circleDashoffset = circleCircumference - (circleFill / 100) * circleCircumference;
  
  // Determine the color gradient based on compatibility score
  const getScoreColor = () => {
    if (compatibilityScore >= 80) return "text-green-500";
    if (compatibilityScore >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreMessage = () => {
    if (compatibilityScore >= 80) return "Excellent Match!";
    if (compatibilityScore >= 60) return "Good Match";
    if (compatibilityScore >= 40) return "Average Match";
    return "Low Compatibility";
  };
  
  const handleFollow = () => {
    // Add your follow functionality here
    toast.success("Follow request sent!");
  };

  const handleSendRequest = async () => {
    try {
      setIsRequestSending(true);
      const response = await GlobalApi.SendConnectionRequest(inviteUserId, token);
      
      if (response.status === 201) {
        setRequestStatus('sent');
        toast.success("Connection request sent successfully!");
      } else if (response.status === 409) {
        // Request already exists
        setRequestStatus(response.data.status);
        toast.info(`Connection already ${response.data.status}`);
      }
    } catch (error) {
      console.error("Error sending connection request:", error);
      toast.error("Failed to send connection request. Please try again.");
    } finally {
      setIsRequestSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center text-white">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-xl flex flex-col items-center">
          <Heart className="w-12 h-12 text-white mb-4 animate-pulse" />
          <div className="font-semibold text-xl mb-2">Analyzing compatibility...</div>
          <div className="flex items-center space-x-2">
            <Loader2 className="animate-spin h-5 w-5" />
            <span>Please wait</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-400 to-red-500">
      {/* Navbar */}
       {/* <ModernNavbar /> */}

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-3xl mx-auto">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-rose-500 to-red-600 text-white">
              <div className="flex items-center justify-center">
                <Heart className="w-6 h-6 mr-2" />
                <h1 className="text-xl font-bold">Compatibility Results</h1>
              </div>
            </div>

            {/* Profile and Compatibility Score */}
            <div className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Profile Section */}
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-rose-100">
                    <img 
                      src={inviterImageUrl} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h2 className="mt-4 text-xl font-semibold">
                    {inviterDetails.username ? inviterDetails.username.toUpperCase() : 'Your Match'}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    {inviterDetails.country || 'Location not shared'}
                  </p>
                </div>

                {/* Compatibility Score */}
                <div className="flex-1 flex flex-col items-center">
                  <div className="relative w-44 h-44 flex items-center justify-center">
                    <svg width="160" height="160" viewBox="0 0 160 160" className="transform -rotate-90">
                      {/* Background circle */}
                      <circle 
                        cx="80" 
                        cy="80" 
                        r="70" 
                        fill="none" 
                        stroke="#f1f1f1" 
                        strokeWidth="12"
                      />
                      {/* Progress circle with gradient */}
                      <circle 
                        cx="80" 
                        cy="80" 
                        r="70" 
                        fill="none" 
                        stroke="url(#gradient)" 
                        strokeWidth="12"
                        strokeDasharray={circleCircumference}
                        strokeDashoffset={circleDashoffset}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#f43f5e" />
                          <stop offset="100%" stopColor="#ef4444" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className={`text-4xl font-bold ${getScoreColor()}`}>
                        {compatibilityScore || 0}%
                      </div>
                      <div className="text-sm text-gray-500 mt-1">Compatibility</div>
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="font-semibold text-lg text-gray-700">{getScoreMessage()}</p>
                    <p className="text-sm text-gray-500">Based on your quiz results</p>
                  </div>
                </div>
              </div>

              {/* Red Flag Warning (if applicable) */}
              {hasRedFlags && (
                <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="bg-red-100 p-2 rounded-full">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-red-700">Red Flag Detected</h3>
                      <p className="text-sm text-red-600 mt-1">
                        Your compatibility is affected by one or more red flags.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Follow Button (only if compatibility >= 60%) */}
              {compatibilityScore >= 60 && (
              <div className="mt-8">
                {requestStatus === 'sent' || requestStatus === 'pending' ? (
                  <button
                    disabled
                    className="w-full flex items-center justify-center gap-2 bg-gray-400 text-white py-3 px-4 rounded-xl transition-all shadow-md cursor-not-allowed"
                  >
                    <span>Request Sent</span>
                  </button>
                ) : requestStatus === 'accepted' ? (
                  <button
                    disabled
                    className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-3 px-4 rounded-xl transition-all shadow-md cursor-not-allowed"
                  >
                    <span>Connected</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSendRequest}
                    disabled={isRequestSending}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-red-600 text-white py-3 px-4 rounded-xl hover:opacity-90 transition-all shadow-md"
                  >
                    {isRequestSending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <UserPlus className="w-5 h-5" />
                    )}
                    <span>Send Connection Request</span>
                  </button>
                )}
              </div>
            )}
              {/* Message about compatibility threshold */}
              <div className="mt-8">
                <p className="text-sm text-gray-600 text-center">
                  {compatibilityScore >= 60 
                    ? "You can now send a connection request to this user!" 
                    : "A compatibility score of at least 60% is needed to send a connection request."}
                </p>
                
                {/* Add navigation buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                  <button 
                    onClick={() => router.push('/my-matches')}
                    className="flex items-center justify-center gap-2 bg-rose-100 text-rose-700 py-3 px-4 rounded-xl hover:bg-rose-200 transition-all"
                  >
                    <span>View More Matches</span>
                  </button>
                  
                  <button
                    onClick={() => router.push('/connections')}
                    className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-all"
                  >
                    <span>My Connections</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 text-center text-sm text-gray-500 border-t border-gray-100">
              Qoupled © {new Date().getFullYear()} • Find your perfect match
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompatibilityResult;