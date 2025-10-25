// app/group-chats/[id]/page.jsx
"use client"
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Send, 
  ArrowLeft,
  Bot,
  User,
  Users,
  Info,
  MoreVertical,
  Loader2,
  Crown,
  Calendar,
  MessageCircle,
  Sparkles,
  Zap,
  Clock
} from 'lucide-react';
import { BASE_IMAGE_URL } from '@/utils/constants';

const GroupChatPage = () => {
  const params = useParams();
  const router = useRouter();
  const groupChatId = params.id;
  
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groupChat, setGroupChat] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [aiCharacters, setAiCharacters] = useState([]);
  const [messages, setMessages] = useState([]);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  
  const messagesEndRef = useRef(null);
  
  // Load group chat data
  useEffect(() => {
    const loadGroupChat = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch(`/api/group-chats/${groupChatId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('You do not have access to this group chat.');
          }
          throw new Error('Failed to load group chat');
        }

        const data = await response.json();
        setGroupChat(data.groupChat);
        setParticipants(data.participants || []);
        setAiCharacters(data.aiCharacters || []);
        setMessages(data.messages || []);
        
      } catch (error) {
        console.error('Error loading group chat:', error);
        setError(error.message || 'Failed to load group chat. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (groupChatId) {
      loadGroupChat();
    }
  }, [groupChatId, router]);

  // Send message function
  const handleSendMessage = async () => {
    if (!message.trim() || sendingMessage || !groupChat) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      senderName: 'You',
      content: message.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      isCurrentUser: true
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setSendingMessage(true);
    setIsTyping(true);

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/group-chats/${groupChatId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
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
        senderName: data.respondingAi?.displayName || 'AI Assistant',
        content: data.aiResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
        isCurrentUser: false,
        aiInfo: data.respondingAi
      };

      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        senderName: 'System',
        content: "Sorry, there was an issue sending your message. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
        isCurrentUser: false
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setSendingMessage(false);
      setIsTyping(false);
    }
  };

  const formatJoinDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-100 flex items-center justify-center p-4">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-rose-500 animate-spin mb-4" />
            <p className="text-gray-600">Loading group chat...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !groupChat) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-100 flex items-center justify-center p-4">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 text-center">
          <p className="text-gray-600 mb-4">{error || 'Group chat not found'}</p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => router.back()}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Go Back
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-100 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
        <div className="container mx-auto px-4 py-3 max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => router.back()}
                className="p-2 mr-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              
              <div className="flex items-center">
                {/* Avatar stack - Show friend + AIs */}
                <div className="flex -space-x-2 mr-3">
                  {/* Show the friend (should be exactly 1) */}
                  {participants.slice(0, 1).map((participant) => (
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
                  
                  {/* Show AI characters */}
                  {aiCharacters.slice(0, 3).map((ai) => (
                    <div key={ai.id} className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-200 shadow-sm bg-gradient-to-br from-blue-100 to-indigo-100">
                      <img
                        src={ai.avatarUrl || `https://ui-avatars.com/api/?name=${ai.displayName}&background=random&size=100`}
                        alt={ai.displayName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  
                  {/* Show count if more than 4 total (1 friend + 3+ AIs) */}
                  {aiCharacters.length > 3 && (
                    <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        +{aiCharacters.length - 3}
                      </span>
                    </div>
                  )}
                </div>
                
                <div>
                  <h1 className="text-lg font-bold text-gray-800">
                    {groupChat.chatName || 
                     `${participants.map(p => p.username).join(', ')} & ${aiCharacters.map(ai => ai.displayName).join(', ')}`
                    }
                  </h1>
                  <div className="flex items-center text-gray-600 text-sm">
                    <Users className="h-3 w-3 mr-1" />
                    <span>2 friends</span>
                    <Bot className="h-3 w-3 ml-3 mr-1" />
                    <span>{aiCharacters.length} AI companion{aiCharacters.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <Info className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Participants Panel */}
      {showParticipants && (
        <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
          <div className="container mx-auto px-4 py-4 max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Human Participants - Should only be 2 people total */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Friends (2)
                </h3>
                <div className="space-y-2">
                  {/* The other friend */}
                  {participants.length > 0 ? (
                    participants.slice(0, 1).map((participant) => (
                      <div key={participant.userId} className="flex items-center bg-white rounded-lg p-3 shadow-sm">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 mr-3">
                          <img
                            src={participant.profileImageUrl ? 
                              `${BASE_IMAGE_URL}${participant.profileImageUrl}` : 
                              `https://ui-avatars.com/api/?name=${participant.username}&background=random&size=100`
                            }
                            alt={participant.username}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-800">{participant.username}</span>
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Friend</span>
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>Connected {formatJoinDate(participant.joinedAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-sm">No other participants found</div>
                  )}
                  
                  {/* Current user */}
                  <div className="flex items-center bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center mr-3">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-800">You</span>
                        <Crown className="h-3 w-3 text-yellow-500 ml-1" />
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Admin</span>
                      </div>
                      <span className="text-xs text-gray-500">Group creator</span>
                    </div>
                  </div>
                </div>

                {participants.length > 1 && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800">
                      ⚠️ This group chat has {participants.length + 1} human participants. Friend group chats should only have 2 people.
                    </p>
                  </div>
                )}
              </div>

              {/* AI Characters */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                  <Bot className="h-4 w-4 mr-2" />
                  AI Companions ({aiCharacters.length})
                </h3>
                <div className="space-y-2">
                  {aiCharacters.map((ai) => (
                    <div key={ai.id} className="flex items-center bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-3 border border-purple-200">
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-purple-300 mr-3">
                        <img
                          src={ai.avatarUrl || `https://ui-avatars.com/api/?name=${ai.displayName}&background=random&size=100`}
                          alt={ai.displayName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-800">{ai.displayName}</span>
                          <Sparkles className="h-3 w-3 text-purple-500 ml-1" />
                        </div>
                        <span className="text-xs text-purple-700">{ai.specialty}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Container */}
      <div className="flex-1 flex flex-col container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden flex flex-col">
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Welcome to your group chat!</h3>
                <p className="text-gray-600">Start the conversation by sending a message below.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[85%] md:max-w-[70%] ${msg.isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className={`flex-shrink-0 ${msg.isCurrentUser ? 'ml-2 md:ml-3' : 'mr-2 md:mr-3'}`}>
                      {msg.isCurrentUser ? (
                        <div className="h-8 w-8 md:h-10 md:w-10 bg-rose-500 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 md:h-5 md:w-5 text-white" />
                        </div>
                      ) : msg.sender === 'ai' ? (
                        <div className="h-8 w-8 md:h-10 md:w-10 rounded-full overflow-hidden border border-purple-200 bg-gradient-to-br from-purple-100 to-indigo-100">
                          {msg.aiInfo?.id ? (
                            <img
                              src={aiCharacters.find(ai => ai.id === msg.aiInfo.id)?.avatarUrl || 
                                   `https://ui-avatars.com/api/?name=${msg.senderName}&background=random&size=100`}
                              alt={msg.senderName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Bot className="h-4 w-4 md:h-5 md:w-5 text-purple-600 m-2" />
                          )}
                        </div>
                      ) : (
                        <div className="h-8 w-8 md:h-10 md:w-10 rounded-full overflow-hidden border border-gray-200">
                          {participants.find(p => p.username === msg.senderName)?.profileImageUrl ? (
                            <img
                              src={`${BASE_IMAGE_URL}${participants.find(p => p.username === msg.senderName)?.profileImageUrl}`}
                              alt={msg.senderName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                              <User className="h-4 w-4 text-gray-600" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Message Content */}
                    <div className={`${msg.isCurrentUser ? 'text-right' : 'text-left'}`}>
                      {!msg.isCurrentUser && (
                        <div className="text-xs text-gray-500 mb-1 font-medium flex items-center">
                          <span>{msg.senderName}</span>
                          {msg.sender === 'ai' && (
                            <Zap className="h-3 w-3 ml-1 text-purple-400" />
                          )}
                        </div>
                      )}
                      <div
                        className={`inline-block px-3 py-2 md:px-4 md:py-3 rounded-2xl ${
                          msg.isCurrentUser
                            ? 'bg-rose-500 text-white'
                            : msg.sender === 'ai'
                            ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-gray-800 border border-purple-200'
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}
                      >
                        <p className="text-sm md:text-base leading-relaxed whitespace-pre-line">{msg.content}</p>
                      </div>
                      <div className="text-xs text-gray-400 mt-1 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{msg.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center">
                  <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 border border-purple-200 mr-2 md:mr-3 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-200 rounded-2xl px-3 py-2 md:px-4 md:py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
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
                  placeholder="Type your message..."
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
                  <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
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

export default GroupChatPage;