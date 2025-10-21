"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Heart,
  LogOut,
  UserPlus,
  X,
  User,
  Menu,
  ChevronDown,
  Users,
  Home,
  MessageCircle,
  Bot,
  Lock,
  CheckCircle,
  AlertCircle,
  TestTube2,
  Sparkles,
  Send,
  Bell,
  Crown,
  Zap
} from "lucide-react";
import Image from "next/image";

const ModernNavbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [quizStatus, setQuizStatus] = useState(null);
  const [canAccessChats, setCanAccessChats] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  // Fetch user data and quiz completion status on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          // Fetch user details
          const userResponse = await fetch('/api/user/details', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            if (userData.success) {
              setUser(userData.user);
            }
          }

          // Check quiz completion status
          const quizResponse = await fetch('/api/user/quiz-completion-status', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (quizResponse.ok) {
            const quizData = await quizResponse.json();
            setCanAccessChats(quizData.canAccessChats);
            setQuizStatus(quizData.quizStatus);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleChatAccess = () => {
    if (canAccessChats) {
      router.push("/chats");
    } else {
      if (!quizStatus?.personalityTest?.completed) {
        router.push("/tests");
      } else if (!quizStatus?.compatibilityTest?.completed) {
        router.push("/tests");
      }
    }
  };

  const handleGroupChatAccess = () => {
    if (canAccessChats) {
      router.push("/group-chats");
    } else {
      if (!quizStatus?.personalityTest?.completed) {
        router.push("/tests");
      } else if (!quizStatus?.compatibilityTest?.completed) {
        router.push("/tests");
      }
    }
  };

  const getQuizStatusBadge = () => {
    if (loading) return null;
    if (canAccessChats) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Verified
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
        <AlertCircle className="h-3 w-3 mr-1" />
          Complete Tests
      </span>
    );
  };

  const getPlanBadge = () => {
    if (!user?.currentPlan) return null;
    
    const planConfig = {
      free: { color: "bg-gray-100 text-gray-800", icon: null },
      pro: { color: "bg-blue-100 text-blue-800", icon: <Zap className="h-3 w-3 mr-1" /> },
      elite: { color: "bg-purple-100 text-purple-800", icon: <Crown className="h-3 w-3 mr-1" /> }
    };

    const config = planConfig[user.currentPlan] || planConfig.free;

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {user.currentPlan.charAt(0).toUpperCase() + user.currentPlan.slice(1)}
      </span>
    );
  };

  // Helper function to check if current path is active
  const isActivePath = (path) => {
    if (path === "/") {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  // Get user display name (uses username since there's no separate name field)
  const getUserDisplayName = () => {
    if (!user) return "";
    return user.name || user.username || "User";
  };

  // Get user initial for avatar
  const getUserInitial = () => {
    if (!user) return "U";
    const displayName = getUserDisplayName();
    return displayName.charAt(0).toUpperCase();
  };

  // Navigation items with their paths and icons
  const navItems = [
    { path: "/my-matches", label: "My Matches", icon: Sparkles },
    { path: "/connections", label: "Connections", icon: Users },
    { path: "/my-room", label: "My Room", icon: Home },
    { path: "/group-chats", label: "Groups", icon: MessageCircle, locked: !canAccessChats },
    { path: "/chats", label: "AI Chat", icon: Bot, locked: !canAccessChats },
  ];

  return (
    <>
      <nav className="w-full bg-gradient-to-r from-rose-500 via-rose-600 to-red-600 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo - Hidden on mobile, shown on desktop */}
            <div className="flex-shrink-0 flex items-center lg:block hidden">
              <Image 
                src="/Full_transparent_logo.png" 
                width={140} 
                height={45} 
                alt="Logo"
                className="cursor-pointer"
                onClick={() => router.push("/")}
              />
            </div>

            {/* Mobile Logo - Centered */}
            <div className="flex-shrink-0 flex items-center lg:hidden absolute left-1/2 transform -translate-x-1/2">
              <Image 
                src="/Full_transparent_logo.png" 
                width={120} 
                height={40} 
                alt="Logo"
                className="cursor-pointer"
                onClick={() => router.push("/")}
              />
            </div>

            {/* Desktop Navigation - Center */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.path);
                const isLocked = item.locked;
                
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      if (item.path === "/group-chats") {
                        handleGroupChatAccess();
                      } else if (item.path === "/chats") {
                        handleChatAccess();
                      } else {
                        router.push(item.path);
                      }
                    }}
                    className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                      isLocked
                        ? "text-white/60 cursor-not-allowed"
                        : isActive
                        ? "bg-white/30 text-white shadow-sm"
                        : "text-white hover:bg-white/20"
                    }`}
                    title={isLocked ? "Complete tests to unlock" : item.label}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                    {isLocked && <Lock className="h-3 w-3 ml-1.5 opacity-60" />}
                  </button>
                );
              })}
            </div>

            {/* Desktop Right Section */}
            <div className="hidden lg:flex items-center space-x-3">
              {/* Tests */}
              <button
                onClick={() => router.push("/tests")}
                className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                  isActivePath("/tests")
                    ? "bg-white/30 text-white shadow-sm"
                    : "text-white hover:bg-white/20"
                }`}
              >
                <TestTube2 className="h-4 w-4 mr-2" />
                Tests
              </button>

              {/* Invite Button */}
              <button
                onClick={() => router.push("/my-invitations")}
                className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 font-medium shadow-sm ${
                  isActivePath("/my-invitations")
                    ? "bg-white text-rose-600"
                    : "bg-white text-rose-600 hover:bg-white/90"
                }`}
              >
                <Send className="h-4 w-4 mr-2" />
                Invite
              </button>

              {/* Profile Dropdown */}
              {user && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleProfileDropdown}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActivePath("/profile") || isActivePath("/my-profile")
                        ? "bg-white/30"
                        : "hover:bg-white/20"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-rose-600 font-semibold text-sm">
                      {getUserInitial()}
                    </div>
                    <ChevronDown className="h-4 w-4 text-white" />
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-semibold text-lg">
                            {getUserInitial()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{getUserDisplayName()}</p>
                            <p className="text-sm text-gray-500">View your profile</p>
                          </div>
                        </div>
                        
                        {/* Status Badges */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Account Status:</span>
                          {getQuizStatusBadge()}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Plan:</span>
                          {getPlanBadge()}
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <button
                          onClick={() => {
                            router.push("/profile/my-profile");
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        >
                          <User className="h-4 w-4 mr-3" />
                          My Profile
                        </button>
                        
                        <button
                          onClick={() => {
                            router.push("/about");
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        >
                          <Heart className="h-4 w-4 mr-3" />
                          About Us
                        </button>
                      </div>

                      <div className="border-t border-gray-100 py-1">
                        <button
                          onClick={() => {
                            logout();
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-lg text-white hover:bg-white/20 transition-colors"
              onClick={toggleMobileMenu}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
            onClick={toggleMobileMenu}
          ></div>
          
          {/* Menu Panel */}
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform">
            {/* Mobile menu header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-rose-500 via-rose-600 to-red-600">
              <div className="flex-1"></div>
              <Image
                src="/Full_transparent_logo.png"
                width={120}
                height={40}
                alt="Logo"
                className="mx-auto"
              />
              <div className="flex-1 flex justify-end">
                <button 
                  onClick={toggleMobileMenu} 
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto h-full pb-20">
              {/* User Profile Section */}
              {user && (
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-rose-50 to-pink-50">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-semibold text-xl">
                      {getUserInitial()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">{getUserDisplayName()}</p>
                      <p className="text-sm text-gray-600">Welcome back!</p>
                    </div>
                  </div>
                  
                  {/* Status Badges */}
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      {getQuizStatusBadge()}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Plan:</span>
                      {getPlanBadge()}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Items */}
              <div className="py-2">
                {/* Primary Actions */}
                <div className="px-2 py-2">
                  <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Find Your Match
                  </p>
                  
                  <button
                    onClick={() => {
                      router.push("/my-matches");
                      toggleMobileMenu();
                    }}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                      isActivePath("/my-matches")
                        ? "bg-rose-50 text-rose-600"
                        : "text-gray-700 hover:bg-rose-50 hover:text-rose-600"
                    }`}
                  >
                    <Sparkles className="h-5 w-5 mr-3" />
                    <span className="font-medium">My Matches</span>
                  </button>

                  <button
                    onClick={() => {
                      router.push("/tests");
                      toggleMobileMenu();
                    }}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                      isActivePath("/tests")
                        ? "bg-rose-50 text-rose-600"
                        : "text-gray-700 hover:bg-rose-50 hover:text-rose-600"
                    }`}
                  >
                    <TestTube2 className="h-5 w-5 mr-3" />
                    <span className="font-medium">Take Tests</span>
                  </button>
                </div>

                <div className="h-px bg-gray-200 my-2"></div>

                {/* Communication */}
                <div className="px-2 py-2">
                  <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Communication
                  </p>

                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = isActivePath(item.path);
                    const isLocked = item.locked;
                    
                    return (
                      <button
                        key={item.path}
                        onClick={() => {
                          if (item.path === "/group-chats") {
                            handleGroupChatAccess();
                            if (canAccessChats) toggleMobileMenu();
                          } else if (item.path === "/chats") {
                            handleChatAccess();
                            if (canAccessChats) toggleMobileMenu();
                          } else {
                            router.push(item.path);
                            toggleMobileMenu();
                          }
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                          isLocked
                            ? "text-gray-400"
                            : isActive
                            ? "bg-rose-50 text-rose-600"
                            : "text-gray-700 hover:bg-rose-50 hover:text-rose-600"
                        }`}
                      >
                        <div className="flex items-center">
                          <Icon className="h-5 w-5 mr-3" />
                          <span className="font-medium">{item.label}</span>
                        </div>
                        {isLocked && <Lock className="h-4 w-4" />}
                      </button>
                    );
                  })}
                </div>

                <div className="h-px bg-gray-200 my-2"></div>

                {/* Invite Section */}
                <div className="px-2 py-2">
                  <button
                    onClick={() => {
                      router.push("/my-invitations");
                      toggleMobileMenu();
                    }}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-all shadow-sm ${
                      isActivePath("/my-invitations")
                        ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white"
                        : "bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600"
                    }`}
                  >
                    <Send className="h-5 w-5 mr-3" />
                    <span className="font-medium">Invite Friends</span>
                  </button>
                </div>

                <div className="h-px bg-gray-200 my-2"></div>

                {/* Account Section */}
                <div className="px-2 py-2">
                  <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Account
                  </p>

                  <button
                    onClick={() => {
                      router.push("/profile/my-profile");
                      toggleMobileMenu();
                    }}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                      isActivePath("/profile") || isActivePath("/my-profile")
                        ? "bg-rose-50 text-rose-600"
                        : "text-gray-700 hover:bg-rose-50 hover:text-rose-600"
                    }`}
                  >
                    <User className="h-5 w-5 mr-3" />
                    <span className="font-medium">My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      router.push("/about");
                      toggleMobileMenu();
                    }}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                      isActivePath("/about")
                        ? "bg-rose-50 text-rose-600"
                        : "text-gray-700 hover:bg-rose-50 hover:text-rose-600"
                    }`}
                  >
                    <Heart className="h-5 w-5 mr-3" />
                    <span className="font-medium">About Us</span>
                  </button>

                  <button
                    onClick={logout}
                    className="w-full flex items-center px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-2"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ModernNavbar;