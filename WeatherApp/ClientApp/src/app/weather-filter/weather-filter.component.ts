import { AfterViewInit, Component, OnChanges, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { map, Observable, startWith } from 'rxjs';
import { City, WeatherFilter } from '../interfaces/weather-interfaces';
import { WeatherService } from '../services/weather.service';

@Component({
  selector: 'app-weather-filter',
  templateUrl: './weather-filter.component.html',
  styleUrls: ['./weather-filter.component.css']
})
export class WeatherFilterComponent implements OnInit{
  cities: City[] = [];
  filteredCities!: Observable<City[]>;
  modified: boolean = false;
  filterForm = new FormGroup({
    start: new FormControl(new Date('2022-01-01')),
    end: new FormControl(new Date('2022-12-31')),
    city: new FormControl()
  });

  constructor(private weatherService: WeatherService) {}

  ngOnInit() {
    // load cities
    this.weatherService.loadCities();

    // subscribe and set first city as default
    this.weatherService.currentCities.subscribe(cities => {
      this.cities = cities;
      this.filterForm.controls.city.setValue(cities[0]);
      this.submitFilter();
    })

    // add filter to city input
    this.filteredCities = this.filterForm.controls.city.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this.filter(name as string) : this.cities.slice();
      }),
    );

    // set modified tag for search button color
    this.filterForm.valueChanges.subscribe(value => {
      this.modified = true
    });
  }

  // set current filter to weather service 
  submitFilter() {   
    this.weatherService.setFilter({
      startDate: this.filterForm.value.start,
      endDate: this.filterForm.value.end,
      city: this.filterForm.value.city
    });
    this.weatherService.loadWeatherTable();
    this.modified = false;
  }

  // seed weatherdata for current filter
  seedData() {
    this.weatherService.setFilter({
      startDate: this.filterForm.value.start,
      endDate: this.filterForm.value.end,
      city: this.filterForm.value.city
    });
    this.weatherService.seedData().subscribe((result) => {
      console.log(result);
      this.weatherService.loadWeatherTable();
    });
    this.modified = false;
  }

  displayFn(city: City | null | undefined): string {
    return city && city.name ? city.name : '';
  }

  private filter(name: string): City[] {
    const filterValue = name.toLowerCase();

    return this.cities.filter(city => city.name.toLowerCase().includes(filterValue));
  }

  get currentyear() { return new Date().getFullYear() }
}
  


