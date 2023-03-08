import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { City } from '../interfaces/weather-interfaces';
import { WeatherService } from '../services/weather.service';

@Component({
  selector: 'app-weather-form',
  templateUrl: './weather-form.component.html',
  styleUrls: ['./weather-form.component.css']
})
export class WeatherFormComponent implements OnInit{
  public title: string = "Edit";
  weatherForm: FormGroup;
  errorMessage: string = "";
  cities: City[] = [];

  constructor(private weatherService: WeatherService, private _fb: FormBuilder) { 

    this.weatherForm = this._fb.group({
      id: 0,
      date: ['', [Validators.required]],
      temperature: ['', [Validators.required]],
      rain: ['', [Validators.required]],
      wind: ['', [Validators.required]],
      cityId: ['', [Validators.required]]
    })
  }

  ngOnInit() {
    this.weatherService.currentWeatherForm.subscribe(weather => {
      // Open create form if weather is empty
      if (weather == null) {
        this.title = "Create";
        this.weatherForm.reset();
      } else {
        this.title = "Edit";
        this.weatherForm.setValue(weather);
      }
    });

    this.weatherService.currentCities.subscribe(cities => this.cities = cities);
  }

  save() {
    if (!this.weatherForm.valid) {
      return;
    }
    this.weatherService.submitWeatherForm(this.weatherForm.value, this.title);
  }

  cancel() {
    this.weatherService.toggleDrawer();
  }
}
