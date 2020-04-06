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
  
  socket.on('new message', (message) => {

    const user = getUser(socket.id);

    io.to(user.room).emit('new message', {
      user: user.name,
      message: message
      }
    );
  });

  socket.on('connect user', ({name, room}, callback) => {

    const { error, user } = addUser({id: socket.id, name: name, room: room });

    if(error) return callback(error);

    socket.emit('admin message', { 
      user: 'ADMIN', 
      message: `Vi välkomnar ${user.name.toUpperCase()} till ${user.room}`
      }
    );

    socket.broadcast.to(user.room).emit('user joined', {
      user: 'ADMIN',
      message: `${user.name.toUpperCase()} har anslutit sig`
      }
    );

    socket.join(user.room);
    ++numUsers;
    callback();
  });

  socket.on('typing', () => {

    const user = getUser(socket.id);

    socket.broadcast.to(user.room).emit('typing', {
      user: user.name,
      message: `${user.name.toUpperCase()} skriver `
    });
  });

  socket.on('stop typing', () => {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  socket.on('disconnect', () => {

    --numUsers;
    const user = getUser(socket.id);
    
    if (user) {
      socket.broadcast.to(user.room).emit('user left', {
        user: 'ADMIN',
        message: `${user.name.toUpperCase()} har lämnat`
      });
  
      removeUser(socket.id);
    }
    

  });
});