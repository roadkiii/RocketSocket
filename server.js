var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var cors = require('cors');

var numUsers = 0;
var users = [];

app.use(cors());

app.use('/users', function (req, res, next) {
  res.send({
    nrOfUsers: numUsers,
    users: users
  });
})

http.listen(4000, function(){
  console.log('listening on *:4000');
});


io.on('connection', (socket) => {
  var addedUser = false;
  
  socket.on('new message', (data) => {
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

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

  socket.on('typing', (value) => {
    console.log('value', value)
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