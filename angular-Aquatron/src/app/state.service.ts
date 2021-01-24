import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class StateService {
  urlLocal = 'http://localhost:5000';
  urlVm = 'http://192.168.179.121:5000';
  urlCloud = 'https://pruetpiflask.azurewebsites.net';


  url = this.urlVm

  getState(minutes) {
    return this.http.get(this.url + '/state/get/' + minutes.toString())
  }

  constructor(private http: HttpClient) { }
}
