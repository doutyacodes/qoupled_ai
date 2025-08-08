// app/_services/socketService.js
import { io } from 'socket.io-client';

let socket;

export const socketService = {
  /**
   * Initialize socket connection with authentication token
   * @param {string} token - JWT token for authentication
   */
  initialize: (token) => {
    if (socket) {
      socket.disconnect();
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    console.log('Initializing socket connection to:', socketUrl);

    // Create socket connection with auth token
    socket = io(socketUrl, {
      auth: {
        token
      },
      transports: ['websocket'],
      autoConnect: true
    });

    // Socket connection event handlers
    socket.on('connect', () => {
      console.log('Connected to socket server with ID:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from socket server:', reason);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Return the socket instance
    return socket;
  },

  /**
   * Get the current socket instance
   * @returns {Socket} The current socket instance
   */
  socket: () => {
    if (!socket) {
      console.warn('Socket not initialized. Call initialize() first.');
    }
    return socket;
  },

  /**
   * Join a conversation room to receive messages
   * @param {string|number} conversationId - The ID of the conversation to join
   */
  join: (conversationId) => {
    if (!socket || !socket.connected) {
      console.warn('Cannot join room: Socket not connected');
      return;
    }
    
    socket.emit('join_conversation', { conversationId });
    console.log(`Joined conversation room: ${conversationId}`);
  },

  /**
   * Leave a conversation room
   * @param {string|number} conversationId - The ID of the conversation to leave
   */
  leave: (conversationId) => {
    if (!socket || !socket.connected) {
      console.warn('Cannot leave room: Socket not connected');
      return;
    }
    
    socket.emit('leave_conversation', { conversationId });
    console.log(`Left conversation room: ${conversationId}`);
  },

  /**
   * Emit typing status in a conversation
   * @param {string|number} conversationId - The ID of the conversation
   * @param {boolean} isTyping - Whether the user is typing or stopped typing
   */
  emitTyping: (conversationId, isTyping) => {
    if (!socket || !socket.connected) {
      console.warn('Cannot emit typing status: Socket not connected');
      return;
    }
    
    socket.emit('typing', { conversationId, isTyping });
  },

  /**
   * Disconnect the socket
   */
  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
      console.log('Socket disconnected');
    }
  }
};