const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const moment = require('moment');
const formatMessage = require('./users/messages');
const storedMessage = require('./users/storedMessage');

const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./users/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
app.use(express.static(path.join(__dirname)));

const botName = 'Room';

const Mess = require('./models/mess')
const mongoose = require('mongoose')
const mongoDB = 'mongodb+srv://gambo7245:1234@cluster0.yr2kuik.mongodb.net/ChatApp-database?retryWrites=true&w=majority'
mongoose.connect(mongoDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, (err, db) => {
  if (err) {
    throw err;
  }
  console.log("connect MongooseDB sucessful");
  io.on('connection', socket => {
    socket.on('joinRoom', async ({ username, room }) => {
      const user = userJoin(socket.id, username, room);
      socket.join(user.room);
      try {
        let message = await Mess.find();
        message.forEach(mess => {
          if (mess.room == user.room) {
            socket.emit("loadMessage", storedMessage(mess.user, mess.content, mess.time));
          }
        })
        console.log(message);
      } catch (err) {
        console.log(err);
      }
      socket.emit('message', formatMessage(botName, `Welcome to ${user.room}!`));
      socket.broadcast
        .to(user.room)
        .emit(
          'message',
          formatMessage(botName, `${user.username} has joined the chat`)
        );
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    });
    socket.on('chatMessage', async msg => {
      const user = getCurrentUser(socket.id);
      const mess = new Mess({
        user: user.username,
        time: moment().format('h:mm a'),
        content: msg,
        room: user.room,
      });
      try {
        const newMess = await mess.save()
        console.log("mess: ", newMess)
      } catch (e) {
        console.log(e)
      }
      io.to(user.room).emit('message', formatMessage(user.username, msg));
    });
    socket.on('disconnect', () => {
      const user = userLeave(socket.id);
      if (user) {
        io.to(user.room).emit(
          'message',
          formatMessage(botName, `${user.username} has left the chat`)
        );
        io.to(user.room).emit('roomUsers', {
          room: user.room,
          users: getRoomUsers(user.room)
        });
      }
    });
  });
});

const port = process.env.PORT || 8080;
server.listen(port, () => console.log(`Server running on http://localhost:${port}`));
