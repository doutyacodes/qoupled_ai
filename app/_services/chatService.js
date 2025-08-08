// app/_services/chatService.js
const BASE_URL = '/api';

/**
 * Helper function to get the auth headers
 * @returns {Object} Headers object with Authorization token
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  console.log("token",token)
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Get all conversations for the current user
 * @returns {Promise<{conversations: Array}>} - Promise that resolves to conversations data
 */
export const fetchConversations = async () => {
  try {
    const res = await fetch(`${BASE_URL}/conversations`, {
      headers: getAuthHeaders()
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch conversations');
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

/**
 * Get messages for a specific conversation
 * @param {string|number} conversationId - The ID of the conversation
 * @returns {Promise<{messages: Array}>} - Promise that resolves to messages data
 */
export const fetchMessages = async (conversationId) => {
  try {
    if (!conversationId) throw new Error('Conversation ID is required');
    
    const res = await fetch(`${BASE_URL}/conversations/${conversationId}/messages`, {
      headers: getAuthHeaders()
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch messages');
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

/**
 * Send a message in a conversation
 * @param {Object} messageData - The message data
 * @param {string|number} messageData.conversationId - The ID of the conversation
 * @param {string} messageData.content - The message content
 * @param {string} [messageData.messageType='text'] - The message type (text, image, etc.)
 * @param {string|number} [messageData.replyToId] - The ID of the message being replied to
 * @returns {Promise<Object>} - Promise that resolves to the created message
 */
export const sendMessage = async ({ conversationId, content, messageType = 'text', replyToId }) => {
  try {
    if (!conversationId) throw new Error('Conversation ID is required');
    if (!content || content.trim() === '') throw new Error('Message content is required');

    const payload = {
      content,
      messageType
    };

    if (replyToId) {
      payload.replyToId = replyToId;
    }
    
    const res = await fetch(`${BASE_URL}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to send message');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Search for users who have been invited by the current user
 * @param {string} searchTerm - Search term to filter users
 * @returns {Promise<{users: Array}>} - Promise that resolves to matching users
 */
export const searchInvitedUsers = async (searchTerm = '') => {
  try {
    const res = await fetch(`${BASE_URL}/users/invited?search=${encodeURIComponent(searchTerm)}`, {
      headers: getAuthHeaders()
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to search users');
    }
    return res.json();
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

/**
 * Create a new conversation with another user
 * @param {string|number} otherUserId - The ID of the other user
 * @returns {Promise<{conversationId: number, message: string}>} - Promise that resolves to the created conversation
 */
export const createConversation = async (otherUserId) => {
  try {
    if (!otherUserId) throw new Error('Other user ID is required');
    
    const res = await fetch(`${BASE_URL}/conversations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ otherUserId }),
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create conversation');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

/**
 * Delete a message from a conversation
 * @param {string|number} conversationId - The ID of the conversation
 * @param {string|number} messageId - The ID of the message to delete
 * @returns {Promise<{success: boolean}>} - Promise that resolves to success status
 */
export const deleteMessage = async (conversationId, messageId) => {
  try {
    if (!conversationId) throw new Error('Conversation ID is required');
    if (!messageId) throw new Error('Message ID is required');
    
    const res = await fetch(`${BASE_URL}/conversations/${conversationId}/messages/${messageId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete message');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

/**
 * Add a reaction to a message
 * @param {string|number} conversationId - The ID of the conversation
 * @param {string|number} messageId - The ID of the message
 * @param {string} reaction - The reaction emoji
 * @returns {Promise<Object>} - Promise that resolves to the created reaction
 */
export const addMessageReaction = async (conversationId, messageId, reaction) => {
  try {
    if (!conversationId) throw new Error('Conversation ID is required');
    if (!messageId) throw new Error('Message ID is required');
    if (!reaction) throw new Error('Reaction is required');
    
    const res = await fetch(`${BASE_URL}/conversations/${conversationId}/messages/${messageId}/reactions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reaction }),
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to add reaction');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error adding reaction:', error);
    throw error;
  }
};