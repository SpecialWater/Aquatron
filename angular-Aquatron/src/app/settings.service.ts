import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class SettingsService {
  urlLocal = 'http://localhost:5000';
  urlVm = 'http://192.168.179.121:5000';
  urlCloud = 'https://pruetpiflask.azurewebsites.net';

  url = this.urlCloud

  getSettings() {
    //return this.http.get('https://pruetpiflask.azurewebsites.net/settings/get')
    return this.http.get(this.url + '/settings/get')
  }

  postSettings(data){
    // const headers = new HttpHeaders({
    //   'Content-Type': 'application/json',
    //   'Authorization': 'Bearer ' + localStorage.getItem('id_token')
    // })

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'})


      // return this.http.post<any>('https://pruetpiflask.azurewebsites.net/settings/post',
      return this.http.post<any>(this.url + '/settings/post',
      JSON.stringify(data),
      {headers: headers}).subscribe(
        // data => {console.log(data)}
      );
  }


  constructor(
    private http: HttpClient
  ) { }

}
