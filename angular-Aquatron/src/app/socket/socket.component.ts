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
  urlLocal = 'http://127.0.0.1:5000';
  urlVm = 'http://192.168.179.121:5000';
  urlCloud = 'https://pruetpiflask.azurewebsites.net';

  url = this.urlVm;


  ngOnInit(): void {
    this.connect();
    this.setReceiveDataMethod();
    this.setReceiveLoginMethod();

  }

  connect(){
    this.socketio = io(this.url);
  }

  setReceiveDataMethod() {
    this.socketio.on('my response', (data) => {
      this.conversation.push(data)
      console.log(this.conversation);
    });
  }

  setReceiveLoginMethod() {
    this.socketio.on('login response', (data) => {
      // this.conversation.push(data)
      console.log(data);
    });
  }

  sendmessage(message) {
    var payload = { message: message }
    this.socketio.emit('my event',  JSON.stringify(payload));
  }


  sendmessageAll(user, message) {
    var payload = { user: user, message: message }
    this.socketio.emit('my broadcast event',  JSON.stringify(payload));
    // this.sendmessage(message)
    this.message = ""
  }

}
