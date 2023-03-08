export interface WeatherItem {
  id: number;
  date: Date;
  temperature: number;
  rain: number;
  wind: number;
  cityId: number | undefined;
  city: City | undefined;
  edit: any;
}

export interface City {
  id: number;
  name: string;
}

export interface WeatherFilter {
  startDate: Date | null | undefined;
  endDate: Date | null | undefined;
  city: City;
}

export interface SortAndPagination {
  activeSort: string;
  sortDirection: string;
  pageIndex: number;
  pageSize: number;
}
