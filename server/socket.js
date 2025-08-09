export const onlineUsers = new Map();

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("socket connected");
    const userId = socket.handshake.query.userId;
    onlineUsers.set(userId, socket.id);

    /*   io.emit("get-online-users", {
            onlineUsers: Array.from(onlineUsers.keys()),
          });
      
          socket.on("add-user", (userId) => {
            onlineUsers.set(userId, socket.id);
            socket.broadcast.emit("online-users", {
              onlineUsers: Array.from(onlineUsers.keys()),
            });
          }); */
    socket.on("add-user", (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.broadcast.emit("online-users", {
        onlineUsers: Array.from(onlineUsers.keys()),
      });
    });

    socket.on("send-msg", (data) => {
      // get socket id of user to send message
      const sendUserSocket = onlineUsers.get(data.to);
      // if user is online emitting event to user
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit("msg-receive", {
          from: data.from,
          message: data.message,
        });
      }
    });

    socket.on("outgoing-voice-call", (data) => {
      console.log("outgoing-voice-call", data);
      const sendUserSocket = onlineUsers.get(data.to);
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit("incoming-voice-call", {
          from: data.from,
          roomId: data.roomId,
          callType: data.callType,
        });
      }
    });
    socket.on("reject-voice-call", (data) => {
      const sendUserSocket = onlineUsers.get(data.from);
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit("voice-call-rejected");
      }
    });

    socket.on("outgoing-video-call", (data) => {
      console.log("outgoing-video-call", data);
      const sendUserSocket = onlineUsers.get(data.to);
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit("incoming-video-call", {
          from: data.from,
          roomId: data.roomId,
          callType: data.callType,
        });
      }
    });

    socket.on("reject-video-call", (data) => {
      console.log("reject-video-call", data);
      const sendUserSocket = onlineUsers.get(data.from);
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit("video-call-rejected");
      }
    });

    socket.on("accept-incoming-call", (id) => {
      const sendUserSocket = onlineUsers.get(id);
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit("accept-call");
      }
    });

    // log user out
    socket.on("sign-out", (userId) => {
      onlineUsers.delete(userId);
      socket.broadcast.emit("online-users", {
        // example: onlineUsers: [1 => 'abc', 2 => 'bcd', 3 => 'cde]
        onlineUsers: Array.from(onlineUsers.keys()),
      });
    });

    /*     socket.on("send-msg", (data) => {
            const sendUserSocket = onlineUsers.get(data.to);
            if (sendUserSocket) {
                io.to(sendUserSocket).emit("msg-receive", data);
            }
        });
 */
    socket.on("message-seen", (data) => {
      const sendUserSocket = onlineUsers.get(data.from);
      if (sendUserSocket) {
        io.to(sendUserSocket).emit("msg-seen", data);
      }
    });

    socket.on("typing", (data) => {
      const sendUserSocket = onlineUsers.get(data.to);
      if (sendUserSocket) {
        io.to(sendUserSocket).emit("typing", data);
      }
    });

    socket.on("stop-typing", (data) => {
      const sendUserSocket = onlineUsers.get(data.from);
      if (sendUserSocket) {
        io.to(sendUserSocket).emit("stop-typing", data);
      }
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      io.emit("get-online-users", {
        onlineUsers: Array.from(onlineUsers.keys()),
      });
    });
  });
};

export default socketHandler;
