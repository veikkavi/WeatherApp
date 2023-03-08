import { AfterViewInit, Component, OnChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { merge, tap } from 'rxjs';
import { WeatherFilter, WeatherItem } from '../interfaces/weather-interfaces';
import { WeatherService } from '../services/weather.service';

@Component({
  selector: 'app-weather-table',
  templateUrl: './weather-table.component.html',
  styleUrls: ['./weather-table.component.css']
})
export class WeatherTableComponent implements AfterViewInit{
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<WeatherItem>;
  dataSource: WeatherItem[] = [];
  dataLength: number = 0;
  displayedColumns = ['date', 'temperature', 'rain', 'wind', 'city', 'edit'];

  constructor(private weatherService: WeatherService) { }

  ngAfterViewInit() {

    // subscribe weather data
    this.weatherService.currentWeatherTablePage.subscribe(data => this.dataSource = data);

    // subscribe data length
    this.weatherService.currentDataLength.subscribe(length => this.dataLength = length);

    // reset the paginator after sorting
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    // load table when sorting or page changes
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.loadWeatherTable())
      ).subscribe();

  }

  // sets current sorting and pagination and loads weather table
  loadWeatherTable() {
    this.weatherService.setSortAndPagination({
      sortDirection: this.sort.direction,
      activeSort: this.sort.active,
      pageIndex: this.paginator.pageIndex,
      pageSize: this.paginator.pageSize
    })
    this.weatherService.loadWeatherTable();
  }

  editRow(rowId:number) {
    this.weatherService.editWeatherForm(rowId)
  }

  deleteRow(rowId: number) {
    this.weatherService.deleteWeatherItem(rowId).subscribe(() => {
      this.weatherService.loadWeatherTable();
      if (this.weatherService.drawerToggleSubject.getValue()) {
        this.weatherService.toggleDrawer();
      }

    });
    
  }

  createRow() {
    this.weatherService.createNewWeather();
  }
}
