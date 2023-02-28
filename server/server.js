const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const ACTIONS = require('./Actions');

const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('build'));
app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
})

//* object to store the socketId and username mapping
const userSocketMap = {};

function getAllConnectedClients(roomId) {
    //* using from method to convert the map into array value returned by get function
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (sockedId) => {
            return {
                sockedId,
                username: userSocketMap[sockedId],
            };
        }
    );
}

io.on('connection', (socket) => {

    // join event in the socket
    socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
        userSocketMap[socket.id] = username;
        socket.join(roomId); //* socket will join the roomId , if roomId already exists then it will just add the scoket
        const clients = getAllConnectedClients(roomId); //TODO to get all the clients present in that room
        //console.log(clients);
        //? sending data to the client to the every clients connected to that room so that we can notify if the new mebber joins
        clients.forEach(({ sockedId }) => {

            io.to(sockedId).emit(ACTIONS.JOINED, {
                clients,
                username,
                sockedId: socket.id,
            });
        });
    });

    // sync the code event in the socket
    socket.on(ACTIONS.CODE_CHANGE, ({roomId, code}) => {
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code }); 
    });

    // synct the code as soon as new member join the room
    socket.on(ACTIONS.SYNC_CODE, ({socketId, code}) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code }); 
    });

    // disconnect event in the socket
    socket.on('disconnecting', () => {
        const rooms  = [...socket.rooms]; //* getting all the rooms
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {  //* emitting the disconnect event
                sockedId: socket.id,
                username: userSocketMap[socket.id],
            });
        });

        delete userSocketMap[socket.id]; // deleting the socket id and username from the mapping 
        socket.leave(); // leaving the socket
    });

    
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listening to the port ${PORT}`));

