import { type ComponentFixture, TestBed } from "@angular/core/testing"
import { BacklogItemsComponent } from "./backlogitems.component"


describe("BacklogItemsComponent", () => {
  let component: BacklogItemsComponent
  let fixture: ComponentFixture<BacklogItemsComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BacklogItemsComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(BacklogItemsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it("should create", () => {
    expect(component).toBeTruthy()
  })
})
