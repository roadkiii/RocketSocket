# RocketSocket
Quick setup of socket.io and basic chat functionality

Modified chat example from https://github.com/socketio/socket.io

## Quick setup

### Server

1. Clone this repository
1. Navigate into project folder
1. ```$ npm install```
1. ```$ npm start```
1. Server is now running on localhost port 4000

### React application

1. Make sure you have a react base application if not ```npx create-react-app my-app```
1. Navigate into project folder
1. ```$ yarn add socket.io-client --save```
1. ```$ yarn start```
1. To simulate chat functionality start two instances of the react application on two different ports. 
1. Overall you will have three live-servers running

#### Inside react component

Initiate connection to socket
```
import socketIOClient from "socket.io-client";

componentDidMount(){
  // Initiates a connection to the socket
  this.socketClient = socketIOClient("http://localhost:4000");
}
```

Listen for emit from the socket
```
componentDidMount(){
  this.socketClient = socketIOClient("http://localhost:4000");

  // .on runs when the "user joined" is emitted from the server
  this.socketClient.on('user joined', data => {console.log(data)})
}
```

Emit to socket
```
// emit to the socket to connet a new user & passes the name of that user
this.socketClient.emit('connect user', this.state.name);
```

#### Listen for .on
* connect user (connect user to chat)
* user joined (a user has joined the chat)
* new message (message was sent)
* typing (user started typing)
* stop typing (user stopped typing)


#### Send to socket
* connect user (connect user to chat)
* new message (send message)
* typing (start typing)
* stop typing (stop typing)