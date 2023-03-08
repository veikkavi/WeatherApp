import { Component, OnInit } from '@angular/core';
import { ChartType } from 'angular-google-charts';
import { WeatherItem } from '../interfaces/weather-interfaces';
import { WeatherService } from '../services/weather.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-weather-report',
  templateUrl: './weather-report.component.html',
  styleUrls: ['./weather-report.component.css']
})
export class WeatherReportComponent implements OnInit{
  city: string = '';
  selectedChart: number = 0;

  // chart settings
  calendarType: ChartType = ChartType.Calendar;
  areaType: ChartType = ChartType.AreaChart;
  temperatureData!: any;
  rainData!: any;
  windData!: any;
  weatherData!: any;
  temperatureColumns = ['Date', 'Temperature'];
  temperatureOptions = {
    colorAxis: {
      minValue: -35,
      maxValue: 35,
      colors: ['#186df5', '#ffffff', '#9e0f05'],
      values: [-35, 0 , 35]
    }
  };
  rainColumns = ['Date', 'Rain'];
  rainOptions = {
    colorAxis: {
      minValue: -0,
      maxValue: 10,
      colors: ['#ffffff', '#186df5'],
      values: [0, 100]
    }
  };
  windColumns = ['Date', 'Wind'];
  windOptions = {
    colorAxis: {
      minValue: 0,
      maxValue: 10,
      colors: ['#ffffff', '#186df5'],
      values: [0, 10]
    }
  };
  weatherColumns = ['Date', 'Temperature', 'Rain', 'Wind'];
  weatherOptions = {
  };
  width = 1000;
  height = 200;

  constructor(private weatherService: WeatherService) { }

  ngOnInit() {

    // subscribe data source
    this.weatherService.currentWeatherReport.subscribe(result => {
      this.temperatureData = [];
      this.windData = [];
      this.rainData = [];
      this.weatherData = [];
      // push data to arrays
      for (let row in result) {
        var date = new Date(result[row].date);
        this.temperatureData.push([
          date,
          result[row].temperature
        ]);
        this.rainData.push([
          date,
          result[row].rain
        ]);
        this.windData.push([
          date,
          result[row].wind
        ]);
        this.weatherData.push([
          date,
          result[row].temperature,
          result[row].rain,
          result[row].wind
        ]);
      }
    });

    // update data when filter submits
    this.weatherService.currentFilter.subscribe(filter => {
      this.weatherService.loadWeatherReport();
      console.log(filter);
      this.city = filter.city?.name;
    });
  }
 
}
