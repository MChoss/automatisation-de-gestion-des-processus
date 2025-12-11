import { type ComponentFixture, TestBed } from "@angular/core/testing"
import { ProjectDetailComponent } from './projet-detail.component';


describe("ProjectDetailComponent", () => {
    let component: ProjectDetailComponent
    let fixture: ComponentFixture<ProjectDetailComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ProjectDetailComponent],
        }).compileComponents()

        fixture = TestBed.createComponent(ProjectDetailComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it("should create", () => {
        expect(component).toBeTruthy()
    })
})
