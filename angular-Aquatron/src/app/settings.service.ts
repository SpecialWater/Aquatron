import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  // very important that JSON is formated in "record" format (see pandas to_json doc)
  getSettings() {
    // console.log('https://localhost:5001/api' + current_route)
    //return this.http.get('https://localhost:5001/api' + current_route)
    return this.http.get('http://localhost:5001/settings/get')
  }


  constructor(
    private http: HttpClient
  ) { }

}
