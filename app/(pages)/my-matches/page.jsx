'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Heart, 
  MapPin, 
  Calendar, 
  GraduationCap, 
  Briefcase, 
  Verified, 
  Star, 
  Sparkles, 
  AlertTriangle,
  Loader2,
  Filter,
  X,
  ChevronDown,
  Eye,
  MessageCircle,
  UserPlus,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import Image from 'next/image';
import { encryptText } from '@/utils/encryption';

export default function ModernMyMatches() {
  const router = useRouter();
  const [matches, setMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [savedProfiles, setSavedProfiles] = useState([]);
  
  // Filter states
  const [filters, setFilters] = useState({
    matchQuality: 'all',
    hasRedFlags: 'all',
    minAge: 18,
    maxAge: 40,
    country: 'all',
    isVerified: false
  });

  const [filterOptions, setFilterOptions] = useState({
    countries: []
  });

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const BASE_IMAGE_URL = 'https://wowfy.in/wowfy_app_codebase/photos/';

  // Fetch matches from API
  useEffect(() => {
    const fetchMatches = async () => {
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        setLoading(true);
        const response = await fetch('/api/matches/top-soulmates', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (data.success) {
          setMatches(data.matches);
          setFilteredMatches(data.matches);
          
          // Extract filter options
          const countries = [...new Set(data.matches.map(match => match.country).filter(Boolean))];
          setFilterOptions({ countries });
          
          // Load saved profiles from localStorage
          const saved = JSON.parse(localStorage.getItem('savedProfiles') || '[]');
          setSavedProfiles(saved);
        } else {
          setError(data.message || 'Failed to fetch matches');
        }
      } catch (err) {
        console.error('Error fetching matches:', err);
        setError('Failed to load matches. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [token, router]);

  // Apply filters
  useEffect(() => {
    let result = [...matches];

    // Filter by match quality
    if (filters.matchQuality !== 'all') {
      result = result.filter(match => match.matchQuality === filters.matchQuality);
    }

    // Filter by red flags
    if (filters.hasRedFlags !== 'all') {
      const hasRedFlags = filters.hasRedFlags === 'true';
      result = result.filter(match => match.hasRedFlags === hasRedFlags);
    }

    // Filter by age range
    result = result.filter(match => 
      match.age >= filters.minAge && match.age <= filters.maxAge
    );

    // Filter by country
    if (filters.country !== 'all') {
      result = result.filter(match => match.country === filters.country);
    }

    // Filter by verification status
    if (filters.isVerified) {
      result = result.filter(match => match.isProfileVerified);
    }

    setFilteredMatches(result);
  }, [filters, matches]);

  const toggleSaveProfile = (userId) => {
    setSavedProfiles(prev => {
      const newSaved = prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId];
      
      localStorage.setItem('savedProfiles', JSON.stringify(newSaved));
      return newSaved;
    });
  };

  const resetFilters = () => {
    setFilters({
      matchQuality: 'all',
      hasRedFlags: 'all',
      minAge: 18,
      maxAge: 40,
      country: 'all',
      isVerified: false
    });
  };

  const getQualityColor = (quality) => {
    switch (quality) {
      case 'exceptional': return 'from-emerald-500 to-green-600';
      case 'great': return 'from-blue-500 to-indigo-600';
      case 'good': return 'from-amber-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getQualityText = (quality) => {
    switch (quality) {
      case 'exceptional': return 'Exceptional';
      case 'great': return 'Great Match';
      case 'good': return 'Good Match';
      default: return 'Match';
    }
  };

  const getDefaultImage = (gender) => {
    return gender === 'Female' 
      ? "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop"
      : "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-400 via-pink-500 to-purple-600 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center">
            <div className="relative">
              <Loader2 className="h-12 w-12 text-white animate-spin" />
              <Heart className="h-6 w-6 text-white absolute top-3 left-3 animate-pulse" />
            </div>
            <h2 className="text-xl font-semibold text-white mt-4">Finding Your Soulmates</h2>
            <p className="text-white/80 text-sm mt-2">Analyzing compatibility scores...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-400 via-pink-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl max-w-md w-full text-center">
          <AlertTriangle className="h-16 w-16 text-white mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Oops! Something went wrong</h2>
          <p className="text-white/80 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-white text-rose-600 px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-400 via-pink-500 to-purple-600">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 mr-3">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">Your Soulmates</h1>
          </div>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Discover your top 10 most compatible matches based on our advanced compatibility algorithm
          </p>
          <div className="flex items-center justify-center mt-4 space-x-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <span className="text-white font-medium">{matches.length} Total Matches</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <span className="text-white font-medium">{filteredMatches.length} Filtered Results</span>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg"
            >
              <Filter className="h-5 w-5 mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
              <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            {showFilters && (
              <button 
                onClick={resetFilters}
                className="text-white/80 hover:text-white text-sm font-medium flex items-center"
              >
                <X className="h-4 w-4 mr-1" />
                Reset All
              </button>
            )}
          </div>

          {showFilters && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Match Quality Filter */}
                <div>
                  <label className="block text-white font-medium mb-2">Match Quality</label>
                  <select
                    value={filters.matchQuality}
                    onChange={(e) => setFilters(prev => ({ ...prev, matchQuality: e.target.value }))}
                    className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-white/50 focus:border-transparent"
                  >
                    <option value="all" className="text-gray-800">All Qualities</option>
                    <option value="exceptional" className="text-gray-800">Exceptional (80%+)</option>
                    <option value="great" className="text-gray-800">Great (60-79%)</option>
                    <option value="good" className="text-gray-800">Good (&lt;60%)</option>
                  </select>
                </div>

                {/* Red Flags Filter */}
                <div>
                  <label className="block text-white font-medium mb-2">Red Flags</label>
                  <select
                    value={filters.hasRedFlags}
                    onChange={(e) => setFilters(prev => ({ ...prev, hasRedFlags: e.target.value }))}
                    className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-white/50 focus:border-transparent"
                  >
                    <option value="all" className="text-gray-800">All Matches</option>
                    <option value="false" className="text-gray-800">No Red Flags</option>
                    <option value="true" className="text-gray-800">Has Red Flags</option>
                  </select>
                </div>

                {/* Country Filter */}
                <div>
                  <label className="block text-white font-medium mb-2">Country</label>
                  <select
                    value={filters.country}
                    onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-white/50 focus:border-transparent"
                  >
                    <option value="all" className="text-gray-800">All Countries</option>
                    {filterOptions.countries.map(country => (
                      <option key={country} value={country} className="text-gray-800">{country}</option>
                    ))}
                  </select>
                </div>

                {/* Age Range */}
                <div className="md:col-span-2">
                  <label className="block text-white font-medium mb-2">
                    Age Range: {filters.minAge} - {filters.maxAge}
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="18"
                      max="60"
                      value={filters.minAge}
                      onChange={(e) => setFilters(prev => ({ ...prev, minAge: parseInt(e.target.value) }))}
                      className="flex-1 accent-white"
                    />
                    <span className="text-white text-sm">to</span>
                    <input
                      type="range"
                      min="18"
                      max="60"
                      value={filters.maxAge}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxAge: parseInt(e.target.value) }))}
                      className="flex-1 accent-white"
                    />
                  </div>
                </div>

                {/* Verified Profiles */}
                <div>
                  <label className="flex items-center text-white font-medium">
                    <input
                      type="checkbox"
                      checked={filters.isVerified}
                      onChange={(e) => setFilters(prev => ({ ...prev, isVerified: e.target.checked }))}
                      className="mr-3 rounded border-white/30 text-white focus:ring-white/50 bg-white/20"
                    />
                    Verified profiles only
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Matches Grid */}
        {filteredMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMatches.map((match, index) => (
              <div 
                key={match.id} 
                className="group bg-white/10 backdrop-blur-lg rounded-3xl overflow-hidden shadow-xl border border-white/20 hover:bg-white/15 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
              >
                {/* Image Section */}
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={match.profileImageUrl ? `${BASE_IMAGE_URL}${match.profileImageUrl}` : getDefaultImage(match.gender)}
                    alt={match.username}
                    width={400}
                    height={256}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  
                  {/* Overlay with rank and save button */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                    <div className="absolute top-4 left-4 flex items-center space-x-2">
                      {index < 3 && (
                        <div className="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                          #{index + 1}
                        </div>
                      )}
                      <div className={`bg-gradient-to-r ${getQualityColor(match.matchQuality)} text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg`}>
                        {getQualityText(match.matchQuality)}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => toggleSaveProfile(match.id)}
                      className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                    >
                      {savedProfiles.includes(match.id) ? (
                        <BookmarkCheck className="h-5 w-5 text-white" />
                      ) : (
                        <Bookmark className="h-5 w-5 text-white" />
                      )}
                    </button>
                    
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-white">{match.username}</h3>
                          <div className="flex items-center text-white/90 text-sm mt-1">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{match.age} years old</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                            <div className="flex items-center text-white">
                              <Sparkles className="h-4 w-4 mr-1" />
                              <span className="font-bold">{match.compatibilityScore}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6">
                  {/* Location and Status */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-white/80 text-sm">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{match.city ? `${match.city}, ${match.country}` : match.country || 'Location not shared'}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {match.isProfileVerified && (
                        <div className="bg-blue-500/20 backdrop-blur-sm rounded-full px-3 py-1 flex items-center">
                          <Verified className="h-3 w-3 text-blue-400 mr-1" />
                          <span className="text-blue-400 text-xs font-medium">Verified</span>
                        </div>
                      )}
                      
                      {match.hasRedFlags && (
                        <div className="bg-red-500/20 backdrop-blur-sm rounded-full px-3 py-1 flex items-center">
                          <AlertTriangle className="h-3 w-3 text-red-400 mr-1" />
                          <span className="text-red-400 text-xs font-medium">Red Flags</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="space-y-2 mb-4">
                    {match.job && (
                      <div className="flex items-center text-white/80 text-sm">
                        <Briefcase className="h-4 w-4 mr-2" />
                        <span>{match.job.title}{match.job.company && ` at ${match.job.company}`}</span>
                      </div>
                    )}
                    
                    {match.education && (
                      <div className="flex items-center text-white/80 text-sm">
                        <GraduationCap className="h-4 w-4 mr-2" />
                        <span>{match.education.degree} in {match.education.levelName}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => router.push(`/profile/${match.id}/view-profile`)}
                      className="flex items-center justify-center bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white py-3 px-4 rounded-xl font-medium transition-all border border-white/30"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Profile
                    </button>
                    
                    <button
                      onClick={() => router.push(`/compatibility-check?userId=${encodeURIComponent(encryptText(String(match.id)))}`)}
                      className="flex items-center justify-center bg-white text-purple-600 hover:bg-gray-100 py-3 px-4 rounded-xl font-medium transition-all shadow-lg"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md mx-auto">
              <Heart className="h-16 w-16 text-white/60 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">No matches found</h3>
              <p className="text-white/80 mb-6">
                {matches.length === 0 
                  ? "Complete your compatibility quiz to find your soulmates!" 
                  : "Try adjusting your filters to see more matches."}
              </p>
              
              {matches.length === 0 ? (
                <button
                  onClick={() => router.push('/compatability-quiz')}
                  className="bg-white text-purple-600 px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors shadow-lg"
                >
                  Take Compatibility Quiz
                </button>
              ) : (
                <button
                  onClick={resetFilters}
                  className="bg-white text-purple-600 px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors shadow-lg"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}