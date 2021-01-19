import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class SettingsService {

  getSettings() {
    //return this.http.get('https://pruetpiflask.azurewebsites.net/settings/get')
    return this.http.get('http://localhost:5000/settings/get')
  }

  postSettings(data){
    // const headers = new HttpHeaders({
    //   'Content-Type': 'application/json',
    //   'Authorization': 'Bearer ' + localStorage.getItem('id_token')
    // })

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'})

    // return this.http.post<any>('https://pruetpiflask.azurewebsites.net/settings/post',
    // // return this.http.post<any>('http://localhost:5001/settings/post',
    //   JSON.stringify(data),
    //   {headers: headers}).subscribe(
    //     // data => {console.log(data)}
    //   );

      // return this.http.post<any>('https://pruetpiflask.azurewebsites.net/settings/post',
      return this.http.post<any>('http://localhost:5000/settings/post',
      JSON.stringify(data),
      {headers: headers}).subscribe(
        // data => {console.log(data)}
      );
  }


  constructor(
    private http: HttpClient
  ) { }

}
