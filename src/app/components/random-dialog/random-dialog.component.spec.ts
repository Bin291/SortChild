import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RandomDialogComponent } from './random-dialog.component';

describe('RandomDialogComponent', () => {
  let component: RandomDialogComponent;
  let fixture: ComponentFixture<RandomDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RandomDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RandomDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
