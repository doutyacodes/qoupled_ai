// server.js (create this file in your project root)
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Create Socket.io server
  const io = new Server(server);

  // Make io accessible globally
  global.io = io;

  // Socket.io middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  // Socket.io connection handling
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);
    
    // Join user to a personal room for direct messages
    socket.join(`user:${socket.userId}`);
    
    // Join conversation
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
    });
    
    // Leave conversation
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});