import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, shareReplay } from 'rxjs/operators';
import * as moment from 'moment';
import { catchError } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import jwt_decode from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) {
  }

  urlLocal = 'http://localhost:5000';
  urlVm = 'http://192.168.179.121:5000';
  urlCloud = 'https://pruetpiflask.azurewebsites.net';

  url = this.urlVm

  // https://fireship.io/lessons/sharing-data-between-angular-components-four-methods/
  // Keeps "Log In" button updated with correct text to log in or log out
  private loginSource = new BehaviorSubject(false);
  loginMessage = this.loginSource.asObservable();

  login(username:string, password:string ) {
    this.loginSource.next(false);
    // return this.http.post<any>('https://pruetpiflask.azurewebsites.net/login', {username, password})
    return this.http.post<any>(this.url + '/login', {username, password})
        .pipe(
          tap(data => this.setSession(data)),
          tap(() => this.loginSource.next(true)),
          shareReplay())
  }

  private setSession(authResult) {
      var decodeToken = this.getDecodedAccessToken(authResult.access_token);
      const expiresAt = moment().add(authResult.expiresIn,'second');
      localStorage.setItem('id_token', authResult.access_token);
      localStorage.setItem('access', decodeToken.identity),
      localStorage.setItem("expires_at", JSON.stringify(expiresAt.valueOf()));
      // console.log('From Auth Service: ' + authResult.access_token)
  }

  logout() {
      localStorage.removeItem("id_token");
      localStorage.removeItem("expires_at");
      localStorage.removeItem('access')
      this.loginSource.next(false)
  }

  public isLoggedIn() {
      return moment().isBefore(this.getExpiration());
  }

  isLoggedOut() {
      return !this.isLoggedIn();
  }

  getExpiration() {
      const expiration = localStorage.getItem("expires_at");
      const expiresAt = JSON.parse(expiration);
      return moment(expiresAt);
  }

  getDecodedAccessToken(token: string): any {
    try{
        return jwt_decode(token);
    }
    catch(Error){
        return null;
    }
  }


}
