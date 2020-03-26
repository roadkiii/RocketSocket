import React, {Component} from 'react';
import './App.css';

import socketIOClient from "socket.io-client";

class App extends Component {

  socketClient = null;

  constructor(props){
    super(props)
  }

  componentDidMount(){
    this.socketClient = socketIOClient("http://localhost:4000");

    this.socketClient.on('connect user', data => {console.log(data)})
    this.socketClient.on('user joined', data => {console.log(data)})
  }

  connect = () => {
    this.socketClient.emit('connect user', 'John Doe');
  }
  
  render(){
    return (
      <div className="App">
        <button onClick={this.connect}>Connect</button>
      </div>
    );
  }
  
}

export default App;
