import { Time } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SettingsService } from './../settings.service'

@Component({
  selector: 'app-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.css']
})
export class ControlComponent implements OnInit {

settings = <any>[];

gasInjectionOn: boolean;
heaterOn: boolean;
lightRefugiumOn: boolean;
lightUVOn: boolean;
pumpOn: boolean;

gasInjectionStartTime: Time;
gasInjectionDuration: Time;
lightRefugiumStartTime: Time;
lightRefugiumDuration: Time;
lightUVStartTime: Time;
lightUVDuration: Time;



  constructor(
    private settingsService: SettingsService
  ) { }

  ngOnInit(): void {
    this.settingsService.getSettings().subscribe(
      res => {
        this.settings = res;
        this.logSettings();
      }
    )
  }


  logSettings(){
    this.gasInjectionOn = this.settings.GasInjection.Enabled;
    this.heaterOn = this.settings.Heater.Enabled;
    this.lightRefugiumOn = this.settings.Light_Refugium.Enabled;
    this.lightUVOn = this.settings.Light_UV.Enabled;
    this.pumpOn = this.settings.Pump.Enabled;

    console.log(this.settings)
  }
}
