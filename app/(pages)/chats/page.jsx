"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MessageCircle, 
  Search, 
  Bot,
  User,
  Users,
  ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const TelegramLikeChatListing = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ai'); // 'ai' or 'users'
  const [aiCharacters, setAiCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch AI characters from API
  useEffect(() => {
    const fetchAICharacters = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Please log in to view AI characters');
          return;
        }

        const response = await fetch('/api/ai-characters', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (data.success) {
          // Transform data for chat-like display
          const chatList = data.characters.map(character => ({
            id: character.id,
            name: character.displayName || character.name,
            avatar: character.avatarUrl || `https://ui-avatars.com/api/?name=${character.displayName}&background=random&size=100`,
            lastMessage: character.greetingMessage || `Hi! I'm your ${character.specialty} assistant.`,
            time: 'Active now',
            isOnline: character.isOnline || true,
            type: 'ai',
            route: `/chats/ai-chat/${character.name}`
          }));
          setAiCharacters(chatList);
        } else {
          setError(data.message || 'Failed to fetch AI characters');
        }
      } catch (err) {
        console.error('Error fetching AI characters:', err);
        setError('Failed to load AI characters. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'ai') {
      fetchAICharacters();
    }
  }, [activeTab]);

  const filteredChats = aiCharacters.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-100 flex items-center justify-center p-4">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-rose-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading chats...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-100">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 mb-4">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <button 
                  onClick={() => router.back()}
                  className="p-2 mr-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <MessageCircle className="h-6 w-6 text-rose-500 mr-3" />
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">Chats</h1>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white rounded-xl shadow-sm border border-gray-200 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 focus:outline-none text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('ai')}
                className={`flex-1 flex items-center justify-center py-2 px-4 rounded-lg font-medium transition-all text-sm ${
                  activeTab === 'ai'
                    ? 'bg-white text-rose-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Bot className="h-4 w-4 mr-2" />
                AI Assistants
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`flex-1 flex items-center justify-center py-2 px-4 rounded-lg font-medium transition-all text-sm ${
                  activeTab === 'users'
                    ? 'bg-white text-rose-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Users className="h-4 w-4 mr-2" />
                People
              </button>
            </div>
          </div>
        </div>

        {/* Chat List */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
          {activeTab === 'ai' && (
            <>
              {error ? (
                <div className="p-8 text-center">
                  <Bot className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : filteredChats.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {filteredChats.map((chat) => (
                    <Link key={chat.id} href={chat.route}>
                      <div className="p-4 hover:bg-gray-50 transition-colors active:bg-gray-100">
                        <div className="flex items-center space-x-3">
                          {/* Avatar */}
                          <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200">
                              <img
                                src={chat.avatar}
                                alt={chat.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            {/* Online indicator for AI */}
                            {chat.isOnline && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full">
                                <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
                              </div>
                            )}
                          </div>

                          {/* Chat Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="text-base font-semibold text-gray-900 truncate">
                                {chat.name}
                              </h3>
                              <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                {chat.time}
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-600 truncate">
                              {chat.lastMessage}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Bot className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No AI assistants found</h3>
                  <p className="text-gray-600">
                    {searchQuery ? 'Try adjusting your search terms' : 'No AI assistants are available'}
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === 'users' && (
            <div className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">People Chats</h3>
              <p className="text-gray-600">
                Your conversations with other users will appear here
              </p>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-800 text-sm">
                  💡 Connect with people from your matches to start chatting!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TelegramLikeChatListing;