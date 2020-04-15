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
var rooms = [
  {
    roomName: 'mainRoom',
    users: users
  },
];

app.use(cors());

app.use('/users', function (req, res, next) {
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

http.listen(4000, function(){
  console.log('listening on *:4000');
});

io.on('connection', (socket) => {
  
  socket.on('new message', (message) => {

    const user = getUser(socket.id);
    if (user) {
      io.to(user.room).emit('new message', {
        user: user.name,
        message: message,
        date: new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds(),
        }
      );
    };
  });

  socket.on('connect user', ({name, room}, callback) => {

    const { error, user } = addUser({id: socket.id, name: name, room: room });

    console.log(user);

    if(error) return callback(error);
    
    if (user) {
      socket.emit('admin message', { 
        user: 'ADMIN', 
        message: `Välkommen till ${user.room},  ${user.name.toUpperCase()}`,
        date: new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds(),
        }
      );
    }
    
    socket.broadcast.to(user.room).emit('user joined', {
      user: 'ADMIN',
      message: `${user.name.toUpperCase()} har anslutit sig`,
      date: new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds(),
      }
    );

    socket.join(user.room);
    ++numUsers;
    console.log(users);
  });

  // socket.on('create room', ({_users, roomName}) => {
  //   const newRoom = {roomName: roomName, participants: _users};
    
  //   let usersInRoom = [];

  //   _users.forEach(_user => {
  //     usersInRoom.push(users.find( user => user.name === _user));
  //   });
    
  //   rooms.push(newRoom);
  //   socket.join(roomName);

  //   socket.emit('room created', {
  //     roomName: roomName,
  //     participants: _users
  //   });

  //   socket.broadcast.emit('room created', {
  //     roomId: numRooms,
  //     participants: _users
  //   });
  // })

  socket.on('typing', () => {

    const user = getUser(socket.id);

    socket.broadcast.to(user.room).emit('typing', {
      user: user.name,
    });
  });

  socket.on('stop typing', () => {
    const user = getUser(socket.id);

    socket.broadcast.to(user.room).emit('stop typing', {
      user: user.name,
    });
  });

  socket.on('disconnect', () => {

    --numUsers;
    const user = getUser(socket.id);
    
    if (user) {
      socket.broadcast.to(user.room).emit('user left', {
        user: 'ADMIN',
        message: `${user.name.toUpperCase()} har lämnat`,
        date: new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds(),
      });
  
      removeUser(socket.id);
    }
    

  });
});