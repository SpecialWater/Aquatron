import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class ChartComponent implements OnInit, OnDestroy {
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
      type: 'datetime',
      labels: {
        formatter: function() {
          return Highcharts.dateFormat('%H:%M', (this.value - 3600 * 6 * 1000));
        },
        step: 1,

      },
      maxPadding:0.015,
      minPadding:0.015,
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
  };

  pHChartOptions: Highcharts.Options = {
    series: [
      {
      data: [],
      name: "pH",
      type: 'spline',
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
      type: 'datetime',
      labels: {
        formatter: function() {
          return Highcharts.dateFormat('%H:%M', (this.value - 3600 * 6 * 1000));
        },
        step: 1,

      },
      maxPadding:0.015,
      minPadding:0.015,
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
  };

  chartOptions = [
    { chartConfig: this.temperatureChartOptions },
    { chartConfig: this.pHChartOptions },
  ];

  subscriptionState: Subscription;

  constructor(
    private stateService: StateService,
  ) { }

  ngOnInit(): void {

    this.subscriptionState = timer(0, 60000).pipe(
      switchMap(() => this.stateService.getState(this.minutes))
      ).subscribe(result => {
        var dataTemperature = this.parse_data(result, 'Temperature');
        var dataPH = this.parse_data(result, 'pH');
        this.update_chart(dataTemperature, dataPH);

      });

  }

  ngOnDestroy() {
    this.subscriptionState.unsubscribe();
  }


  parse_data(data, variable) {
    var arrayData = [];
    var minVal = 999;
    var maxVal = 0;

    for (var row in data) {
      arrayData.push([Date.parse(data[row]["id"]), data[row][variable]]);
      if(data[row][variable] > maxVal){
        maxVal = data[row][variable]
      }
      if(data[row][variable] < minVal){
        minVal = data[row][variable]
      }
    }
    return [arrayData, minVal, maxVal]
  }

  update_chart(dataTemp, dataPh) {
    console.log(dataTemp)
    this.temperatureChartOptions.series[0] = {
      name: "Temperature",
      type: 'spline',
      data: dataTemp[0],
    }
    this.temperatureChartOptions.yAxis = {
      max: dataTemp[2] + 5,
      min: dataTemp[1] - 5,
    }

    this.pHChartOptions.series[0] = {
      name: "pH",
      type: 'spline',
      data: dataPh[0],
    }
    this.pHChartOptions.yAxis = {
      max: dataPh[2] + 0.5,
      min: dataPh[1] - 0.5,
    }

    this.updateFlag = true;
  }
}
