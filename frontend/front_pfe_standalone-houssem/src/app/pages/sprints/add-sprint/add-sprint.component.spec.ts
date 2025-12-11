import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSprintComponent } from './add-sprint.component';

describe('AddSprintComponent', () => {
  let component: AddSprintComponent;
  let fixture: ComponentFixture<AddSprintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSprintComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddSprintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
