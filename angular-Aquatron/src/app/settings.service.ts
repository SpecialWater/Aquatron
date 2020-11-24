import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class SettingsService {

  headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  // very important that JSON is formated in "record" format (see pandas to_json doc)
  getSettings() {
    // console.log('https://localhost:5001/api' + current_route)
    //return this.http.get('https://localhost:5001/api' + current_route)
    return this.http.get('http://localhost:5001/settings/get')
  }

  postSettings(data){
    return this.http.post<any>('http://localhost:5001/settings/post',
      JSON.stringify(data),
      {headers: this.headers}).subscribe(
        // data => {console.log(data)}
      );
  }


  constructor(
    private http: HttpClient
  ) { }

}
