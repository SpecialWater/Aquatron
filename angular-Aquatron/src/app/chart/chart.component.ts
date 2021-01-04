import { Component, OnInit } from '@angular/core';
import { StateService } from './../state.service'
import { Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import * as Highcharts from "highcharts";


@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {
  minutes = '60'

  Highcharts: typeof Highcharts = Highcharts; // required

  chartConstructor: string = 'chart'; // optional string, defaults to 'chart'
  chart: Highcharts.Chart;

  chartOptions: Highcharts.Options = {
    series: [
      {
      data: [],
      name: "Temperature",
      type: 'spline'
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
    },
    yAxis: {
      title: {
        text: 'Temperature',
      },
    },
    legend: {
      enabled: false
    }
  }; // required
  updateFlag: boolean = false; // optional boolean
  oneToOneFlag: boolean = true; // optional boolean, defaults to false

  subscriptionState: Subscription;

  constructor(
    private stateService: StateService,
  ) { }

  ngOnInit(): void {

    this.subscriptionState = timer(0, 10000).pipe(
      switchMap(() => this.stateService.getState("Temperature", this.minutes))
      ).subscribe(result => {
        var data = this.parse_data(result);
        this.update_chart(data);
      });

    // this.subscriptionState = timer(0, 10000).pipe(
    //   switchMap(() => this.stateService.getState("pH", this.minutes))
    //   ).subscribe(result => {
    //     var data = this.parse_data(result);
    //     this.update_chart(data);
    //   });

  }


  parse_data(data) {
    var arrayData = [];
    for (var row in data) {
      arrayData.push(data[row]['Temperature']);
    }
    return arrayData
  }

  update_chart(data) {
    this.chartOptions.series[0] = {
      name: "Temperature",
      type: 'spline',
      data: data
    }
    this.updateFlag = true;
  }
}
