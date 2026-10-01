const connectedUsers = new Map(); // userId -> socketId

export const setupSocketIO = (io) => {
  io.on('connection', (socket) => {
    console.log(`📡 Socket connected: ${socket.id}`);

    // Register user with their socket
    socket.on('register', (userId) => {
      if (userId) {
        connectedUsers.set(userId, socket.id);
        socket.join(`user:${userId}`);
        console.log(`👤 User ${userId} registered on socket ${socket.id}`);
      }
    });

    // Join role room
    socket.on('joinRole', (role) => {
      if (role) socket.join(`role:${role}`);
    });

    // Join department room
    socket.on('joinDepartment', (deptId) => {
      if (deptId) socket.join(`dept:${deptId}`);
    });

    socket.on('disconnect', () => {
      for (const [userId, sid] of connectedUsers.entries()) {
        if (sid === socket.id) {
          connectedUsers.delete(userId);
          break;
        }
      }
      console.log(`📡 Socket disconnected: ${socket.id}`);
    });
  });
};

// Helper to emit to a specific user
export const emitToUser = (io, userId, event, data) => {
  io.to(`user:${userId}`).emit(event, data);
};

// Helper to emit to a role
export const emitToRole = (io, role, event, data) => {
  io.to(`role:${role}`).emit(event, data);
};

// Helper to emit to all
export const emitToAll = (io, event, data) => {
  io.emit(event, data);
};
