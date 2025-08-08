// app/group-chats/page.jsx
"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Users,
  Bot,
  MessageCircle,
  Clock,
  Crown,
  Sparkles,
  Plus,
  User,
  Calendar,
  ChevronRight,
  Loader2
} from 'lucide-react';

const GroupChatsPage = () => {
  const router = useRouter();
  const [groupChats, setGroupChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_IMAGE_URL = 'https://wowfy.in/wowfy_app_codebase/photos/';

  useEffect(() => {
    const fetchGroupChats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch('/api/user/group-chats', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch group chats');
        }

        const data = await response.json();
        setGroupChats(data.groupChats || []);
        
      } catch (error) {
        console.error('Error fetching group chats:', error);
        setError('Failed to load group chats. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchGroupChats();
  }, [router]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleGroupChatClick = (groupChatId) => {
    router.push(`/group-chats/${groupChatId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-100 flex items-center justify-center p-4">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-rose-500 animate-spin mb-4" />
            <p className="text-gray-600">Loading group chats...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-100 flex items-center justify-center p-4">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 text-center">
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => router.back()}
                className="p-2 mr-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Group Chats</h1>
                  <p className="text-gray-600 text-sm">{groupChats.length} active conversation{groupChats.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => router.push('/chats')}
              className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {groupChats.length === 0 ? (
          // Empty state
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No group chats yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start conversations with AI companions to get friend suggestions and create group chats with like-minded people!
            </p>
            <button
              onClick={() => router.push('/chats')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md"
            >
              Chat with AI
            </button>
          </div>
        ) : (
          // Group chats list
          <div className="space-y-4">
            {groupChats.map((groupChat) => (
              <div
                key={groupChat.id}
                onClick={() => handleGroupChatClick(groupChat.id)}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-4 hover:shadow-xl transition-all duration-200 cursor-pointer hover:scale-[1.02]"
              >
                <div className="flex items-start justify-between">
                  {/* Left side - Chat info */}
                  <div className="flex items-start flex-1">
                    {/* Avatar group */}
                    <div className="flex-shrink-0 mr-4">
                      <div className="flex items-center">
                        {/* Show first friend */}
                        <div className="flex -space-x-2">
                          {groupChat.otherParticipants.slice(0, 1).map((participant, index) => (
                            <div key={participant.userId} className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
                              <img
                                src={participant.profileImageUrl ? 
                                  `${BASE_IMAGE_URL}${participant.profileImageUrl}` : 
                                  `https://ui-avatars.com/api/?name=${participant.username}&background=random&size=100`
                                }
                                alt={participant.username}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                          
                          {/* AI characters */}
                          {groupChat.aiCharacters.slice(0, 3).map((ai, index) => (
                            <div key={ai.id} className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-200 shadow-sm bg-gradient-to-br from-blue-100 to-indigo-100">
                              <img
                                src={ai.avatarUrl || `https://ui-avatars.com/api/?name=${ai.displayName}&background=random&size=100`}
                                alt={ai.displayName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                          
                          {/* Show count if more AI characters */}
                          {groupChat.aiCharacters.length > 3 && (
                            <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600">
                                +{groupChat.aiCharacters.length - 3}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Chat details */}
                    <div className="flex-1 min-w-0">
                      {/* Chat name and badges */}
                      <div className="flex items-center mb-1">
                        <h3 className="font-bold text-gray-800 truncate mr-2">
                          {groupChat.displayName}
                        </h3>
                        
                        {groupChat.isNew && (
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                            New
                          </span>
                        )}
                        
                        {groupChat.userRole === 'admin' && (
                          <Crown className="h-4 w-4 text-yellow-500 ml-1" />
                        )}
                      </div>

                      {/* Participants info - Show as friendship chat */}
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <User className="h-3 w-3 mr-1" />
                        <span>2 friends</span>
                        
                        <Bot className="h-3 w-3 ml-3 mr-1" />
                        <span>{groupChat.totalAiCharacters} AI companion{groupChat.totalAiCharacters !== 1 ? 's' : ''}</span>
                      </div>

                      {/* Last message */}
                      {groupChat.lastMessage && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">
                            {groupChat.lastMessage.senderName}:
                          </span>
                          <span className="ml-1">{groupChat.lastMessage.content}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right side - Time and arrow */}
                  <div className="flex flex-col items-end ml-4">
                    <div className="flex items-center text-xs text-gray-500 mb-2">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{formatTime(groupChat.lastMessageAt)}</span>
                    </div>
                    
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {/* AI specialties */}
                {groupChat.aiCharacters.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center">
                      <Sparkles className="h-3 w-3 text-purple-500 mr-2" />
                      <div className="flex flex-wrap gap-1">
                        {groupChat.aiCharacters.map((ai, index) => (
                          <span 
                            key={ai.id}
                            className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-medium"
                          >
                            {ai.specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupChatsPage;