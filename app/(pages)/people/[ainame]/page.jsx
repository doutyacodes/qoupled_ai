"use client"

import React, { useState } from 'react';
import { 
  Heart, 
  UserPlus, 
  MapPin, 
  Briefcase, 
  Calendar,
  Star,
  Filter,
  Search,
  Users,
  Sparkles,
  ArrowLeft,
  Check,
  Plus
} from 'lucide-react';

const PeopleListing = ({ ainame = "Emma AI" }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState('all');
  const [addedConnections, setAddedConnections] = useState({});

  // Dummy user data
  const users = [
    {
      id: 1,
      name: 'Sarah Johnson',
      age: 26,
      gender: 'female',
      location: 'New York, NY',
      profession: 'Software Engineer',
      interests: ['Photography', 'Hiking', 'Reading'],
      avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      compatibility: 92,
      isOnline: true
    },
    {
      id: 2,
      name: 'Michael Chen',
      age: 29,
      gender: 'male',
      location: 'San Francisco, CA',
      profession: 'Product Manager',
      interests: ['Gaming', 'Cooking', 'Travel'],
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      compatibility: 78,
      isOnline: false
    },
    {
      id: 3,
      name: 'Emma Rodriguez',
      age: 24,
      gender: 'female',
      location: 'Austin, TX',
      profession: 'Graphic Designer',
      interests: ['Art', 'Music', 'Yoga'],
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      compatibility: 88,
      isOnline: true
    },
    {
      id: 4,
      name: 'David Kim',
      age: 31,
      gender: 'male',
      location: 'Seattle, WA',
      profession: 'Data Scientist',
      interests: ['Machine Learning', 'Basketball', 'Books'],
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      compatibility: 72,
      isOnline: true
    },
    {
      id: 5,
      name: 'Lisa Wang',
      age: 27,
      gender: 'female',
      location: 'Los Angeles, CA',
      profession: 'Marketing Manager',
      interests: ['Fashion', 'Fitness', 'Movies'],
      avatar: 'https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      compatibility: 85,
      isOnline: false
    },
    {
      id: 6,
      name: 'James Wilson',
      age: 28,
      gender: 'male',
      location: 'Chicago, IL',
      profession: 'Financial Analyst',
      interests: ['Finance', 'Running', 'Music'],
      avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      compatibility: 69,
      isOnline: true
    },
    {
      id: 7,
      name: 'Sophie Martinez',
      age: 25,
      gender: 'female',
      location: 'Miami, FL',
      profession: 'UX Designer',
      interests: ['Design', 'Beach', 'Dancing'],
      avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      compatibility: 94,
      isOnline: true
    },
    {
      id: 8,
      name: 'Ryan Thompson',
      age: 30,
      gender: 'male',
      location: 'Denver, CO',
      profession: 'Software Architect',
      interests: ['Skiing', 'Programming', 'Photography'],
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      compatibility: 76,
      isOnline: false
    }
  ];

  const handleAddConnection = (userId, type) => {
    setAddedConnections(prev => ({
      ...prev,
      [userId]: type
    }));
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.profession.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterGender === 'all' || user.gender === filterGender;
    
    return matchesSearch && matchesFilter;
  });

  const getConnectionStatus = (userId) => {
    return addedConnections[userId] || null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-400 to-red-500">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-rose-500 border-b border-rose-600">
        <div className="w-full px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <button className="p-2 mr-2 bg-white/20 rounded-xl text-white hover:bg-white/30 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Sparkles className="h-8 w-8 text-white mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-white">People like {ainame}</h1>
                <p className="text-white/80 text-sm">Discover connections recommended by your AI</p>
              </div>
            </div>
            <button className="p-2 bg-white/20 rounded-xl text-white hover:bg-white/30 transition-colors">
              <Filter className="h-5 w-5" />
            </button>
          </div>
          
          {/* Search and Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white rounded-xl shadow-sm border-0 focus:ring-2 focus:ring-white focus:outline-none text-gray-700 placeholder-gray-400"
              />
            </div>
            
            <div className="flex space-x-2">
              <button 
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                  filterGender === 'all' 
                    ? 'bg-white text-rose-600' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                onClick={() => setFilterGender('all')}
              >
                All
              </button>
              <button 
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                  filterGender === 'female' 
                    ? 'bg-white text-rose-600' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                onClick={() => setFilterGender('female')}
              >
                Women
              </button>
              <button 
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                  filterGender === 'male' 
                    ? 'bg-white text-rose-600' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                onClick={() => setFilterGender('male')}
              >
                Men
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* People Grid */}
      <div className="w-full px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUsers.map((user) => {
            const connectionStatus = getConnectionStatus(user.id);
            const isFemale = user.gender === 'female';
            
            return (
              <div 
                key={user.id} 
                className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:scale-105 ${
                  isFemale ? 'ring-2 ring-pink-300 shadow-pink-100' : ''
                }`}
              >
                {/* User Header */}
                <div className={`relative ${isFemale ? 'bg-gradient-to-r from-pink-400 to-rose-400' : 'bg-gradient-to-r from-gray-400 to-gray-500'} p-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="relative">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-16 w-16 rounded-full object-cover ring-2 ring-white shadow-md"
                        />
                        {user.isOnline && (
                          <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-bold text-white">{user.name}</h3>
                        <p className="text-white/80 text-sm">{user.age} years old</p>
                      </div>
                    </div>
                    {isFemale && (
                      <div className="bg-white/20 rounded-full p-2">
                        <Heart className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>
                  
                  {/* Compatibility Score */}
                  <div className="mt-3 flex items-center">
                    <Star className="h-4 w-4 text-yellow-300 mr-1" />
                    <span className="text-white font-medium text-sm">{user.compatibility}% Match</span>
                  </div>
                </div>
                
                {/* User Details */}
                <div className="p-4">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{user.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Briefcase className="h-4 w-4 mr-2" />
                      <span>{user.profession}</span>
                    </div>
                  </div>
                  
                  {/* Interests */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {user.interests.slice(0, 3).map((interest, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {connectionStatus ? (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center">
                          <Check className="h-4 w-4 text-green-600 mr-2" />
                          <span className="text-green-700 font-medium text-sm">
                            Added as {connectionStatus === 'friend' ? 'Friend' : 'Soulmate'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Friend Button - Available for all */}
                        <button 
                          onClick={() => handleAddConnection(user.id, 'friend')}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-xl transition-colors flex items-center justify-center"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Friend
                        </button>
                        
                        {/* Soulmate Button - Only for females */}
                        {isFemale && (
                          <button 
                            onClick={() => handleAddConnection(user.id, 'soulmate')}
                            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-medium py-2 px-4 rounded-xl transition-all flex items-center justify-center"
                          >
                            <Heart className="h-4 w-4 mr-2" />
                            Add Soulmate
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-white/50 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No people found</h3>
            <p className="text-white/80">
              {searchQuery ? 'Try adjusting your search terms' : 'No users match your current filters'}
            </p>
          </div>
        )}
      </div>
      
      {/* Summary Stats */}
      <div className="w-full px-4 pb-6">
        <div className="bg-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-center space-x-6 text-white/80">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{filteredUsers.length}</div>
              <div className="text-sm">People Found</div>
            </div>
            <div className="h-8 w-px bg-white/20"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {filteredUsers.filter(u => u.gender === 'female').length}
              </div>
              <div className="text-sm">Potential Soulmates</div>
            </div>
            <div className="h-8 w-px bg-white/20"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {Object.keys(addedConnections).length}
              </div>
              <div className="text-sm">Connections Made</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeopleListing;