"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MessageSquare,
  Send,
  Smile,
  Info,
  X,
  ArrowLeft,
  Check,
  Heart,
  Users,
  Plus,
  UserPlus,
} from "lucide-react";
import ModernNavbar from "@/app/_components/Navbar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  searchInvitedUsers,
  createConversation,
} from "@/app/_services/chatService";
import ConnectedUsersList from "@/app/_components/ConnectedUsersList"; // Import the new component
import { socketService } from "@/app/_services/socketService";

const BASE_IMAGE_URL = "https://wowfy.in/wowfy_app_codebase/photos/";

const MyRoomsPage = () => {
  const [activeTab, setActiveTab] = useState("recent");
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const [showMobileConversations, setShowMobileConversations] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const queryClient = useQueryClient();
  const router = useRouter();

  // Common emojis
  const commonEmojis = [
    // Smileys & Emotion
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "🙃",
    "😉",
    "😌",
    "😍",
    "🥰",
    "😘",
    "😗",
    "😙",
    "😚",
    "😋",
    "😛",
    "😜",
    "🤪",
    "😝",
    "🤑",
    "🤗",
    "🤭",
    "🤫",
    "🤔",
    "🤐",
    "🤨",
    "😐",
    "😑",
    "😶",
    "😶‍🌫️",
    "😏",
    "😒",
    "🙄",
    "😬",
    "😮‍💨",
    "🤥",
    "😌",
    "😔",
    "😪",
    "🤤",
    "😴",
    "😷",
    "🤒",
    "🤕",
    "🤢",
    "🤮",
    "🤧",
    "🥵",
    "🥶",
    "😵",
    "😵‍💫",
    "🤯",
    "🤠",
    "🥳",
    "😎",
    "🤓",
    "🧐",
    "😕",
    "😟",
    "🙁",
    "☹️",
    "😮",
    "😯",
    "😲",
    "😳",
    "🥺",
    "😦",
    "😧",
    "😨",
    "😰",
    "😥",
    "😢",
    "😭",
    "😱",
    "😖",
    "😣",
    "😞",
    "😓",
    "😩",
    "😫",
    "🥱",
    "😤",
    "😡",
    "😠",
    "🤬",
    "😈",
    "👿",
    "💀",
    "☠️",
    "💩",
    "🤡",
    "👹",
    "👺",
    "👻",
    "👽",
    "👾",
    "🤖",
    "🎃",

    // People & Body
    "👋",
    "🤚",
    "🖐️",
    "✋",
    "🖖",
    "👌",
    "🤌",
    "🤏",
    "✌️",
    "🤞",
    "🤟",
    "🤘",
    "🤙",
    "👈",
    "👉",
    "👆",
    "🖕",
    "👇",
    "☝️",
    "👍",
    "👎",
    "✊",
    "👊",
    "🤛",
    "🤜",
    "👏",
    "🙌",
    "👐",
    "🤲",
    "🤝",
    "🙏",
    "✍️",
    "💅",
    "🤳",
    "💪",
    "🦾",
    "🦿",
    "🦵",
    "🦶",

    // Heart & Love
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "🤎",
    "💔",
    "❣️",
    "💕",
    "💞",
    "💓",
    "💗",
    "💖",
    "💘",
    "💝",
    "💟",

    // Animals & Nature
    "🐶",
    "🐱",
    "🐭",
    "🐹",
    "🐰",
    "🦊",
    "🐻",
    "🐼",
    "🐻‍❄️",
    "🐨",
    "🐯",
    "🦁",
    "🐮",
    "🐷",
    "🐽",
    "🐸",
    "🐵",
    "🙈",
    "🙉",
    "🙊",

    // Food & Drink
    "🍎",
    "🍊",
    "🍋",
    "🍌",
    "🍉",
    "🍇",
    "🍓",
    "🫐",
    "🍒",
    "🍑",
    "🥭",
    "🍍",
    "🥥",
    "🥝",
    "🍅",
    "🥑",
    "🍆",
    "🥔",
    "🥕",
    "🌽",
    "🌶️",
    "🫑",
    "🥒",
    "🥬",
    "🥦",
    "🧄",
    "🧅",
    "🍄",
    "🥜",
    "🌰",

    // Travel & Places
    "🚗",
    "🚕",
    "🚌",
    "🚙",
    "🚓",
    "🚑",
    "🚒",
    "🚐",
    "🛻",
    "🚚",
    "🏍️",
    "🚲",
    "✈️",
    "🛫",
    "🛬",
    "🚀",
    "🛸",
    "⛵",
    "🚤",
    "🛥️",
    "🗽",
    "🗼",
    "🏰",
    "🏯",
    "🌋",
    "🗻",
    "🏔️",
    "🏞️",

    // Objects
    "📱",
    "💻",
    "🖥️",
    "🖨️",
    "⌨️",
    "🖱️",
    "💽",
    "💾",
    "💿",
    "📷",
    "📸",
    "📹",
    "🎥",
    "📞",
    "☎️",
    "📟",
    "📠",
    "🔋",
    "🔌",
    "💡",

    // Symbols
    "✅",
    "❌",
    "⚠️",
    "‼️",
    "⁉️",
    "❓",
    "❔",
    "❕",
    "❗",
    "💯",
    "💢",
    "💥",
    "💫",
    "🌀",
    "🔔",
    "🔕",
    "🎵",
    "🎶",
    "💤",
    "🔥",

    // Celebrations
    "🎉",
    "🎊",
    "🎈",
    "🎂",
    "🎁",
    "🪅",
    "🎇",
    "🎆",
    "✨",
    "🌟",
  ];

  // Fetch conversations
  const { data: conversationsData, isLoading: isLoadingConversations } =
    useQuery({
      queryKey: ["conversations"],
      queryFn: fetchConversations,
      refetchInterval: 10000, // Refetch every 10 seconds for backup
    });

  // Fetch messages for selected conversation
  const { data: messagesData, isLoading: isLoadingMessages } = useQuery({
    queryKey: ["messages", selectedChat],
    queryFn: () => fetchMessages(selectedChat),
    enabled: !!selectedChat,
    refetchInterval: selectedChat ? 5000 : false, // Refetch every 5 seconds when a chat is selected
  });

  // Scroll to bottom of messages when they change
  useEffect(() => {
    if (messagesEndRef.current && messagesData?.messages) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messagesData]);

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token available:", !!token);

    if (token) {
      try {
        const socket = socketService.initialize(token);

        // Set up socket event listeners
        socket.on("connect", () => {
          console.log("Socket connected successfully!");
          setSocketConnected(true);
        });

        socket.on("new_message", (newMessage) => {
          console.log("New message received:", newMessage);

          // If the message is for the current conversation, update the messages
          if (newMessage.conversation_id === selectedChat) {
            queryClient.setQueryData(["messages", selectedChat], (old) => {
              if (!old || !old.messages) return { messages: [newMessage] };

              // Check if message already exists to avoid duplicates
              const messageExists = old.messages.some(
                (msg) => msg.id === newMessage.id
              );
              if (messageExists) return old;

              return { messages: [...old.messages, newMessage] };
            });
          }

          // Update the conversations list with the new message
          queryClient.setQueryData(["conversations"], (old) => {
            if (!old || !old.conversations) return old;

            return {
              conversations: old.conversations.map((conv) => {
                if (conv.conversation.id === newMessage.conversation_id) {
                  return {
                    ...conv,
                    lastMessage: {
                      id: newMessage.id,
                      content: newMessage.content,
                      createdAt: newMessage.created_at,
                      senderId: newMessage.sender.id,
                    },
                  };
                }
                return conv;
              }),
            };
          });

          // Invalidate queries to ensure fresh data
          queryClient.invalidateQueries(["conversations"]);
          if (selectedChat === newMessage.conversation_id) {
            queryClient.invalidateQueries(["messages", selectedChat]);
          }
        });

        // Set up cleanup
        return () => {
          socketService.disconnect();
          setSocketConnected(false);
        };
      } catch (error) {
        console.error("Error initializing socket:", error);
      }
    }
  }, [queryClient, selectedChat]);

  // Join conversation room when a chat is selected
  useEffect(() => {
    if (selectedChat && socketConnected) {
      console.log("Joining conversation room:", selectedChat);
      socketService.join(selectedChat);

      return () => {
        console.log("Leaving conversation room:", selectedChat);
        socketService.leave(selectedChat);
      };
    }
  }, [selectedChat, socketConnected]);

  // Detect mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search for invited users
  const { data: searchResults, isLoading: isSearchingUsers } = useQuery({
    queryKey: ["invitedUsers", userSearchTerm],
    queryFn: () => searchInvitedUsers(userSearchTerm),
    enabled: showUserSearch && userSearchTerm.length > 0,
  });

  // Mutation for sending a message
  const sendMessageMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: (data) => {
      console.log("Message sent successfully:", data);

      // Add the message to the local state immediately
      queryClient.setQueryData(["messages", selectedChat], (old) => {
        if (!old || !old.messages) return { messages: [data] };
        return { messages: [...old.messages, data] };
      });

      // Clear the input
      setMessage("");

      // Scroll to bottom
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    },
    onError: (error) => {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    },
  });

  // Mutation for creating a new conversation
  const createConversationMutation = useMutation({
    mutationFn: createConversation,
    onSuccess: (data) => {
      console.log("Conversation created successfully:", data);

      // Invalidate conversations query to refetch
      queryClient.invalidateQueries(["conversations"]);

      // Select the new conversation
      setSelectedChat(data.conversationId);

      // Close user search
      setShowUserSearch(false);
      setUserSearchTerm("");
    },
    onError: (error) => {
      console.error("Error creating conversation:", error);
      alert("Failed to create conversation. Please try again.");
    },
  });

  const handleSendMessage = () => {
    if (message.trim() && selectedChat) {
      console.log("Sending message to conversation:", selectedChat);
      sendMessageMutation.mutate({
        conversationId: selectedChat,
        content: message,
      });
    }
  };

  const handleEmojiClick = (emoji) => {
    setMessage((prevMessage) => prevMessage + emoji);
    setShowEmojiPicker(false);
  };

  const handleUserSelect = (userId) => {
    console.log("Creating conversation with user:", userId);
    createConversationMutation.mutate(userId);
  };

  const formatMessageTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatConversationTime = (dateString) => {
    if (!dateString) return "";

    const now = new Date();
    const messageDate = new Date(dateString);
    const diffDays = Math.floor((now - messageDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return messageDate.toLocaleDateString([], { weekday: "short" });
    } else {
      return messageDate.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    }
  };

  const getFilteredConversations = () => {
    if (!conversationsData || !conversationsData.conversations) return [];

    return conversationsData.conversations.filter((conv) =>
      conv.otherUser.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleBackToConversations = () => {
    setShowMobileConversations(true);
  };

  const currentConversation = selectedChat
    ? getFilteredConversations().find(
        (conv) => conv.conversation.id === selectedChat
      )
    : null;

  const messages = messagesData?.messages || [];
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      {/* Navbar */}
       {/* <ModernNavbar /> */}

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-5 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}

          <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <MessageSquare className="w-8 h-8 mr-3 text-rose-500" />
                My Room
              </h1>
              <p className="text-gray-600 mt-1">
                Chat with your Qoupled connections
              </p>
            </div>

            <button
              onClick={() => setShowUserSearch(true)}
              className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors shadow-sm flex items-center"
            >
              <Users className="w-4 h-4 mr-2" />
              New Conversation
            </button>
          </div>
          <ConnectedUsersList onUserSelect={handleUserSelect} />

          {/* Socket Connection Status (for debugging) */}
          {/* {process.env.NODE_ENV === 'development' && (
            <div className={`mb-2 px-3 py-1 rounded-md text-xs inline-block ${socketConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              Socket: {socketConnected ? 'Connected' : 'Disconnected'}
            </div>
          )} */}

          {/* Main Chat Interface */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row h-[calc(100vh-220px)] mt-5">
            {/* Conversation List */}
            <div
              className={`w-full md:w-80 border-r border-gray-200 flex flex-col ${
                isMobileView && !showMobileConversations ? "hidden" : "block"
              }`}
            >
              {/* Connected Users Horizontal Scroll */}

              {/* Search */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  className={`flex-1 p-3 text-sm font-medium border-b-2 ${
                    activeTab === "recent"
                      ? "border-rose-500 text-rose-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("recent")}
                >
                  Recent
                </button>
                <button
                  className={`flex-1 p-3 text-sm font-medium border-b-2 ${
                    activeTab === "contacts"
                      ? "border-rose-500 text-rose-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("contacts")}
                >
                  Contacts
                </button>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {isLoadingConversations ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
                  </div>
                ) : getFilteredConversations().length > 0 ? (
                  <div>
                    {getFilteredConversations().map((conv) => (
                      <div
                        key={conv.conversation.id}
                        className={`p-4 flex items-center border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedChat === conv.conversation.id
                            ? "bg-rose-50"
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedChat(conv.conversation.id);
                          if (isMobileView) {
                            setShowMobileConversations(false);
                          }
                        }}
                      >
                        <div className="relative">
                          <div className="h-12 w-12 rounded-full overflow-hidden border border-gray-200">
                            <img
                              src={
                                conv.otherUser.profileImageUrl
                                  ? `${BASE_IMAGE_URL}${conv.otherUser.profileImageUrl}`
                                  : "/default-avatar.png"
                              }
                              alt={conv.otherUser.username || "User"}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div
                            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                              // This would need to be updated with real online status
                              Math.random() > 0.5
                                ? "bg-green-500"
                                : "bg-gray-400"
                            }`}
                          ></div>
                        </div>

                        <div className="ml-3 flex-1 min-w-0">
                          <div className="flex justify-between items-baseline">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {conv.otherUser.username || "User"}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {conv.lastMessage?.createdAt
                                ? formatConversationTime(
                                    conv.lastMessage.createdAt
                                  )
                                : "New"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs truncate text-gray-500">
                              {conv.lastMessage?.senderId === conv.otherUser.id
                                ? ""
                                : "You: "}
                              {conv.lastMessage?.content || "No messages yet"}
                            </p>
                            {/* This would need real unread count data */}
                            {Math.random() > 0.7 && (
                              <span className="ml-2 bg-rose-500 text-white text-xs rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                                {Math.floor(Math.random() * 5) + 1}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-gray-500 font-medium">
                      No conversations yet
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      Start connecting with more people!
                    </p>
                    <button
                      onClick={() => setShowUserSearch(true)}
                      className="mt-4 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors text-sm"
                    >
                      <Plus className="h-4 w-4 inline mr-1" />
                      New Conversation
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div
              className={`flex-1 flex flex-col ${
                isMobileView && showMobileConversations ? "hidden" : "block"
              }`}
            >
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center">
                      {isMobileView && (
                        <button
                          onClick={handleBackToConversations}
                          className="mr-2 p-1 rounded-full hover:bg-gray-100"
                        >
                          <ArrowLeft className="h-5 w-5 text-gray-500" />
                        </button>
                      )}
                      <div className="flex items-center">
                        <div className="relative">
                          <div className="h-10 w-10 rounded-full overflow-hidden">
                            <img
                              src={
                                currentConversation?.otherUser.profileImageUrl
                                  ? `${BASE_IMAGE_URL}${currentConversation.otherUser.profileImageUrl}`
                                  : "/default-avatar.png"
                              }
                              alt={
                                currentConversation?.otherUser.username ||
                                "User"
                              }
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500"></div>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-semibold">
                            {currentConversation?.otherUser.username || "User"}
                          </h3>
                          <p className="text-xs text-gray-500">Online</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <button
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                        onClick={() => setShowUserInfo(!showUserInfo)}
                      >
                        <Info className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                    {isLoadingMessages ? (
                      <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
                      </div>
                    ) : messages.length > 0 ? (
                      <div className="space-y-4">
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${
                              msg.sender.id ===
                              currentConversation?.otherUser.id
                                ? "justify-start"
                                : "justify-end"
                            }`}
                          >
                            {msg.sender.id ===
                              currentConversation?.otherUser.id && (
                              <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0 mr-2">
                                <img
                                  src={
                                    currentConversation?.otherUser
                                      .profileImageUrl
                                      ? `${BASE_IMAGE_URL}${currentConversation.otherUser.profileImageUrl}`
                                      : "/default-avatar.png"
                                  }
                                  alt={
                                    currentConversation?.otherUser.username ||
                                    "User"
                                  }
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}

                            <div
                              className={`max-w-xs sm:max-w-md rounded-2xl py-2 px-4 ${
                                msg.sender.id !==
                                currentConversation?.otherUser.id
                                  ? "bg-rose-500 text-white rounded-tr-none"
                                  : "bg-white text-gray-800 rounded-tl-none border border-gray-200"
                              }`}
                            >
                              <p>{msg.content}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  msg.sender.id !==
                                  currentConversation?.otherUser.id
                                    ? "text-rose-200"
                                    : "text-gray-500"
                                }`}
                              >
                                {formatMessageTime(msg.created_at)}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="bg-rose-100 rounded-full p-4 mb-4">
                          <MessageSquare className="h-8 w-8 text-rose-500" />
                        </div>
                        <h3 className="font-medium text-gray-700">
                          No messages yet
                        </h3>
                        <p className="text-gray-500 text-sm mt-1 max-w-xs">
                          Send your first message to start the conversation!
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-center">
                      <div className="relative" ref={emojiButtonRef}>
                        <button
                          className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        >
                          <Smile className="h-5 w-5" />
                        </button>

                        {/* Emoji Picker */}
                        {showEmojiPicker && (
                          <div className="absolute bottom-12 left-0 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-10 w-64">
                            <div className="grid grid-cols-6 gap-2">
                              {commonEmojis.map((emoji, index) => (
                                <button
                                  key={index}
                                  className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded text-xl transition-colors"
                                  onClick={() => handleEmojiClick(emoji)}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <input
                        type="text"
                        className="flex-1 mx-3 py-2 px-4 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                        placeholder="Type a message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <button
                        className={`p-2 rounded-full ${
                          message.trim()
                            ? "bg-rose-500 text-white hover:bg-rose-600"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                        onClick={handleSendMessage}
                        disabled={!message.trim()}
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-6">
                  <div className="text-center max-w-md">
                    <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">
                      No conversation selected
                    </h2>
                    <p className="text-gray-500 mb-6">
                      Select a conversation from the list or start a new chat
                      with your connections.
                    </p>
                    <button
                      onClick={() => setShowUserSearch(true)}
                      className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                    >
                      <UserPlus className="h-4 w-4 inline mr-2" />
                      Start New Conversation
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Info Sidebar - Only visible when info button is clicked */}
            {showUserInfo && selectedChat && (
              <div className="w-full md:w-72 border-l border-gray-200 bg-white flex flex-col">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-medium">User Information</h3>
                  <button
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                    onClick={() => setShowUserInfo(false)}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-4 flex flex-col items-center border-b border-gray-200">
                  <div className="h-24 w-24 rounded-full overflow-hidden mb-4">
                    <img
                      src={
                        currentConversation?.otherUser.profileImageUrl
                          ? `${BASE_IMAGE_URL}${currentConversation.otherUser.profileImageUrl}`
                          : "/default-avatar.png"
                      }
                      alt={currentConversation?.otherUser.username || "User"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-semibold">
                    {currentConversation?.otherUser.username || "User"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Active now</p>
                </div>

                <div className="p-4 border-b border-gray-200">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">
                    User Status
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3">
                          <Check className="h-4 w-4" />
                        </div>
                        <span className="text-sm">Personality Quiz</span>
                      </div>
                      <span className="text-xs text-green-600 font-medium">
                        Completed
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                          <Check className="h-4 w-4" />
                        </div>
                        <span className="text-sm">Compatibility Test</span>
                      </div>
                      <span className="text-xs text-green-600 font-medium">
                        Completed
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mr-3">
                          <Image
                            src={"/transparent_logo.png"}
                            width={60}
                            height={40}
                          />
                        </div>
                        <span className="text-sm">Compatibility Score</span>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 font-medium px-2 py-1 rounded-full">
                        87%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 flex-1">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">
                    Actions
                  </h4>
                  <div className="space-y-2">
                    <button className="w-full py-2 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors text-sm font-medium">
                      View Compatibility Details
                    </button>
                    <button className="w-full py-2 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors text-sm font-medium">
                      View Full Profile
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Search Modal */}
      {showUserSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-medium text-lg">Start a New Conversation</h3>
              <button
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                onClick={() => {
                  setShowUserSearch(false);
                  setUserSearchTerm("");
                }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4">
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="Search invited users..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                />
              </div>

              <div className="max-h-64 overflow-y-auto">
                {isSearchingUsers ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
                  </div>
                ) : searchResults?.users?.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {searchResults.users.map((user) => (
                      <div
                        key={user.id}
                        className="py-3 flex items-center hover:bg-gray-50 cursor-pointer px-2 rounded-lg transition-colors"
                        onClick={() => handleUserSelect(user.id)}
                      >
                        <div className="h-12 w-12 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
                          <img
                            src={
                              user.profileImageUrl
                                ? `${BASE_IMAGE_URL}${user.profileImageUrl}`
                                : "/default-avatar.png"
                            }
                            alt={user.username}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="ml-3 flex-1">
                          <h4 className="font-medium text-gray-900">
                            {user.username}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {user.country || "No location"}
                          </p>
                        </div>
                        <button className="p-2 rounded-full bg-rose-100 text-rose-600 hover:bg-rose-200 transition-colors">
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : userSearchTerm.length > 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-gray-500 font-medium">
                      No users found
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      Try a different search term
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-gray-500 font-medium">
                      Search for a user
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      Only users you've invited will appear here
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-500 mb-4">
                  Can't find who you're looking for? Remember, you can only chat
                  with users you've invited to Qoupled.
                </p>
                <div className="flex justify-end">
                  <button
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 mr-2"
                    onClick={() => {
                      setShowUserSearch(false);
                      setUserSearchTerm("");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600"
                    onClick={() => router.push("/my-matches")}
                  >
                    Invite New Users
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRoomsPage;
