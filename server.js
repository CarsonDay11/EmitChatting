const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

let rooms = {};

app.post('/create-room', (req, res) => {
    const { roomName, password } = req.body;
    rooms[roomName] = password;
    res.send('Room created successfully');
});

app.post('/join-room', (req, res) => {
    const { roomName, password } = req.body;
    if (rooms[roomName] === password) {
        res.send('Authentication successful');
    } else {
        res.status(401).send('Invalid password');
    }
});

io.on('connection', (socket) => {
    socket.on('join-room', (roomName) => {
        socket.join(roomName);
    });

    socket.on('chat-message', (data) => {
        io.to(data.roomName).emit('chat-message', data.message);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
