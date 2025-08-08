"use client"

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Smile, 
  Paperclip, 
  MoreVertical, 
  Heart,
  Sparkles,
  Users,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  X,
  Lightbulb
} from 'lucide-react';

const AIChat = () => {
  const [message, setMessage] = useState('');
  const [selectedAI, setSelectedAI] = useState(null);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [showAIList, setShowAIList] = useState(false);
  const messagesEndRef = useRef(null);

  // AI Characters
  const aiCharacters = [
    {
      id: 'emma-ai',
      name: 'Emma AI',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop',
      color: 'bg-purple-500',
      specialty: 'Relationship Coach',
      isOnline: true
    },
    {
      id: 'alex-ai',
      name: 'Alex AI',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop',
      color: 'bg-blue-500',
      specialty: 'Life Advisor',
      isOnline: true
    },
    {
      id: 'sophia-ai',
      name: 'Sophia AI',
      avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop',
      color: 'bg-green-500',
      specialty: 'Wellness Expert',
      isOnline: true
    },
    {
      id: 'max-ai',
      name: 'Max AI',
      avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop',
      color: 'bg-orange-500',
      specialty: 'Career Guide',
      isOnline: true
    },
    {
      id: 'luna-ai',
      name: 'Luna AI',
      avatar: 'https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop',
      color: 'bg-pink-500',
      specialty: 'Creative Companion',
      isOnline: true
    }
  ];

  // Dummy chat messages
  const [messages] = useState([
    {
      id: 1,
      sender: 'emma-ai',
      content: "Hello! I'm Emma, your relationship coach. I'm here to help you build meaningful connections. What brings you here today?",
      timestamp: '10:30 AM',
      type: 'ai'
    },
    {
      id: 2,
      sender: 'user',
      content: "Hi Emma! I'm looking for advice on how to improve my communication in relationships.",
      timestamp: '10:32 AM',
      type: 'user'
    },
    {
      id: 3,
      sender: 'alex-ai',
      content: "Great question! Communication is the foundation of any strong relationship. I'd recommend starting with active listening techniques.",
      timestamp: '10:33 AM',
      type: 'ai'
    },
    {
      id: 4,
      sender: 'sophia-ai',
      content: "I completely agree with Alex! Also, don't forget about the importance of emotional wellness in communication. Taking care of your mental health helps you communicate more clearly. 🌱",
      timestamp: '10:35 AM',
      type: 'ai'
    },
    {
      id: 5,
      sender: 'user',
      content: "That's really helpful! How can I practice active listening?",
      timestamp: '10:36 AM',
      type: 'user'
    },
    {
      id: 6,
      sender: 'max-ai',
      content: "From a career perspective, active listening has helped me tremendously in professional relationships too. Try summarizing what the other person said before responding.",
      timestamp: '10:38 AM',
      type: 'ai'
    },
    {
      id: 7,
      sender: 'luna-ai',
      content: "What a beautiful conversation! 🎨 I love how we're all bringing different perspectives. Here's a creative exercise: try mirroring your partner's energy and tone - it creates natural harmony!",
      timestamp: '10:40 AM',
      type: 'ai'
    },
    {
      id: 8,
      sender: 'emma-ai',
      content: "Luna makes an excellent point! Mirroring is a powerful technique. Also, remember to ask open-ended questions to encourage deeper sharing.",
      timestamp: '10:42 AM',
      type: 'ai'
    },
    {
      id: 9,
      sender: 'user',
      content: "This is amazing advice from all of you! I feel like I have a whole support team. 😊",
      timestamp: '10:45 AM',
      type: 'user'
    },
    {
      id: 10,
      sender: 'sophia-ai',
      content: "That's exactly what we are - your support team! Remember, building better communication is a journey, not a destination. Be patient with yourself. 💫",
      timestamp: '10:46 AM',
      type: 'ai'
    }
  ]);

  const handleAIClick = (ai) => {
    setSelectedAI(ai);
    setShowSuggestion(true);
  };

  const closeSuggestion = () => {
    setShowSuggestion(false);
    setSelectedAI(null);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      // Here you would typically add the message to the messages array
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  const getAIInfo = (senderId) => {
    return aiCharacters.find(ai => ai.id === senderId);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-400 to-red-500">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-rose-500 border-b border-rose-600">
        <div className="w-full px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Sparkles className="h-8 w-8 text-white mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-white">AI Support Team</h1>
                <p className="text-white/80 text-sm">5 AI experts ready to help you</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Mobile Toggle Button */}
              <button 
                className="md:hidden p-2 bg-white/20 rounded-xl text-white hover:bg-white/30 transition-colors"
                onClick={() => setShowAIList(!showAIList)}
              >
                {showAIList ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
              <button className="p-2 bg-white/20 rounded-xl text-white hover:bg-white/30 transition-colors">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* AI Characters Row */}
          <div className={`${showAIList ? 'block' : 'hidden'} md:block`}>
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              {aiCharacters.map((ai) => (
                <button
                  key={ai.id}
                  onClick={() => handleAIClick(ai)}
                  className="flex items-center bg-white/20 rounded-xl px-4 py-2 hover:bg-white/30 transition-all duration-200 group"
                >
                  <div className="relative">
                    <img
                      src={ai.avatar}
                      alt={ai.name}
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-white/50"
                    />
                    {ai.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-400 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="ml-2 text-left">
                    <div className="text-white font-medium text-sm">{ai.name}</div>
                    <div className="text-white/70 text-xs">{ai.specialty}</div>
                  </div>
                  <Lightbulb className="h-4 w-4 text-white/70 ml-2 group-hover:text-yellow-300 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Suggestion Modal */}
      {showSuggestion && selectedAI && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeSuggestion}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <img
                  src={selectedAI.avatar}
                  alt={selectedAI.name}
                  className="h-12 w-12 rounded-full object-cover mr-3"
                />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedAI.name}</h3>
                  <p className="text-gray-600 text-sm">{selectedAI.specialty}</p>
                </div>
              </div>
              <button onClick={closeSuggestion} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="bg-gradient-to-r from-rose-50 to-red-50 rounded-xl p-4 mb-4">
              <div className="flex items-center mb-2">
                <Users className="h-5 w-5 text-rose-600 mr-2" />
                <span className="font-semibold text-rose-800">AI Suggestion</span>
              </div>
              <p className="text-rose-700 font-medium text-lg">
                "Find friends like me."
              </p>
              <p className="text-rose-600 text-sm mt-2">
                Discover people who share similar interests and values as {selectedAI.name}
              </p>
            </div>
            
            <button 
              onClick={closeSuggestion}
              className="w-full bg-gradient-to-r from-rose-500 to-red-600 text-white font-medium py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-200"
            >
              Explore Connections
            </button>
          </div>
        </div>
      )}

      {/* Chat Container */}
      <div className="w-full px-4 py-6">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden h-[calc(100vh-200px)] flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => {
              const aiInfo = msg.type === 'ai' ? getAIInfo(msg.sender) : null;
              
              return (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-xl ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className={`flex-shrink-0 ${msg.type === 'user' ? 'ml-3' : 'mr-3'}`}>
                      {msg.type === 'user' ? (
                        <div className="h-8 w-8 bg-gradient-to-r from-rose-500 to-red-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">You</span>
                        </div>
                      ) : (
                        <img
                          src={aiInfo?.avatar}
                          alt={aiInfo?.name}
                          className="h-8 w-8 rounded-full object-cover ring-2 ring-gray-100"
                        />
                      )}
                    </div>
                    
                    {/* Message Content */}
                    <div className={`${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                      {msg.type === 'ai' && (
                        <div className="text-xs text-gray-500 mb-1 font-medium">
                          {aiInfo?.name}
                        </div>
                      )}
                      <div
                        className={`inline-block px-4 py-2 rounded-2xl ${
                          msg.type === 'user'
                            ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-rose-500 transition-colors">
                <Paperclip className="h-5 w-5" />
              </button>
              
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-rose-500 focus:outline-none text-gray-700 placeholder-gray-400"
                />
              </div>
              
              <button className="p-2 text-gray-400 hover:text-rose-500 transition-colors">
                <Smile className="h-5 w-5" />
              </button>
              
              <button 
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  message.trim()
                    ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white hover:shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;