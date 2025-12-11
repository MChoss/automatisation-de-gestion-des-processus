import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllUserstoriesComponent } from './all-userstories.component';

describe('AllUserstoriesComponent', () => {
  let component: AllUserstoriesComponent;
  let fixture: ComponentFixture<AllUserstoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllUserstoriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllUserstoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
