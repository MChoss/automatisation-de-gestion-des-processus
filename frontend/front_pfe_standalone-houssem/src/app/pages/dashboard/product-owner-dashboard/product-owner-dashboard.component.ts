import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { AppProductOwnerSidebar } from "../../../layout/component/app.product-owner-sidebar"

@Component({
  selector: "app-product-owner-dashboard",
  standalone: true,
  imports: [CommonModule, RouterModule, AppProductOwnerSidebar],
  template: `
    <app-product-owner-sidebar></app-product-owner-sidebar>
    <router-outlet></router-outlet>
  `,
})
export class ProductOwnerDashboardComponent {}
