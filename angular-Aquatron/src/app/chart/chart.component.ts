import { Component, OnInit } from '@angular/core';
import { StateService } from './../state.service'
import { Subscription, timer } from 'rxjs';
import { max, switchMap } from 'rxjs/operators';
import * as moment from 'moment';

import * as Highcharts from "highcharts";

// To Do:
// I think cosmosDB can use the same time units as highcharts
// seconds since jan 1, 1970, need to add to data model
// Get x axis on charts to show time and no numbers


@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {
  minutes = 120
  Highcharts: typeof Highcharts = Highcharts; // required


  chartConstructor: string = 'chart'; // optional string, defaults to 'chart'
  chart: Highcharts.Chart;
  updateFlag: boolean = false; // optional boolean
  oneToOneFlag: boolean = true; // optional boolean, defaults to false

  temperatureChartOptions: Highcharts.Options = {
    series: [
      {
      data: [],
      name: "Temperature",
      type: 'spline',
      pointInterval: 60 * 1000,
      pointStart: Date.now() - 3600 * (6 + this.minutes / 60) * 1000 // start 6 hours before right now (UTC -> Central)
      }
    ],
    credits: {
      enabled: false
    },
    title: {
      text: 'Temperature',
    },
    xAxis: {
      title: {
        text: 'Time',
      },
      // min: Date.now() - 3600 * (6 + this.minutes / 60) * 1000, // start 7 hours before right now (UTC -> Central)
      type: 'datetime',
      startOnTick: false,
      minPadding:0.015,
      dateTimeLabelFormats: {
        minute: '%H:%M',
        hour: '%H:%M',
      },
    },
    yAxis: {
      title: {
        text: 'Temperature',
      },
      max: 80,
      min: 70,
      tickInterval: 2
    },
    legend: {
      enabled: false
    }
  }; // required

  pHChartOptions: Highcharts.Options = {
    series: [
      {
      data: [],
      name: "pH",
      type: 'spline',
      pointInterval: 60 * 1000,
      pointStart: Date.now() - 3600 * (6 + this.minutes / 60) * 1000 // start 6 hours before right now (UTC -> Central)
      }
    ],
    credits: {
      enabled: false
    },
    title: {
      text: 'pH',
    },
    xAxis: {
      title: {
        text: 'Time',
      },
      // min: Date.now() - 3600 * (6 + this.minutes / 60) * 1000, // start 7 hours before right now (UTC -> Central)
      type: 'datetime',
      startOnTick: false,
      minPadding:0.015,
      dateTimeLabelFormats: {
        minute: '%H:%M',
        hour: '%H:%M',
      },
    },
    yAxis: {
      title: {
        text: 'pH',
      },
      max: 5,
      min: 9,
      tickInterval: 0.5
    },
    legend: {
      enabled: false
    }
  }; // required

  chartOptions = [
    { chartConfig: this.temperatureChartOptions },
    { chartConfig: this.pHChartOptions },
  ];



  subscriptionState: Subscription;

  constructor(
    private stateService: StateService,
  ) { }

  ngOnInit(): void {

    this.subscriptionState = timer(0, 10000).pipe(
      switchMap(() => this.stateService.getState(this.minutes))
      ).subscribe(result => {
        var dataTemperature = this.parse_data(result, 'Temperature');
        var dataPH = this.parse_data(result, 'pH');
        this.update_chart(dataTemperature, dataPH);

        console.log(result)
      });

  }


  parse_data(data, variable) {
    var arrayData = [];
    for (var row in data) {
      arrayData.push(data[row][variable]);
    }
    return arrayData
  }

  update_chart(dataTemp, dataPh) {

    this.temperatureChartOptions.series[0] = {
      name: "Temperature",
      type: 'spline',
      data: dataTemp
    }
    this.temperatureChartOptions.yAxis = {
      max: Math.max.apply(Math, dataTemp) + 5,
      min: Math.min.apply(Math, dataTemp) - 5,
    }

    this.pHChartOptions.series[0] = {
      name: "pH",
      type: 'spline',
      data: dataPh
    }
    this.pHChartOptions.yAxis = {
      max: Math.max.apply(Math, dataPh) + 5,
      min: Math.min.apply(Math, dataPh) - 5,
    }

    this.updateFlag = true;
  }
}
