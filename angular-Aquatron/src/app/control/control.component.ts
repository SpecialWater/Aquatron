import { Component, OnInit } from '@angular/core';
import { SettingsService } from './../settings.service'
import { MatSnackBar } from '@angular/material/snack-bar';

import * as io from 'socket.io-client';

@Component({
  selector: 'app-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.css']
})
export class ControlComponent implements OnInit {

private socketio: SocketIOClient.Socket;

settings = <any>[];
newSettings = <any>[];
saveDisabled: boolean;

gasInjectionOn: boolean;
heaterOn: boolean;
lightRefugiumOn: boolean;
lightUVOn: boolean;
pumpOn: boolean;

// https://github.com/Agranom/ngx-material-timepicker#ngxtimepickerfieldcomponent
gasInjectionStartTime: string;
gasInjectionDuration: string;
lightRefugiumStartTime: string;
lightRefugiumDuration: string;
lightUVStartTime: string;
lightUVDuration: string;
heaterMinTemp: number;
heaterMaxTemp: number;
pumpPower: number;

  constructor(
    private settingsService: SettingsService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {

    this.settingsService.getSettings().subscribe(
      res => {
        this.settings = res;
        this.parseSettings();
      }
    )

    if(localStorage.getItem('access') != 'admin'){
      this.saveDisabled = true;
    } else {
      this.saveDisabled = false;
    }
  }

  parseSettings(){

    this.gasInjectionOn = this.settings.GasInjection.Enabled;
    this.gasInjectionDuration = this.settings.GasInjection.Timer;
    this.gasInjectionStartTime = this.settings.GasInjection.TimeOn;

    this.lightRefugiumOn = this.settings.Light_Refugium.Enabled;
    this.lightRefugiumDuration = this.settings.Light_Refugium.Timer;
    this.lightRefugiumStartTime = this.settings.Light_Refugium.TimeOn;

    this.lightUVOn = this.settings.Light_UV.Enabled;
    this.lightUVDuration = this.settings.Light_UV.Timer;
    this.lightUVStartTime = this.settings.Light_UV.TimeOn;

    this.pumpOn = this.settings.Pump.Enabled;
    this.pumpPower = this.settings.Pump.Power;


    this.heaterOn = this.settings.Heater.Enabled;
    this.heaterMinTemp = this.settings.Heater.MinTemp;
    this.heaterMaxTemp = this.settings.Heater.MaxTemp;

    console.log(this.settings)
  }

  onSave(){

    this.lightUVStartTime = this.formatTime(this.lightUVStartTime);
    this.lightRefugiumStartTime = this.formatTime(this.lightRefugiumStartTime);
    this.gasInjectionStartTime = this.formatTime(this.gasInjectionStartTime);

    this.newSettings = [{
      "Light_UV":
        {
        "Enabled": this.lightUVOn,
        "TimeOn": this.lightUVStartTime,
        "Timer": this.lightUVDuration
        },
      "Light_Refugium":
        {
          "Enabled": this.lightRefugiumOn,
          "TimeOn": this.lightRefugiumStartTime,
          "Timer": this.lightRefugiumDuration
        },
      "Heater":
        {
          "Enabled": this.heaterOn,
          "MinTemp": this.heaterMinTemp,
          "MaxTemp": this.heaterMaxTemp
        },
      "GasInjection":
        {
          "Enabled": this.gasInjectionOn,
          "TimeOn": this.gasInjectionStartTime,
          "Timer": this.gasInjectionDuration
        },
      "Pump":
        {
          "Enabled": this.pumpOn,
          "Power": this.pumpPower
        }
    }];

    // console.log(this.newSettings[0])
    this.settingsService.postSettings(this.newSettings[0]);
    this._snackBar.open('New Settings', 'Saved!', {
      duration: 1500,
    });


  }

  formatTime(timeVariable){
    // Add 0 to front if hour is single digit
    if(timeVariable[1]==":"){
      timeVariable = "0" + timeVariable
      if(timeVariable.slice(6,8) == "PM"){
        var tempHour = parseInt(timeVariable.slice(0,2)) + 12
        timeVariable = tempHour.toString() + timeVariable.slice(2,5)
      } else {
        timeVariable = timeVariable.slice(0, 5)
      }
    // Edge case - 12 AM into military time becomes 00
    } else if(timeVariable.slice(6,8) == "AM" && timeVariable.slice(0,2) == "12"){
      timeVariable = '00' + timeVariable.slice(2,5)
    // Edge case - there is no 2400 time in military time so keep it 12
    } else if(timeVariable.slice(6,8) == "PM" && timeVariable.slice(0,2) == "12"){
      timeVariable = '12' + timeVariable.slice(2,5)
    // Add 12 hours to account for PM
    } else if(timeVariable[2]==":" && timeVariable.slice(6,8) == "PM"){
      var tempHour = parseInt(timeVariable.slice(0,2)) + 12
      timeVariable = tempHour.toString() + timeVariable.slice(2,5)
    } else{
      timeVariable = timeVariable.slice(0, 5)
    }

    return timeVariable
  }

  openSnackBar(message: string, action: string) {

  }

}
