import { Component, OnInit, OnDestroy } from '@angular/core';
import { StateService } from './../state.service'
import { Subscription, timer } from 'rxjs';
import { max, switchMap } from 'rxjs/operators';
import * as moment from 'moment';
import * as io from 'socket.io-client';

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
  private socketio: SocketIOClient.Socket;

  updateCounter: number = 0;
  urlLocal = 'http://127.0.0.1:5000';
  urlVm = 'http://192.168.179.121:5000';
  urlCloud = 'https://pruetpiflask.azurewebsites.net';

  url = this.urlVm;

  minutes = 120
  Highcharts: typeof Highcharts = Highcharts; // required

  dataTemperature = <any>[];
  dataPh = <any>[];

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
    this.connect();
    this.setReceiveLoginMethod();
    this.setReceiveDataMethod();

    // this.subscriptionState = timer(0, 60000).pipe(
    //   switchMap(() => this.stateService.getState(this.minutes))
    //   ).subscribe(result => {
    //     var dataTemperature = this.parse_data(result, 'Temperature');
    //     var dataPH = this.parse_data(result, 'pH');
    //     this.update_chart(dataTemperature, dataPH);
    //   });

    this.stateService.getState(this.minutes)
      .subscribe(result => {
        this.dataTemperature = this.parse_db_data(result, 'Temperature');
        this.dataPh = this.parse_db_data(result, 'pH');

        this.temperatureChartOptions = this.update_chart(this.temperatureChartOptions,
          "Temperature",
          this.dataTemperature,
          5,
          5);

        this.pHChartOptions = this.update_chart(this.pHChartOptions,
          "pH",
          this.dataPh,
          0.5,
          0.5);

        this.updateFlag = true;

      });
  }

  ngOnDestroy() {
    this.subscriptionState.unsubscribe();
  }



  parse_db_data(data, variable) {
    console.log(data)
    var arrayData = [];
    var minVal = 999;
    var maxVal = 0;

    for (var row in data) {
      arrayData.push([Date.parse(data[row]["id"]), data[row][variable]]);
      if(data[row][variable] > maxVal){
        maxVal = data[row][variable]
      }
      // -99 is a temperature reading error
      if(data[row][variable] < minVal && data[row][variable] != -99){
        minVal = data[row][variable]
      }
    }

    return [arrayData, minVal, maxVal]
  }

  remove_old_data(data){
    for(var row in data[0]){
      if(1000 * this.minutes * 60 - (Date.now() - data[0][row][0]) < 0){
        data[0].splice(row, 1)
      }
    }
    return data

  }

  add_new_data(data, old_data, variable){

    old_data[0] = old_data[0].concat([[Date.parse(data[0]["id"]), data[0][variable]]]);

    if(data[0][variable] > old_data[2]){
      old_data[2] = data[0][variable]
    }
      // -99 is a temperature reading error
    if(data[0][variable] < old_data[1] && data[0][variable] != -99){
      old_data[1] = data[0][variable]
    }

    return old_data

  }

  update_chart(chart, chartTitle, data, yMaxVariation, yMinVaration) {
    chart.series[0] = {
      name: chartTitle,
      type: 'line',
      data: data[0],
    }
    chart.yAxis = {
      max: data[2] + yMaxVariation,
      min: data[1] - yMinVaration,
    }

    return chart


  }

  connect(){
    this.socketio = io(this.url);
  }

  setReceiveDataMethod() {
    this.socketio.on('update aquarium state', (data) => {
      if(this.dataTemperature != [] && this.dataPh != []){
        this.dataTemperature = this.remove_old_data(this.dataTemperature)
        this.dataPh = this.remove_old_data(this.dataPh)

        this.dataTemperature = this.add_new_data(data, this.dataTemperature, "Temperature")
        this.dataPh = this.add_new_data(data, this.dataPh, "pH")

        console.log(this.updateCounter)
        if (this.dataTemperature[0][this.dataTemperature[0].length - 1][1] != this.dataTemperature[0][this.dataTemperature[0].length - 2][1] ||
          this.dataPh[0][this.dataPh[0].length - 1][1] != this.dataPh[0][this.dataPh[0].length - 2][1] ||
          this.updateCounter > 100){

            this.temperatureChartOptions = this.update_chart(this.temperatureChartOptions,
              "Temperature",
              this.dataTemperature,
              5,
              5);

            this.pHChartOptions = this.update_chart(this.pHChartOptions,
              "pH",
              this.dataPh,
              0.5,
              0.5);

            this.updateFlag = true;
            this.updateCounter = 0;
        } else {
          this.updateCounter += 1;
        }
        this.updateFlag = true;
        }


        // this.conversation.push(data)
    });
  }

  setReceiveLoginMethod() {
    this.socketio.on('login response', (data) => {
      console.log(data);
    });
  }


}
