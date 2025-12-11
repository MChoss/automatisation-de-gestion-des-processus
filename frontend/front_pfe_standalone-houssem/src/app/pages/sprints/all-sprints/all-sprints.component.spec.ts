import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllSprintsComponent } from './all-sprints.component';

describe('AllSprintsComponent', () => {
  let component: AllSprintsComponent;
  let fixture: ComponentFixture<AllSprintsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllSprintsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllSprintsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
