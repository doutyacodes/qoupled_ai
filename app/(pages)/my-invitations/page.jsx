"use client"
import { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, Heart, UserPlus, Clock, Calendar, Check, X, Copy, CheckCircle, Share2 } from 'lucide-react';
import ModernNavbar from '@/app/_components/Navbar';
import { encryptText } from '@/utils/encryption';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';

const InvitationsPage = () => {
  const [activeTab, setActiveTab] = useState('sent-invites');
  const [isLoading, setIsLoading] = useState(true);
  const [invitedUsers, setInvitedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [inviteLink, setInviteLink] = useState('');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const itemsPerPage = 5;

  const BASE_IMAGE_URL = 'https://wowfy.in/wowfy_app_codebase/photos/';

  useEffect(() => {
    fetchInvitedUsers();
    generateInviteLink();
  }, []);

  const generateInviteLink = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/invitations/generate-link', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate invite link');
      }
      
      const data = await response.json();
      setInviteLink(data.inviteLink);
    } catch (error) {
      console.error('Error generating invite link:', error);
      toast.error('Failed to generate invite link');
    }
  };

  const fetchInvitedUsers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/invitations/sent', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch invitations');
      }
      
      const data = await response.json();
      setInvitedUsers(data.invitations);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      toast.error('Failed to load invitations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopySuccess(true);
      toast.success('Invite link copied to clipboard!');
      
      setTimeout(() => {
        setCopySuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy link');
    }
  };

  const handleShareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Qoupled',
          text: 'Join me on Qoupled - Find your perfect match!',
          url: inviteLink
        });
        toast.success('Shared successfully!');
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      // Fallback to copy
      handleCopyLink();
    }
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return '';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDifference = today.getMonth() - birth.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getFilteredUsers = () => {
    let filtered = [...invitedUsers];
    
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at) - new Date(a.created_at);
      } else {
        return new Date(a.created_at) - new Date(b.created_at);
      }
    });
    
    return filtered;
  };

  const getPaginatedItems = (items) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(getFilteredUsers().length / itemsPerPage);
  
  const handleViewProfile = (userId) => {
    window.location.href = `/profile/${userId}/view-profile`;
  };

  const handleCheckCompatibility = (userId) => {
    const userIdToEncrypt = String(userId)
    let encryptedUserId = encryptText(userIdToEncrypt)
    window.location.href = `compatibility-check?userId=${encodeURIComponent(encryptedUserId)}`;
  };

  const checkUserEligibility = (user) => {
    const firstQuizCompleted = user.quiz_sequence && user.quiz_sequence.isCompleted;
    const secondTestCompleted = user.test_progress && user.test_progress.length >= 25;
    
    return firstQuizCompleted && secondTestCompleted;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-400 to-red-500">
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '12px',
          },
        }}
      />

      {/* Invite Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Your Invite Link</h3>
              <button 
                onClick={() => setShowLinkModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Share this link with people you'd like to invite to Qoupled. When they sign up using this link, they'll appear in your invitations list.
              </p>
              
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-800 break-all font-mono">
                  {inviteLink}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleCopyLink}
                className="flex-1 flex items-center justify-center px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors font-medium"
              >
                {copySuccess ? (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-5 w-5 mr-2" />
                    Copy Link
                  </>
                )}
              </button>
              
              <button
                onClick={handleShareLink}
                className="flex-1 flex items-center justify-center px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors font-medium"
              >
                <Share2 className="h-5 w-5 mr-2" />
                Share
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-20 pb-12">
        <div className="max-w-5xl mx-auto">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-rose-500 to-red-600 text-white">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center">
                  <Image src={"/transparent_logo.png"} width={60} height={40} alt="Logo" />
                  <h1 className="text-2xl font-bold">Manage Invitations</h1>
                </div>
                <button
                  onClick={() => setShowLinkModal(true)}
                  className="px-6 py-3 bg-white text-rose-600 rounded-xl hover:bg-rose-50 transition-all duration-200 font-semibold flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Generate Invite Link
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-col sm:flex-row border-b">
              <button
                className={`flex-1 py-5 font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === 'sent-invites' ? 'text-rose-600 border-rose-600' : 'text-gray-500 border-transparent hover:text-rose-500'
                }`}
                onClick={() => setActiveTab('sent-invites')}
              >
                <div className="flex items-center justify-center">
                  <UserPlus className="w-5 h-5 mr-2" />
                  <span>Sent Invites ({invitedUsers.length})</span>
                </div>
              </button>
            </div>

            {/* Search and Filter */}
            <div className="p-6 border-b">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 text-base"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                {/* Filter Button */}
                <div className="relative">
                  <button
                    className="w-full sm:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors duration-200 text-base"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                  >
                    <Filter className="h-5 w-5 mr-2 text-gray-600" />
                    <span className="text-gray-600">Sort</span>
                    <ChevronDown className={`h-5 w-5 ml-2 text-gray-600 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Filter Dropdown */}
                  {isFilterOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border border-gray-100">
                      <button
                        className={`w-full px-4 py-3 text-left hover:bg-rose-50 ${sortBy === 'newest' ? 'text-rose-600 font-medium' : 'text-gray-700'}`}
                        onClick={() => {
                          setSortBy('newest');
                          setIsFilterOpen(false);
                        }}
                      >
                        Newest First
                      </button>
                      <button
                        className={`w-full px-4 py-3 text-left hover:bg-rose-50 ${sortBy === 'oldest' ? 'text-rose-600 font-medium' : 'text-gray-700'}`}
                        onClick={() => {
                          setSortBy('oldest');
                          setIsFilterOpen(false);
                        }}
                      >
                        Oldest First
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-6">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-t-2 border-rose-500"></div>
                </div>
              ) : (
                <>
                  {/* Information Message */}
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                    <p className="text-blue-700 text-sm">
                      <strong>Note:</strong> Only users who have registered using your shared invitation link will appear in this list.
                    </p>
                  </div>
                  
                  {/* Sent Invites Tab */}
                  {getPaginatedItems(getFilteredUsers()).length > 0 ? (
                    <div className="space-y-5">
                      {getPaginatedItems(getFilteredUsers()).map((user) => (
                        <div 
                          key={user.id} 
                          className="border border-gray-200 rounded-xl p-5 hover:border-rose-300 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex flex-col sm:flex-row items-center">
                            <div className="flex-shrink-0 mb-4 sm:mb-0">
                              <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-rose-100 shadow-md">
                                <img 
                                  src={user.profileImageUrl ? `${BASE_IMAGE_URL}${user.profileImageUrl}` : '/default-avatar.png'} 
                                  alt={user.username} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                            <div className="sm:ml-6 flex-1 text-center sm:text-left">
                              <h3 className="font-semibold text-lg text-gray-900">{user.username}, {calculateAge(user.birthDate)}</h3>
                              <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 mt-1">
                                <div className="flex items-center justify-center sm:justify-start">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  <span>Invited on: {formatDate(user.created_at)}</span>
                                </div>
                                <span className="hidden sm:inline mx-2">•</span>
                                <div className="flex items-center justify-center sm:justify-start mt-1 sm:mt-0">
                                  {user.isProfileComplete ? (
                                    <div className="flex items-center text-green-600">
                                      <Check className="w-4 h-4 mr-1" />
                                      <span>Profile Complete</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center text-amber-600">
                                      <Clock className="w-4 h-4 mr-1" />
                                      <span>Profile Incomplete</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                                <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs rounded-full">
                                  {user.quiz_sequence && user.quiz_sequence.isCompleted ? 
                                    "First Test Completed" : "First Test Pending"}
                                </span>
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                  {user.test_progress && user.test_progress.length >= 25 ? 
                                    "Second Test Completed" : "Second Test Pending"}
                                </span>
                              </div>
                            </div>
                            <div className="mt-4 sm:mt-0 flex flex-col space-y-2">
                              <button
                                onClick={() => handleViewProfile(user.user_id)}
                                className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors duration-200 font-medium w-full"
                              >
                                View Profile
                              </button>
                              
                              <button
                                onClick={() => handleCheckCompatibility(user.user_id)}
                                disabled={!checkUserEligibility(user)}
                                className={`px-6 py-2 rounded-lg transition-colors duration-200 font-medium w-full ${
                                  checkUserEligibility(user) 
                                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                }`}
                              >
                                Check Compatibility
                              </button>
                            </div>
                          </div>

                          {!checkUserEligibility(user) && (
                            <div className="mt-3 p-2 bg-amber-50 border border-amber-100 rounded-md">
                              <p className="text-amber-700 text-xs">
                                This user needs to complete both tests before you can check compatibility.
                              </p>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="mt-8 flex justify-center">
                          <div className="flex space-x-1">
                            <button
                              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                              disabled={currentPage === 1}
                              className={`px-4 py-2 rounded-md ${
                                currentPage === 1 
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              Previous
                            </button>
                            
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-4 py-2 rounded-md ${
                                  currentPage === page
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              >
                                {page}
                              </button>
                            ))}
                            
                            <button
                              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                              disabled={currentPage === totalPages}
                              className={`px-4 py-2 rounded-md ${
                                currentPage === totalPages
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="text-gray-400 mb-4">
                        <UserPlus className="h-16 w-16 mx-auto" />
                      </div>
                      <h3 className="text-xl font-medium text-gray-900">No invitations sent yet</h3>
                      <p className="text-gray-500 mt-2">Share your invitation link with others to connect</p>
                      <button
                        onClick={() => setShowLinkModal(true)}
                        className="mt-6 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors font-medium"
                      >
                        Generate Invite Link
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitationsPage;