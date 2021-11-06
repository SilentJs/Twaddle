const path = require('path');
const http = require('http');
const express = require('express');
const app = express();
const server =  http.createServer(app);
const socketio = require('socket.io')
const io = socketio(server);

const  {userJoin , getCurrentUser , userLeave , getRoomUsers} = require('./utils/users')
const mongoose = require('mongoose')
const mongoDB='mongodb+srv://twaddle-system:twaddle2007@cluster0.lqt4d.mongodb.net/message-database?retryWrites=true&w=majority'
mongoose.connect(mongoDB , {useNewUrlParser:true , useUnifiedTopology:true}).then(()=>{
    console.log("Database Connected")
})
const {formatMessage,nsg} = require('./utils/messages')


//tHIS IS STATIC FOLDER!!

app.use(express.static(path.join(__dirname , 'public')));

const botName = 'System'

//Run when a IP connects 

io.on('connection', (socket) =>{
nsg.find().then(result =>{
    socket.emit('output-messages' , result)
})

socket.on('joinRoom' , ({username , room})=>{
const user = userJoin( socket.id , username , room);
    socket.join(user.room);
    //Sends Welcome to new connected user
    socket.emit('message',formatMessage(botName, 'Welcome to Twaddle!'));
//Runs when user connects
    socket.broadcast.
    to(user.room)
    .emit('message' ,formatMessage(botName,`${user.username} joined the chat`));
io.to(user.room).emit('roomUsers' , {
    room: user.room,
    users: getRoomUsers(user.room)
});
});

    //Listen for chatMessage
    socket.on('chatMessage' , (msg)=>{ 
        const message = new nsg({msg})
        message.save().then(()=>{
            const user = getCurrentUser(socket.id);
            socket.emit('message', formatMessage(user.username,msg))
            console.log(user.room +' :',user.username + ' : ', msg);
        })
        })
        
    //Runs when user disconnects
    socket.on('disconnect' , ()=>{
        const user = userLeave(socket.id)
        if(user){
        io.to(user.room).emit('message'  , formatMessage(botName, `${user.username} left the chat`));
        io.to(user.room).emit('roomUsers' , {
            room: user.room,
            users: getRoomUsers(user.room)
        });
        }
    })
})

const PORT = 3000 || process.env.PORT;

server.listen(PORT,() => console.log(`Chat server running! , PORT : ${PORT}`));


