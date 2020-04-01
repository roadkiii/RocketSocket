var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var cors = require('cors');

const { 
  users, 
  addUser, 
  removeUser, 
  getUser, 
  getUsersInRoom 
} = require('./users.js');

var numUsers = 0;

app.use(cors());

app.use('/users', function (req, res, next) {
  res.send({
    nrOfUsers: numUsers,
    users: users
  });
})

http.listen(4000, function(){
  console.log('listening on *:3000');
});


io.on('connection', (socket) => {
  var addedUser = false;
  
  socket.on('new message', (message) => {
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: message
    });
  });

  socket.on('connect user', (name) => {

    socket.name = name;
    ++numUsers;
    const userAdded = addUser(name);

    if (userAdded) {
      socket.emit('connect user', {
        numUsers: numUsers
      });
    }

    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  socket.on('typing', () => {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  socket.on('stop typing', () => {
    socket.broadcast.emit('stop typing', {
      username: socket.username
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