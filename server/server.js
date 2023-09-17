const express = require('express');
const { chats } = require('./data/data');
const dotenv = require("dotenv");
const connectDB= require("./config/db");
const colors = require("colors");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes")
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
dotenv.config();
connectDB();

const app = express();

app.use(express.json()); //to accept json data


app.get('/', (req, res) => {
  res.send("API is running successfully");
});

app.use('/api/user',userRoutes);
app.use('/api/chat',chatRoutes);
app.use('/api/message',messageRoutes);

app.use(notFound)
app.use(errorHandler)
const PORT = process.env.PORT || 5000;

const server= app.listen(PORT, () => {
  console.log(`Server started on Port ${PORT}`.yellow.bold);
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: 'http://localhost:3000', // Make sure this matches your React app's origin
  }
});


io.on("connection",(socket)=>{
  console.log(`Socket Connection established with ID: ${socket.id}`);
socket.on('setup',(userData)=>{
  socket.join(userData._id
  );
  console.log(userData._id);
  socket.emit("connected");
});

socket.on('join chat', (room) => {
  socket.join(room);
  console.log("User Joined Room: " + room);
});

socket.on('new message',(newMessageReceived)=>{
  console.log("New message received from the client",newMessageReceived);
  var chat = newMessageReceived.chat;
  if(!chat.users) return console.log("Chat.users not defiled");
  chat.users.forEach(user=>{
    if(user._id== newMessageReceived.sender._id) return;
    socket.in(user._id).emit("message received",newMessageReceived)
  })
})

});
