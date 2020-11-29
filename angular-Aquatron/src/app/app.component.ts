import { Component, OnInit } from '@angular/core';
import { AuthService } from "./login/./auth.service"
import { Router } from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'angular-Aquatron';
  loggedIn: boolean;
  loginText: string;


  loggedInMessage: boolean;
  tokenTrue: boolean;

  constructor(
    private authService: AuthService,
    private router: Router
    ) { }

  ngOnInit(): void {
    this.authService.loginMessage.subscribe(message => this.loggedInMessage = message)
    if(localStorage.getItem('id_token') != null){
      this.tokenTrue = true;
    } else {
      this.tokenTrue = false;
    }
  }


  setLogin(){
    this.authService.loginMessage.subscribe(message => this.loggedInMessage = message)
    if(localStorage.getItem('id_token') != null){
      this.authService.logout();
    }
    this.tokenTrue = false;
    this.router.navigateByUrl('/login');
  }


}
