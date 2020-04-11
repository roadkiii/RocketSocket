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
    console.log('new user')
    const { error, user } = addUser({id: socket.id, name: name, room: room });

    console.log(user);

    if(error) return callback(error);
    
    if (user) {
      socket.emit('admin message', { 
        user: 'ADMIN', 
        message: `Vi välkomnar ${user.name.toUpperCase()} till ${user.room}`,
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

  socket.on('typing', () => {

    const user = getUser(socket.id);

    socket.broadcast.to(user.room).emit('typing', {
      user: user.name,
      message: `${user.name.toUpperCase()} skriver `,
    });
  });

  socket.on('stop typing', () => {
    const user = getUser(socket.id);

    socket.broadcast.to(user.room).emit('stop typing', {
      user: user.name,
      message: `${user.name.toUpperCase()} slutat skriva `,
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