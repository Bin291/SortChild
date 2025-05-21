import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SortVisualizationComponent } from './sort-visualization.component';

describe('SortVisualizationComponent', () => {
  let component: SortVisualizationComponent;
  let fixture: ComponentFixture<SortVisualizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SortVisualizationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SortVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
