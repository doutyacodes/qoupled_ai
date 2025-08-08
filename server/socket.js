// server/socket.js
// This is a simplified example of how to implement the socket server

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { createAdapter } = require('@socket.io/mysql-adapter');
const mysql = require('mysql2/promise');

// Map to store active users and their socket IDs
const activeUsers = new Map();
// Map to store conversation rooms
const conversationRooms = new Map();

// Create database connection pool for MySQL adapter
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * Initialize socket server
 * @param {Object} server - HTTP server instance
 * @param {Object} db - Database connection
 */
const initializeSocketServer = (server, db) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true
    },
    adapter: createAdapter(pool)
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      
      if (!token) {
        return next(new Error('Authentication token is missing'));
      }
      
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (!decoded || !decoded.userId) {
        return next(new Error('Invalid authentication token'));
      }
      
      // Attach user data to socket
      socket.user = {
        id: decoded.userId,
        username: decoded.username
      };
      
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  // Handle connections
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id}`);
    
    // Store user's socket in the active users map
    activeUsers.set(socket.user.id, socket.id);

    // Join conversation room
    socket.on('join_conversation', async ({ conversationId }) => {
      try {
        // Verify user is a participant in this conversation
        const isParticipant = await db.query(
          'SELECT id FROM conversation_participants WHERE conversation_id = ? AND user_id = ? AND left_at IS NULL',
          [conversationId, socket.user.id]
        );
        
        if (!isParticipant || isParticipant.length === 0) {
          socket.emit('error', { message: 'Cannot join conversation: unauthorized' });
          return;
        }
        
        // Join the room
        socket.join(`conversation:${conversationId}`);
        
        // Add user to conversation room map
        if (!conversationRooms.has(conversationId)) {
          conversationRooms.set(conversationId, new Set());
        }
        conversationRooms.get(conversationId).add(socket.user.id);
        
        console.log(`User ${socket.user.id} joined conversation ${conversationId}`);
      } catch (error) {
        console.error('Error joining conversation:', error);
        socket.emit('error', { message: 'Error joining conversation' });
      }
    });

    // Leave conversation room
    socket.on('leave_conversation', ({ conversationId }) => {
      socket.leave(`conversation:${conversationId}`);
      
      // Remove user from conversation room map
      if (conversationRooms.has(conversationId)) {
        conversationRooms.get(conversationId).delete(socket.user.id);
      }
      
      console.log(`User ${socket.user.id} left conversation ${conversationId}`);
    });

    // Handle typing status
    socket.on('typing', ({ conversationId, isTyping }) => {
      // Emit typing status to conversation room except sender
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        userId: socket.user.id,
        username: socket.user.username,
        isTyping
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      // Remove user from active users map
      activeUsers.delete(socket.user.id);
      
      // Remove user from all conversation rooms
      conversationRooms.forEach((users, conversationId) => {
        if (users.has(socket.user.id)) {
          users.delete(socket.user.id);
        }
      });
      
      console.log(`User disconnected: ${socket.user.id}`);
    });
  });

  // Function to broadcast a new message to conversation participants
  const broadcastNewMessage = (conversationId, message) => {
    io.to(`conversation:${conversationId}`).emit('new_message', message);
  };

  // Function to broadcast a connection request or status change
  const broadcastConnectionUpdate = (userId, data) => {
    const socketId = activeUsers.get(userId);
    if (socketId) {
      io.to(socketId).emit('connection_update', data);
    }
  };

  // Return the io instance and utility functions
  return {
    io,
    broadcastNewMessage,
    broadcastConnectionUpdate
  };
};

module.exports = {
  initializeSocketServer
};