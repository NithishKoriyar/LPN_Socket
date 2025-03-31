// backend/server.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:8081',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/lpn_socket', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define User Schema and Model
const userSchema = new mongoose.Schema({
  username: String,
  socketId: String,
});

const User = mongoose.model('User', userSchema);

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('register', async (username) => {
    await User.create({ username, socketId: socket.id });
    const users = await User.find({}, 'username');
    io.emit('userList', users.map(user => user.username));
  });


  socket.on('sendNotification', async ({ recipient, title, body }) => {
    const user = await User.findOne({ username: recipient });
    if (user) {
      io.to(user.socketId).emit('notification', { title, body });
      console.log(`Message sent to ${recipient}`);
    } else {
      console.log(`Recipient ${recipient} not found`);
    }
  });
  

  

  socket.on('disconnect', async () => {
    await User.deleteOne({ socketId: socket.id });
    const users = await User.find({}, 'username');
    io.emit('userList', users.map(user => user.username));
    console.log('Client disconnected');
  });
});

server.listen(4000, () => {
  console.log('Server is running on port 4000');
});
