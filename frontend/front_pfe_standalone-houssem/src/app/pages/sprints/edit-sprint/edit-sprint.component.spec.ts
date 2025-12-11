import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSprintComponent } from './edit-sprint.component';

describe('EditSprintComponent', () => {
  let component: EditSprintComponent;
  let fixture: ComponentFixture<EditSprintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditSprintComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditSprintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
