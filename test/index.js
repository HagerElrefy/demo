const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    console.log('a user connected');

    // Listen for the 'set nickname' event when a user joins
    socket.on('set nickname', (nickname) => {
        socket.nickname = nickname;
        io.emit('user joined', `${nickname} joined the chat`);
        
    });
    // Listen for 'set typing message' event
    socket.on('set typing message' , (data)=>{
        var res ;
        if(data){
             res = {
                usrName : socket.nickname,
                txt : "typing..."
            };
            io.emit('recieve response' , res);
        }else{
            res = {
                usrName : socket.nickname,
                txt : ""
            };
            io.emit('recieve response' , res);
        }
    })
    // Listen for 'chat message' event
    socket.on('chat message', (data) => {
        console.log(`${socket.nickname}: ${data.message}`);
        // Emit the message along with the sender's nickname and timestamp
        io.emit('send message to all users', {
            nickname: socket.nickname,
            message: data,
            timestamp: new Date().toLocaleTimeString()
        });
        //io.emit('reciver userName' , nickname);
    });

    // Listen for disconnect event
    socket.on('disconnect', () => {
        console.log(`${socket.nickname} disconnected`);
        io.emit('user left', `${socket.nickname} left the chat`);
    });
});

server.listen(3000, () => {
    console.log("http://localhost:3000/");
});