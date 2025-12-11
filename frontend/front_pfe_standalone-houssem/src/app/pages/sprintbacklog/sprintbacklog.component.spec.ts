import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SprintbacklogComponent } from './sprintbacklog.component';

describe('SprintbacklogComponent', () => {
  let component: SprintbacklogComponent;
  let fixture: ComponentFixture<SprintbacklogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SprintbacklogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SprintbacklogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
