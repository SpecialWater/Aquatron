import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class StateService {

  getState(minutes) {
    const URL = 'https://pruetpiflask.azurewebsites.net/state/get/'

    // return this.http.get(URL + minutes.toString())
    return this.http.get('http://localhost:5000/state/get/' + minutes.toString())
  }

  constructor(private http: HttpClient) { }
}
