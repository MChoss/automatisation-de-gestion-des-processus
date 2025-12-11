import { Component, type OnInit } from "@angular/core"
import  { Router } from "@angular/router"
import  { AuthService } from "../../services/auth.service"

@Component({
  selector: "app-dashboard-router",
  template: `
        <div class="flex items-center justify-center min-h-screen">
            <div class="text-center">
                <i class="pi pi-spin pi-spinner text-4xl text-primary mb-4"></i>
                <p class="text-lg text-muted-color">Redirecting to your dashboard...</p>
            </div>
        </div>
    `,
})
export class DashboardRouterComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    const dashboardRoute = this.authService.getDashboardRoute()
    this.router.navigate([dashboardRoute])
  }
}
