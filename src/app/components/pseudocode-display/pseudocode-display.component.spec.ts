import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PseudocodeDisplayComponent } from './pseudocode-display.component';

describe('PseudocodeDisplayComponent', () => {
  let component: PseudocodeDisplayComponent;
  let fixture: ComponentFixture<PseudocodeDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PseudocodeDisplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PseudocodeDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
