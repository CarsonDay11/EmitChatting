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
let roomInfo = {};

const adminUser = process.env.ADMIN_USER;
const adminPassword = process.env.ADMIN_PASSWORD;

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/socket.io/socket.io.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'node_modules', 'socket.io-client', 'dist', 'socket.io.js'));
});

app.post('/admin/delete-room', (req, res) => {
    const { roomName, username, password } = req.body;
    if (username === adminUser && password === adminPassword) {
        if (rooms[roomName]) {
            delete rooms[roomName];
            delete roomInfo[roomName];
            res.send(`Room '${roomName}' deleted successfully`);
        } else {
            res.status(404).send(`Room '${roomName}' not found`);
        }
    } else {
        res.status(401).send('Unauthorized');
    }
});

function generateRoomId() {
    // Function to generate a unique room ID
    return Math.random().toString(36).substring(2, 8);
}

app.post('/create-room', (req, res) => {
    const { roomName, password } = req.body;
    const roomId = generateRoomId();
    rooms[roomId] = password;
    roomInfo[roomId] = { roomName, password };
    res.redirect(`/room/${roomId}`);
});

app.get('/room/:roomId', (req, res) => {
    const roomId = req.params.roomId;
    const room = roomInfo[roomId];
    if (room) {
        res.sendFile(path.join(__dirname, 'public', 'room.html'));
    } else {
        res.status(404).send('Room not found');
    }
});

app.post('/join-room', (req, res) => {
    const { roomId, password } = req.body;
    if (rooms[roomId] === password) {
        res.send('Authentication successful');
    } else {
        res.status(401).send('Invalid password');
    }
});

io.on('connection', (socket) => {
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
    });

    socket.on('chat-message', (data) => {
        io.to(data.roomId).emit('chat-message', data.message);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
