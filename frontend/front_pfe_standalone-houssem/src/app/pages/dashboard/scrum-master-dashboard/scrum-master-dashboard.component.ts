import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { AppScrumMasterSidebar } from "../../../layout/component/app.scrum-master-sidebar"

@Component({
  selector: "app-scrum-master-dashboard",
  standalone: true,
  imports: [CommonModule, RouterModule, AppScrumMasterSidebar],
  template: `
    <app-scrum-master-sidebar></app-scrum-master-sidebar>
    <router-outlet></router-outlet>
  `,
})
export class ScrumMasterDashboardComponent {}
