import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SortingChartComponent } from './sorting-chart.component';

describe('SortingChartComponent', () => {
  let component: SortingChartComponent;
  let fixture: ComponentFixture<SortingChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SortingChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SortingChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
