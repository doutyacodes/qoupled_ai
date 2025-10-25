//  app/ai-chat/[ainame]/page.jsx
"use client"
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Send, 
  ArrowLeft,
  Bot,
  User,
  Users,
  Heart,
  X,
  Check,
  RotateCcw,
  MapPin,
  Calendar,
  Star,
  MessageCircle,
  Loader2,
  UserPlus,
  Sparkles,
  Crown,
  Zap,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { BASE_IMAGE_URL } from '@/utils/constants';

const EnhancedAIChat = () => {
  const params = useParams();
  const router = useRouter();
  const ainame = params.ainame;
  
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiCharacter, setAiCharacter] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sendingMessage, setSendingMessage] = useState(false);
  
  // Friend suggestion states
  const [loadingFriendSuggestion, setLoadingFriendSuggestion] = useState(false);
  const [respondingToSuggestion, setRespondingToSuggestion] = useState({});
  
  const messagesEndRef = useRef(null);

  // Initialize chat
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch(`/api/ai-chat/initialize/${ainame}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to initialize chat');
        }

        const data = await response.json();
        setAiCharacter(data.aiCharacter);
        setConversation(data.conversation);
        setMessages(data.messages || []);
        
      } catch (error) {
        console.error('Error initializing chat:', error);
        setError('Failed to load chat. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (ainame) {
      initializeChat();
    }
  }, [ainame, router]);

  // Send message function
  const handleSendMessage = async () => {
    if (!message.trim() || sendingMessage || !conversation) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      content: message.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setSendingMessage(true);
    setIsTyping(true);

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/ai-chat/send-message', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversationId: conversation.id,
          aiCharacterId: aiCharacter.id,
          message: userMessage.content
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        content: data.aiResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text'
      };

      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        content: "I'm sorry, I'm having trouble responding right now. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setSendingMessage(false);
      setIsTyping(false);
    }
  };

  // Get friend suggestion and add as inline message
  const getFriendSuggestion = async () => {
    try {
      setLoadingFriendSuggestion(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/ai-chat/get-friend-suggestion', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          aiCharacterId: aiCharacter.id
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Add suggestion as inline message
        const suggestionMessage = {
          id: Date.now(),
          sender: 'ai',
          content: `I found someone who could be a great friend for you! Let me introduce you to them:`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'suggestion',
          suggestionData: data.suggestion
        };
        
        setMessages(prev => [...prev, suggestionMessage]);
      } else {
        const noSuggestionMessage = {
          id: Date.now(),
          sender: 'ai',
          content: data.error || "I couldn't find any potential friends who share AI companions with you right now. Let's continue our conversation! 🤝",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text'
        };
        setMessages(prev => [...prev, noSuggestionMessage]);
      }
    } catch (error) {
      console.error('Error getting friend suggestion:', error);
      const errorMessage = {
        id: Date.now(),
        sender: 'ai',
        content: "I'm having trouble finding friend suggestions right now. Let's keep chatting! 🤝",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoadingFriendSuggestion(false);
    }
  };

  // Handle friend suggestion response
  const handleFriendSuggestionResponse = async (messageId, action, suggestionData) => {
    if (respondingToSuggestion[messageId]) return;

    try {
      setRespondingToSuggestion(prev => ({...prev, [messageId]: true}));
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/ai-chat/respond-suggestion', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: action,
          suggestionId: suggestionData.suggestionId,
          aiCharacterId: aiCharacter.id,
          suggestedUserId: suggestionData.user.id
        })
      });

      const data = await response.json();
      
              if (data.success) {
        // Update the message to show response and remove buttons
        setMessages(prev => prev.map(msg => {
          if (msg.id === messageId) {
            return {
              ...msg,
              suggestionData: {
                ...msg.suggestionData,
                responded: true,
                response: action,
                groupChatData: action === 'accept' ? data.groupChat : null
              }
            };
          }
          return msg;
        }));

        // Add follow-up message from AI
        let followUpContent = '';
        if (action === 'accept') {
          const groupChat = data.groupChat;
          followUpContent = `🎉 Fantastic! I've created a group chat with ${suggestionData.user.username}`;
          
          if (groupChat.totalAiCharacters > 1) {
            followUpContent += ` and invited ${groupChat.totalAiCharacters - 1} additional AI companion${groupChat.totalAiCharacters > 2 ? 's' : ''} that you both share!`;
          } else {
            followUpContent += `!`;
          }
          
          followUpContent += ` The group chat "${groupChat.name}" is now ready. You can start chatting right away! 💬✨`;
        } else if (action === 'skip') {
          followUpContent = "No worries! Let me find another potential friend for you.";
          // Auto-trigger another suggestion after a brief delay
          setTimeout(() => getFriendSuggestion(), 1000);
        } else {
          followUpContent = "No worries! Not every suggested connection feels right. Would you like me to suggest another potential friend or shall we continue our conversation?";
        }

        const followUpMessage = {
          id: Date.now(),
          sender: 'ai',
          content: followUpContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text',
          groupChatData: action === 'accept' ? data.groupChat : null
        };
        
        setMessages(prev => [...prev, followUpMessage]);
        
      } else {
        throw new Error(data.error);
      }
      
    } catch (error) {
      console.error('Error responding to friend suggestion:', error);
      const errorMessage = {
        id: Date.now(),
        sender: 'ai',
        content: "Sorry, there was an issue processing your response. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setRespondingToSuggestion(prev => ({...prev, [messageId]: false}));
    }
  };

  // Suggestion Card Component
  const SuggestionCard = ({ messageId, suggestionData, timestamp }) => {
    const suggestion = suggestionData;
    const hasResponded = suggestion.responded;
    const userResponse = suggestion.response;

    return (
      <div className="max-w-md bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-4 border-2 border-blue-200 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-bold text-blue-800 flex items-center">
            <UserPlus className="h-5 w-5 mr-2" />
            Perfect Friend Match!
          </h4>
          {hasResponded && (
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              userResponse === 'accept' ? 'bg-green-200 text-green-800' :
              userResponse === 'skip' ? 'bg-yellow-200 text-yellow-800' :
              'bg-gray-200 text-gray-800'
            }`}>
              {userResponse === 'accept' ? 'Accepted' :
               userResponse === 'skip' ? 'Skipped' : 'Declined'}
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex items-center mb-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white shadow-sm">
            <img
              src={suggestion.user.profileImageUrl ? 
                `${BASE_IMAGE_URL}${suggestion.user.profileImageUrl}` : 
                `https://ui-avatars.com/api/?name=${suggestion.user.username}&background=random&size=100`
              }
              alt={suggestion.user.username}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="ml-3 flex-1">
            <h5 className="font-bold text-gray-800">{suggestion.user.username}</h5>
            <div className="flex items-center text-gray-600 text-sm">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{suggestion.user.age} years old</span>
            </div>
            {suggestion.user.location && (
              <div className="flex items-center text-gray-600 text-sm">
                <MapPin className="h-3 w-3 mr-1" />
                <span>{suggestion.user.location}</span>
              </div>
            )}
          </div>
          
          <div className="text-right">
            <div className="flex items-center text-blue-600">
              <Star className="h-4 w-4 mr-1" />
              <span className="font-bold">{suggestion.compatibilityScore}%</span>
            </div>
            <span className="text-xs text-gray-600">Compatibility</span>
          </div>
        </div>

        {/* Common AI Friends */}
        {suggestion.commonAiFriends && suggestion.commonAiFriends.length > 0 && (
          <div className="bg-white/70 rounded-lg p-3 mb-3">
            <h6 className="font-semibold text-purple-800 text-sm mb-2 flex items-center">
              <Crown className="h-3 w-3 mr-1" />
              Shared AI Companions ({suggestion.commonAiFriends.length})
            </h6>
            <div className="flex flex-wrap gap-1">
              {suggestion.commonAiFriends.slice(0, 3).map((ai, index) => (
                <div key={index} className="flex items-center bg-purple-100 rounded-md px-2 py-1">
                  <div className="w-4 h-4 rounded-full overflow-hidden mr-1">
                    <img
                      src={ai.avatarUrl || `https://ui-avatars.com/api/?name=${ai.displayName}&background=random&size=50`}
                      alt={ai.displayName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-medium text-purple-800">{ai.displayName}</span>
                </div>
              ))}
              {suggestion.commonAiFriends.length > 3 && (
                <span className="text-xs text-purple-600 px-2 py-1">+{suggestion.commonAiFriends.length - 3} more</span>
              )}
            </div>
          </div>
        )}

        {/* Common Preferences */}
        {suggestion.commonPreferences && suggestion.commonPreferences.length > 0 && (
          <div className="bg-white/70 rounded-lg p-3 mb-3">
            <h6 className="font-semibold text-green-800 text-sm mb-2 flex items-center">
              <Heart className="h-3 w-3 mr-1" />
              Common Interests ({suggestion.commonPreferences.length})
            </h6>
            <div className="flex flex-wrap gap-1">
              {suggestion.commonPreferences.slice(0, 4).map((pref, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs font-medium"
                >
                  {pref.optionDisplayValue}
                </span>
              ))}
              {suggestion.commonPreferences.length > 4 && (
                <span className="text-xs text-green-600 px-2 py-1">+{suggestion.commonPreferences.length - 4} more</span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons or Response Status */}
        {!hasResponded ? (
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => handleFriendSuggestionResponse(messageId, 'accept', suggestion)}
              disabled={respondingToSuggestion[messageId]}
              className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg font-medium transition-colors text-sm"
            >
              <Check className="h-4 w-4 mr-1" />
              Start Group Chat!
            </button>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleFriendSuggestionResponse(messageId, 'reject', suggestion)}
                disabled={respondingToSuggestion[messageId]}
                className="flex items-center justify-center bg-gray-500 hover:bg-gray-600 text-white py-2 px-3 rounded-lg font-medium transition-colors text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Pass
              </button>
              
              <button
                onClick={() => handleFriendSuggestionResponse(messageId, 'skip', suggestion)}
                disabled={respondingToSuggestion[messageId]}
                className="flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-3 rounded-lg font-medium transition-colors text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Another
              </button>
            </div>

            {respondingToSuggestion[messageId] && (
              <div className="flex items-center justify-center mt-2 text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-xs">Processing...</span>
              </div>
            )}
          </div>
        ) : (
          <div className={`flex items-center justify-center py-2 px-3 rounded-lg ${
            userResponse === 'accept' ? 'bg-green-100 text-green-800' :
            userResponse === 'skip' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {userResponse === 'accept' ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                <span className="font-medium text-sm">Group chat invitation sent!</span>
              </>
            ) : userResponse === 'skip' ? (
              <>
                <RotateCcw className="h-4 w-4 mr-2" />
                <span className="font-medium text-sm">Suggestion skipped</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                <span className="font-medium text-sm">Suggestion declined</span>
              </>
            )}
          </div>
        )}

        {/* Timestamp */}
        <div className="text-xs text-gray-400 mt-2 text-center">
          {timestamp}
        </div>
      </div>
    );
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-100 flex items-center justify-center p-4">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-rose-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading chat...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !aiCharacter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-100 flex items-center justify-center p-4">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 text-center">
          <p className="text-gray-600 mb-4">{error || 'AI character not found'}</p>
          <button 
            onClick={() => router.back()}
            className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-100 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
        <div className="container mx-auto px-4 py-3 max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => router.back()}
                className="p-2 mr-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                    <img
                      src={aiCharacter.avatarUrl || `https://ui-avatars.com/api/?name=${aiCharacter.displayName}&background=random&size=100`}
                      alt={aiCharacter.displayName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                
                <div className="ml-3">
                  <h1 className="text-base md:text-lg font-bold text-gray-800">
                    {aiCharacter.displayName}
                  </h1>
                  <div className="flex items-center text-gray-600 text-xs md:text-sm">
                    <Bot className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    <span>{aiCharacter.specialty} • Online</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Find Friends Button */}
            <button
              onClick={getFriendSuggestion}
              disabled={loadingFriendSuggestion}
              className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg font-medium transition-colors shadow-sm text-sm md:text-base"
            >
              {loadingFriendSuggestion ? (
                <Loader2 className="h-4 w-4 mr-1 md:mr-2 animate-spin" />
              ) : (
                <Users className="h-4 w-4 mr-1 md:mr-2" />
              )}
              Find Friends
            </button>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col container mx-auto px-4 py-4 max-w-4xl">
        <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden flex flex-col">
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[85%] md:max-w-[70%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 ${msg.sender === 'user' ? 'ml-2 md:ml-3' : 'mr-2 md:mr-3'}`}>
                    {msg.sender === 'user' ? (
                      <div className="h-8 w-8 md:h-10 md:w-10 bg-rose-500 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 md:h-5 md:w-5 text-white" />
                      </div>
                    ) : (
                      <div className="h-8 w-8 md:h-10 md:w-10 rounded-full overflow-hidden border border-gray-200">
                        <img
                          src={aiCharacter.avatarUrl || `https://ui-avatars.com/api/?name=${aiCharacter.displayName}&background=random&size=100`}
                          alt={aiCharacter.displayName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Message Content */}
                  <div className={`${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.type === 'suggestion' ? (
                      // Render suggestion card
                      <SuggestionCard 
                        messageId={msg.id}
                        suggestionData={msg.suggestionData}
                        timestamp={msg.timestamp}
                      />
                    ) : (
                      // Regular message
                      <>
                        <div
                          className={`inline-block px-3 py-2 md:px-4 md:py-3 rounded-2xl ${
                            msg.sender === 'user'
                              ? 'bg-rose-500 text-white'
                              : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}
                        >
                          <p className="text-sm md:text-base leading-relaxed whitespace-pre-line">{msg.content}</p>
                        </div>
                        
                        {/* Show group chat button if this message contains group chat data */}
                        {msg.groupChatData && (
                          <div className="mt-2">
                            <button
                              onClick={() => router.push(`/group-chats/${msg.groupChatData.id}`)}
                              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md flex items-center text-sm"
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Go to Group Chat
                            </button>
                          </div>
                        )}
                        
                        <div className="text-xs text-gray-400 mt-1">
                          {msg.timestamp}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center">
                  <div className="h-8 w-8 md:h-10 md:w-10 rounded-full overflow-hidden border border-gray-200 mr-2 md:mr-3">
                    <img
                      src={aiCharacter.avatarUrl || `https://ui-avatars.com/api/?name=${aiCharacter.displayName}&background=random&size=100`}
                      alt={aiCharacter.displayName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="bg-gray-100 rounded-2xl px-3 py-2 md:px-4 md:py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 p-3 md:p-4">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder={`Message ${aiCharacter.displayName}...`}
                  className="w-full px-3 py-2 md:px-4 md:py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 focus:outline-none text-gray-700 placeholder-gray-400 text-sm md:text-base"
                  disabled={sendingMessage}
                />
              </div>
              
              <button 
                onClick={handleSendMessage}
                disabled={!message.trim() || sendingMessage}
                className={`p-2 md:p-3 rounded-xl transition-all duration-200 ${
                  message.trim() && !sendingMessage
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-md'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {sendingMessage ? (
                  <div className="w-4 h-4 md:w-5 md:h-5 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <Send className="h-4 w-4 md:h-5 md:w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAIChat;