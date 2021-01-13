import { Component, OnInit } from '@angular/core';
import * as io from 'socket.io-client';


@Component({
  selector: 'app-socket',
  templateUrl: './socket.component.html',
  styleUrls: ['./socket.component.css']
})
export class SocketComponent implements OnInit {

  private socketio: SocketIOClient.Socket;
  user: string;
  message: string;
  conversation = <any>[];


  ngOnInit(): void {
    this.connect();
    this.setReceiveMethod();
  }

  connect(){
    this.socketio = io('http://localhost:5000');
  }

  setReceiveMethod() {
    this.socketio.on('my response', (data) => {
      this.conversation.push(data)
      console.log(this.conversation);
    });
  }



  sendmessageAll(user, message) {
    var payload = { user: user, message: message }
    this.socketio.emit('my broadcast event',  JSON.stringify(payload));
    this.message = ""
  }

}
