import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class StateService {

  getState(variable, minutes) {
    const URL = 'https://pruetpiflask.azurewebsites.net/state/get/'

    return this.http.get(URL + variable + '/' + minutes)
    //return this.http.get('http://localhost:5001/settings/get')
  }

  constructor(private http: HttpClient) { }
}
