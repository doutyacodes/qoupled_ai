"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Filter,
  Loader2,
  AlertTriangle,
  Search,
  Users,
  Sparkles,
  Zap,
  UserCheck,
  MapPin,
  X,
  Bookmark,
  BookmarkCheck,
  Check,
  Clock,
} from "lucide-react";
import GlobalApi from "@/app/_services/GlobalApi";
import ModernNavbar from "@/app/_components/Navbar";
import Image from "next/image";

const MatchedUsersPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [compatibilityRange, setCompatibilityRange] = useState([50, 100]);
  const [showCompatibleOnly, setShowCompatibleOnly] = useState(false);
  const [savedProfiles, setSavedProfiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);

  // Fetch saved profiles
  useEffect(() => {
    const fetchSavedProfiles = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await GlobalApi.GetSavedProfiles(token);
        if (response.status === 200) {
          setSavedProfiles(response.data.favoriteProfiles || []);
        }
      } catch (error) {
        console.error("Error fetching saved profiles:", error);
        // Non-critical error, don't show to user
      }
    };

    fetchSavedProfiles();
  }, []);

  // Fetch matched users
  useEffect(() => {
    const fetchMatchedUsers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        // Get min compatibility from range
        const minCompat = compatibilityRange[0];

        const response = await GlobalApi.GetMatchedUsers(
          token,
          minCompat,
          showCompatibleOnly
        );

        if (response.status === 200) {
          const matchedUsers = response.data.matchedUsers || [];
          setUsers(matchedUsers);
          setFilteredUsers(matchedUsers);
        } else {
          setError("Failed to fetch matches. Please try again later.");
        }
      } catch (error) {
        console.error("Error fetching matched users:", error);
        setError(
          "An error occurred while fetching your matches. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatchedUsers();
  }, [router, compatibilityRange, showCompatibleOnly]);

  // Filter users based on search query and active filters
  useEffect(() => {
    if (!users.length) return;

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(
        (user) =>
          user.name?.toLowerCase().includes(query) ||
          user.location?.toLowerCase().includes(query) ||
          user.interests?.some((interest) =>
            interest.toLowerCase().includes(query)
          )
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [users, searchQuery]);

  const toggleSaveProfile = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const action = savedProfiles.includes(userId) ? "remove" : "add";

      // Optimistic UI update
      if (action === "add") {
        setSavedProfiles([...savedProfiles, userId]);
      } else {
        setSavedProfiles(savedProfiles.filter((id) => id !== userId));
      }

      // Make API call
      await GlobalApi.ToggleFavoriteProfile(userId, action, token);
    } catch (error) {
      console.error("Error saving profile:", error);

      // Revert optimistic update if API call fails
      if (savedProfiles.includes(userId)) {
        setSavedProfiles(savedProfiles.filter((id) => id !== userId));
      } else {
        setSavedProfiles([...savedProfiles, userId]);
      }

      // Show error to user
      setError("Failed to save profile. Please try again.");

      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    }
  };

  const resetFilters = () => {
    setCompatibilityRange([50, 100]);
    setShowCompatibleOnly(false);
    setSearchQuery("");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-rose-500 animate-spin mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">
            Finding your matches...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-400 to-red-500">
       {/* <ModernNavbar /> */}
      {/* App header */}
      <div className="w-full bg-white/10 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Image src={"/Full_transparent_logo.png"} width={90} height={40} />
          </div>
          <button
            onClick={() => router.push("/tests")}
            className="flex items-center text-white bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-sm"
          >
            <Users className="h-4 w-4 mr-2" />
            <span>My Tests</span>
          </button>
        </div>
      </div>

      {/* Page content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Page title */}
        <div className="text-center mb-8 text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Your Matches</h1>
          <p className="max-w-2xl mx-auto opacity-90">
            Discover people who match with you based on our compatibility
            algorithm
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start mb-8">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Warning banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start mb-8">
          <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-800">
              Qoupled Compatibility
            </h3>
            <p className="text-sm text-amber-700 mt-1">
              Our proprietary algorithm calculates compatibility based on
              personality traits and preferences. Results may vary and are
              intended as a starting point for meaningful connections.
            </p>
          </div>
        </div>

        {/* Search and filter section */}
        <div className="bg-white rounded-xl shadow-md mb-8">
          <div className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search box */}
              <div className="flex-grow">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-rose-500 focus:border-rose-500 block w-full pl-10 p-2.5"
                    placeholder="Search by name, location, or interests"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setSearchQuery("")}
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>

              {/* Filter button */}
              <button
                className={`flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  showFilters
                    ? "bg-rose-100 text-rose-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>
            </div>

            {/* Filter options */}
            {showFilters && (
              <div className="mt-6 border-t border-gray-100 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Compatibility filter */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Compatibility Range: {compatibilityRange[0]}% -{" "}
                      {compatibilityRange[1]}%
                    </label>
                    <div className="relative pt-1">
                      <input
                        type="range"
                        min="50"
                        max="100"
                        step="5"
                        value={compatibilityRange[0]}
                        onChange={(e) =>
                          setCompatibilityRange([
                            parseInt(e.target.value),
                            compatibilityRange[1],
                          ])
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <input
                        type="range"
                        min="50"
                        max="100"
                        step="5"
                        value={compatibilityRange[1]}
                        onChange={(e) =>
                          setCompatibilityRange([
                            compatibilityRange[0],
                            parseInt(e.target.value),
                          ])
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 px-2 mt-2">
                        <span>50%</span>
                        <span>75%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>

                  {/* Qoupled compatibility checkbox */}
                  <div>
                    <div className="flex items-center mt-3">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={showCompatibleOnly}
                          onChange={() =>
                            setShowCompatibleOnly(!showCompatibleOnly)
                          }
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                        <span className="ms-3 text-sm font-medium text-gray-700">
                          Show Qoupled Compatibility Only
                        </span>
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 ml-14">
                      Filter to show only profiles that match your personality
                      type
                    </p>
                  </div>
                </div>

                {/* Reset filters button */}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Sparkles className="h-5 w-5 mr-2" />
              {filteredUsers.length} Matches Found
            </h2>
            <div className="text-white text-sm">
              {savedProfiles.length} profiles saved
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="flex justify-center mb-4">
                <Search className="h-12 w-12 text-gray-300" />
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">
                No Matches Found
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Try adjusting your filters or search criteria to find more
                potential matches.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1"
                >
                  {/* Card header with image */}
                  <div className="relative h-48">
                    <img
                      src={user.imageUrl}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => toggleSaveProfile(user.id)}
                        className={`p-2 rounded-full ${
                          savedProfiles.includes(user.id)
                            ? "bg-rose-500 text-white"
                            : "bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-white"
                        } transition-colors`}
                      >
                        {savedProfiles.includes(user.id) ? (
                          <BookmarkCheck className="h-5 w-5" />
                        ) : (
                          <Bookmark className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    {/* Compatibility badge */}
                    {user.isCompatible && (
                      <div className="absolute top-3 left-3">
                        <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center shadow-md">
                          <Check className="h-3 w-3 mr-1" />
                          Qoupled Match
                        </div>
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-white">
                          {user.name}, {user.age}
                        </h3>
                        <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-white text-sm flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {user.location}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card content */}
                  <div className="p-4">
                    {/* Compatibility score */}
                    <div className="flex items-center mb-4">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
                          user.compatibility >= 80
                            ? "bg-green-100 text-green-600"
                            : user.compatibility >= 65
                            ? "bg-blue-100 text-blue-600"
                            : "bg-amber-100 text-amber-600"
                        }`}
                      >
                        <Zap className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">
                          Compatibility Score
                        </div>
                        <div
                          className={`text-lg font-semibold ${
                            user.compatibility >= 80
                              ? "text-green-600"
                              : user.compatibility >= 65
                              ? "text-blue-600"
                              : "text-amber-600"
                          }`}
                        >
                          {user.compatibility}%
                        </div>
                      </div>
                    </div>

                    {/* Interests */}
                    {user.interests?.length > 0 && (
                      <div className="mb-4">
                        <div className="text-sm text-gray-500 mb-2">
                          Interests
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {user.interests.map((interest, index) => (
                            <span
                              key={index}
                              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex space-x-2 mt-4">
                      <button
                        className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                        onClick={() => router.push(`/profile/${user.id}`)}
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        View Profile
                      </button>
                      <button
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                        onClick={() => router.push(`/compatibility/${user.id}`)}
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Match Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchedUsersPage;
