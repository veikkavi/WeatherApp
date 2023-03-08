import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherFilterComponent } from './weather-filter.component';

describe('WeatherFilterComponent', () => {
  let component: WeatherFilterComponent;
  let fixture: ComponentFixture<WeatherFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WeatherFilterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeatherFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
