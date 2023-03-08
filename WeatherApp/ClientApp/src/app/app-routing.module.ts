import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WeatherReportComponent } from './weather-report/weather-report.component';
import { WeatherTableComponent } from './weather-table/weather-table.component';

const routes: Routes = [
  { path: '', component: WeatherTableComponent },
  { path: 'weather', component: WeatherTableComponent },
  { path: 'report', component: WeatherReportComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
