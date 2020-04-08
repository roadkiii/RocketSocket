var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var cors = require('cors');

var numUsers = 0;
var numRooms = 0;
var messages = [];

var users = [];
var rooms = [];

app.use(cors());

app.use('/users', (req, res, next) => {
  res.send({
    nrOfUsers: numUsers,
    users: users
  });
})

app.use('/rooms', (req, res, next) => {
  res.send({
    rooms: rooms
  });
})

app.use('/messages', (req, res, next) => {
  res.send({
    messages: messages
  });
})

http.listen(4000, function(){
  console.log('listening on *:4000');
});



// Socker related
io.on('connection', (socket) => {
  var addedUser = false;

  /**
   * @description adds a new message to a chat room, saves this message in an array consisting of all messages in all chat rooms.
   * @param {roomId, message}
   * @emits username the user who sent the message
   * @emits message the message
   * @emits roomId id of the room where the message belongs
   */
  socket.on('new message', ({roomId, message}) => {

    messages.push({
      username: socket.username,
      message: message,
      roomId: roomId
    });

    socket.broadcast.to(roomId).emit('new message',  {
      username: socket.username,
      message: message,
      roomId: roomId
    });
  });

  /**
   * @description Creates & Joins a new chat room
   * @param users the users in the room INCLUDING the user who created it
   * @emits roomId id of the room
   * @emits participants all the participants in the room
   */
  socket.on('create room', (users) => {
    const newRoom = {roomId: numRooms, participants: users};
    
    rooms.push(newRoom);
    socket.join(numRooms);

    socket.emit('room created', {
      roomId: numRooms,
      participants: users
    });

    socket.broadcast.emit('room created', {
      roomId: numRooms,
      participants: users
    });

    numRooms++;
  })

  /**
   * @description Join an existing room
   * @param roomId id if the current room
   * @emits roomId
   */
  socket.on('join room', (roomId) => {
    socket.join(roomId);
    socket.emit('joined room', roomId);
  })


  /**
   * Connect user to the socket
   */
  socket.on('connect user', (username) => {
    if (addedUser) return;

    socket.username = username;
    ++numUsers;
    users.push(username);

    addedUser = true;
    socket.emit('connect user', {
      numUsers: numUsers
    });

    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });


  /**
   * @description If a user starts typing in a specifc room
   * @param {roomId} the id of the current room
   * @emits username username of the typing user
   * @emits activity
   */
  socket.on('typing', ({roomId}) => {
    socket.broadcast.to(roomId).emit('typing', {
      username: socket.username,
      activity: 'typing'
    });
  });


  /**
   * @description If a user stops typing in a specifc room
   * @param roomId the id of the current room
   * @emits username of the non typing user
   * @emits activity
   */
  socket.on('stop typing', ({roomId}) => {
    socket.broadcast.to(roomId).emit('stop typing', {
      username: socket.username,
      activity: 'stopped typing'
    });
  });

  socket.on('disconnect', () => {
    if (addedUser) {
      --numUsers;

      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});