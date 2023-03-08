import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable, ReplaySubject, Subject } from 'rxjs';
import { City, SortAndPagination, WeatherFilter, WeatherItem } from '../interfaces/weather-interfaces';

@Injectable({
  providedIn: 'root'
})
export class WeatherService{

  currentWeatherFormId: number = -1;  
  dataLength: number = 0;
  defaultSortAndPagination: SortAndPagination = {
    activeSort: 'date',
    sortDirection: 'asc',
    pageIndex: 0,
    pageSize: 10
  };

  drawerToggleSubject = new BehaviorSubject<boolean>(false);
  private weatherFormSubject = new ReplaySubject<WeatherItem | null>(1);
  private weatherFilterSubject = new BehaviorSubject<any>([]);
  private citiesSubject = new ReplaySubject<City[]>(1);
  private sortAndPaginationSubject = new BehaviorSubject(this.defaultSortAndPagination);
  private dataLengthSubject = new BehaviorSubject(this.dataLength);
  private weatherTablePageSubject = new BehaviorSubject<WeatherItem[]>([]);
  private weatherReportSubject = new ReplaySubject<WeatherItem[]>(1);

  drawerOpened = this.drawerToggleSubject.asObservable();
  currentWeatherForm = this.weatherFormSubject.asObservable();
  currentWeatherTablePage = this.weatherTablePageSubject.asObservable();
  currentFilter = this.weatherFilterSubject.asObservable();
  currentCities = this.citiesSubject.asObservable();
  currentSortAndPagination = this.citiesSubject.asObservable();
  currentDataLength = this.dataLengthSubject.asObservable();
  currentWeatherReport = this.weatherReportSubject.asObservable();

  constructor(private http: HttpClient) { }

  toggleDrawer() {
    this.drawerToggleSubject.next(!this.drawerToggleSubject.getValue());
  }

  editWeatherForm(weatherId: number) {
    // get weather item to edit 
    this.getWeatherItem(weatherId).subscribe(weather => {

      // open drawer if closed
      if (!this.drawerToggleSubject.getValue()) {
        this.toggleDrawer();
      }
      // close edit form if weather is already there
      else if(weather.id == this.currentWeatherFormId) {
        this.toggleDrawer();
      }

      // set current weather 
      this.currentWeatherFormId = weather.id;
      this.weatherFormSubject.next(weather)
    });
  }

  createNewWeather() {

    // toggle drawer and empty weatherform
    if (!this.drawerToggleSubject.getValue() || this.currentWeatherFormId == -1) {
      this.toggleDrawer();
    }
    this.weatherFormSubject.next(null);
    this.currentWeatherFormId = -1
  }

  setFilter(filterForm: WeatherFilter) {
    this.weatherFilterSubject.next(filterForm);
  }

  setSortAndPagination(sortAndPagination: SortAndPagination) {
    this.sortAndPaginationSubject.next(sortAndPagination);
  }

  submitWeatherForm(weatherItem: WeatherItem, action: string) {
    if (action == "Create") {
      this.createWeatherItem(weatherItem)
        .subscribe(() => this.loadWeatherTable())
    }
    else if (action == "Edit") {
      this.updateWeatherItem(weatherItem)
        .subscribe(() => { this.loadWeatherTable(); })
    }
  }

  loadWeatherTable() {

    var weatherFilter = this.weatherFilterSubject.getValue();
    // empty table if filter is not set
    if (weatherFilter?.city?.id == null ||
      weatherFilter?.startDate == null ||
      weatherFilter?.endDate == null)
    {
      this.weatherTablePageSubject.next([]);
      return;
    }

    // get paginated weather items, cities and count 
    forkJoin({
      weatherItems: this.getWeatherPage(weatherFilter, this.sortAndPaginationSubject.getValue()),
      cities: this.getCities(),
      count: this.getWeatherItemsCount(weatherFilter)
    })
      // map city to weather item
      .subscribe(({ weatherItems, cities, count }) => {
        weatherItems.map(weather => {
          weather.city = cities.find((city) => city.id === weather.cityId);
        });
        this.weatherTablePageSubject.next(weatherItems);
        this.dataLengthSubject.next(count);
      });
  }

  // load weather items for report
  loadWeatherReport() {
    this.getWeatherItems(this.weatherFilterSubject.getValue()).subscribe(items => this.weatherReportSubject.next(items));
  }

  loadCities() {
    this.getCities().subscribe(cities => this.citiesSubject.next(cities));
  }

  ///
  ///Api calls
  ///
  getWeatherPage(weatherFilter: WeatherFilter, sortAndPagination: SortAndPagination): Observable<WeatherItem[]> {
    // If no active sorting, use default values
    if (sortAndPagination?.sortDirection == '') {
      sortAndPagination.sortDirection = 'asc';
      sortAndPagination.activeSort = 'date';
    }
    return this.http.get<WeatherItem[]>('api/weather/filtered', {
      params: new HttpParams()
        .set('startDate', weatherFilter.startDate!.toISOString())
        .set('endDate', weatherFilter.endDate!.toISOString())
        .set('cityId', weatherFilter.city.id.toString())
        .set('sortColumn', sortAndPagination.activeSort)
        .set('sortOrder', sortAndPagination.sortDirection)
        .set('pageNumber', sortAndPagination.pageIndex.toString())
        .set('pageSize', sortAndPagination.pageSize.toString())
    });
  }

  getWeatherItems(weatherFilter: WeatherFilter): Observable<WeatherItem[]> {

    return this.http.get<WeatherItem[]>('api/weather', {
      params: new HttpParams()
        .set('startDate', weatherFilter.startDate!.toISOString())
        .set('endDate', weatherFilter.endDate!.toISOString())
        .set('cityId', weatherFilter.city.id.toString())
    });
  }

  getWeatherItem(id: number) {
    return this.http.get<WeatherItem>('api/weather/' + id);
  }

  getCities(): Observable<City[]>{
    return this.http.get<City[]>('api/city');
  }

  getWeatherItemsCount(weatherFilter: WeatherFilter): Observable<number> {
    return this.http.get<number>('api/weather/count', {
      params: new HttpParams()
        .set('startDate', weatherFilter.startDate!.toISOString())
        .set('endDate', weatherFilter.endDate!.toISOString())
        .set('cityId', weatherFilter.city.id.toString())
    });
  }

  createWeatherItem(weatherItem: WeatherItem) {
    weatherItem.id = 0;
    return this.http.post('api/weather', weatherItem);
  }

  updateWeatherItem(weatherItem: WeatherItem) {
    console.log(weatherItem);
    return this.http.put('api/weather/' + weatherItem.id, weatherItem);
  }

  deleteWeatherItem(id: number): Observable<any> {
    return this.http.delete('api/weather/' + id);
  }

  seedData() {
    var weatherFilter = this.weatherFilterSubject.getValue();
    return this.http.get<number>('api/weather/seed', {
      params: new HttpParams()
        .set('startDate', weatherFilter.startDate!.toISOString())
        .set('endDate', weatherFilter.endDate!.toISOString())
        .set('cityId', weatherFilter.city.id)
    });
  }

}
