import { Component } from '@angular/core';
import { WeatherService } from '../services/weather.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent {
  constructor(private weatherService: WeatherService) { }
  activeLink = 'weather';
  drawerOpened: boolean = false;
  selectedMessage: any;

  // subscribe to open and close drawer
  ngOnInit() {
    this.weatherService.drawerOpened.subscribe(opened => this.drawerOpened = opened);
  }
}
