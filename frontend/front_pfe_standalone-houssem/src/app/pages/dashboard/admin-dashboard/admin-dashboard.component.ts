import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ChartModule } from "primeng/chart"
import { CardModule } from "primeng/card"
import { ButtonModule } from "primeng/button"
import { TableModule } from "primeng/table"
import { TagModule } from "primeng/tag"
import  { Router } from "@angular/router"
import  { UserManagementService } from "../../../services/services/user-management.service"
import  { ProjetService } from "../../../services/services/projet.service"
import type { UserResponse } from "../../../services/models/user-response"
import type { ProjetResponse } from "../../../services/models/projet-response"

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  imports: [CommonModule, ChartModule, CardModule, ButtonModule, TableModule, TagModule],
  template: `
    <div class="admin-dashboard-container">
      <!-- System Administration Navigation replacing sidebar -->
      
      <div class="grid grid-cols-12 gap-6">
        <!-- Enhanced Statistics Cards with more vibrant colors and better styling -->
        <div class="col-span-12 lg:col-span-3">
          <div class="card mb-0 shadow-lg" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none;">
            <div class="flex justify-between items-center">
              <div>
                <span class="block text-white/90 font-medium mb-2 text-sm uppercase tracking-wide">Total Users</span>
                <div class="text-white font-bold text-3xl">{{ totalUsers }}</div>
              </div>
              <div class="flex items-center justify-center rounded-xl shadow-lg" style="width: 3.5rem; height: 3.5rem; background: rgba(255, 255, 255, 0.25);">
                <i class="pi pi-users text-white text-2xl"></i>
              </div>
            </div>
            <div class="mt-4">
              <span class="text-white/80 font-medium">{{ activeUsers }} active users</span>
            </div>
          </div>
        </div>

        <div class="col-span-12 lg:col-span-3">
          <div class="card mb-0 shadow-lg" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border: none;">
            <div class="flex justify-between items-center">
              <div>
                <span class="block text-white/90 font-medium mb-2 text-sm uppercase tracking-wide">Total Projects</span>
                <div class="text-white font-bold text-3xl">{{ totalProjects }}</div>
              </div>
              <div class="flex items-center justify-center rounded-xl shadow-lg" style="width: 3.5rem; height: 3.5rem; background: rgba(255, 255, 255, 0.25);">
                <i class="pi pi-briefcase text-white text-2xl"></i>
              </div>
            </div>
            <div class="mt-4">
              <span class="text-white/80 font-medium">{{ activeProjects }} active projects</span>
            </div>
          </div>
        </div>

        <div class="col-span-12 lg:col-span-3">
          <div class="card mb-0 shadow-lg" style="background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%); border: none;">
            <div class="flex justify-between items-center">
              <div>
                <span class="block text-white/90 font-medium mb-2 text-sm uppercase tracking-wide">System Health</span>
                <div class="text-white font-bold text-3xl">{{ systemHealth }}%</div>
              </div>
              <div class="flex items-center justify-center rounded-xl shadow-lg" style="width: 3.5rem; height: 3.5rem; background: rgba(255, 255, 255, 0.25);">
                <i class="pi pi-chart-line text-white text-2xl"></i>
              </div>
            </div>
            <div class="mt-4">
              <span class="text-white/80 font-medium">All systems operational</span>
            </div>
          </div>
        </div>

        <div class="col-span-12 lg:col-span-3">
          <div class="card mb-0 shadow-lg" style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); border: none;">
            <div class="flex justify-between items-center">
              <div>
                <span class="block text-white/90 font-medium mb-2 text-sm uppercase tracking-wide">Storage Used</span>
                <div class="text-white font-bold text-3xl">{{ storageUsed }}GB</div>
              </div>
              <div class="flex items-center justify-center rounded-xl shadow-lg" style="width: 3.5rem; height: 3.5rem; background: rgba(255, 255, 255, 0.25);">
                <i class="pi pi-database text-white text-2xl"></i>
              </div>
            </div>
            <div class="mt-4">
              <span class="text-white/80 font-medium">{{ storagePercentage }}% of total</span>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="col-span-12 lg:col-span-8">
          <div class="card">
            <h5 class="text-xl font-semibold mb-4">User Registration Trends</h5>
            <p-chart type="line" [data]="userRegistrationData" [options]="chartOptions" class="h-80"></p-chart>
          </div>
        </div>

        <div class="col-span-12 lg:col-span-4">
          <div class="card">
            <h5 class="text-xl font-semibold mb-4">Project Status Distribution</h5>
            <p-chart type="doughnut" [data]="projectStatusData" [options]="doughnutOptions" class="h-80"></p-chart>
          </div>
        </div>

        <!-- Recent Users Table -->
        <div class="col-span-12 lg:col-span-6">
          <div class="card">
            <h5 class="text-xl font-semibold mb-4">Recent Users</h5>
            <p-table [value]="recentUsers" [paginator]="true" [rows]="5" [showCurrentPageReport]="true">
              <ng-template pTemplate="header">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-user>
                <tr>
                  <td>{{ user.firstname }} {{ user.lastname }}</td>
                  <td>{{ user.email }}</td>
                  <td>
                    <p-tag [value]="user.roles?.[0]?.name || 'No Role'" 
                           [severity]="getRoleSeverity(user.roles?.[0]?.name)"></p-tag>
                  </td>
                  <td>
                    <p-tag [value]="user.enabled ? 'Active' : 'Inactive'" 
                           [severity]="user.enabled ? 'success' : 'danger'"></p-tag>
                  </td>
                  <td>
                    <p-button icon="pi pi-pencil" class="p-button-text p-button-sm" 
                             (click)="editUser(user)" pTooltip="Edit User"></p-button>
                    <p-button icon="pi pi-lock" class="p-button-text p-button-sm" 
                             (click)="toggleUserLock(user)" pTooltip="Toggle Lock"></p-button>
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </div>
        </div>

        <!-- Recent Projects Table -->
        <div class="col-span-12 lg:col-span-6">
          <div class="card">
            <h5 class="text-xl font-semibold mb-4">Recent Projects</h5>
            <p-table [value]="recentProjects" [paginator]="true" [rows]="5" [showCurrentPageReport]="true">
              <ng-template pTemplate="header">
                <tr>
                  <th>Project Name</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-project>
                <tr>
                  <td>{{ project.nom }}</td>
                  <td>{{ project.owner?.firstname }} {{ project.owner?.lastname }}</td>
                  <td>
                    <p-tag [value]="project.actif ? 'Active' : 'Inactive'" 
                           [severity]="project.actif ? 'success' : 'danger'"></p-tag>
                  </td>
                  <td>{{ project.dateCreation | date:'short' }}</td>
                  <td>
                    <p-button icon="pi pi-eye" class="p-button-text p-button-sm" 
                             (click)="viewProject(project)" pTooltip="View Project"></p-button>
                    <p-button icon="pi pi-cog" class="p-button-text p-button-sm" 
                             (click)="manageProject(project)" pTooltip="Manage Project"></p-button>
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .admin-dashboard-container {
      padding: 1rem;
    }
  `,
  ],
})
export class AdminDashboardComponent implements OnInit {
  totalUsers = 0
  activeUsers = 0
  totalProjects = 0
  activeProjects = 0
  systemHealth = 98
  storageUsed = 45.2
  storagePercentage = 67

  recentUsers: UserResponse[] = []
  recentProjects: ProjetResponse[] = []

  userRegistrationData: any
  projectStatusData: any
  chartOptions: any
  doughnutOptions: any

  constructor(
    private userService: UserManagementService,
    private projectService: ProjetService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadDashboardData()
    this.initializeCharts()
  }

  loadDashboardData() {
    // Load users data
    this.userService.findAllUsers({ page: 0, size: 10 }).subscribe({
      next: (response) => {
        this.totalUsers = response.totalElements || 0
        this.activeUsers = response.content?.filter((user) => user.enabled).length || 0
        this.recentUsers = response.content?.slice(0, 5) || []
      },
      error: (error) => console.error("Error loading users:", error),
    })

    // Load projects data
    this.projectService.findAllProjets({ page: 0 }).subscribe({
      next: (response) => {
        this.totalProjects = response.totalElements || 0
        this.activeProjects = response.content?.filter((project) => project.actif).length || 0
        this.recentProjects = response.content?.slice(0, 5) || []
      },
      error: (error) => console.error("Error loading projects:", error),
    })
  }

  initializeCharts() {
    const documentStyle = getComputedStyle(document.documentElement)
    const textColor = documentStyle.getPropertyValue("--text-color")
    const borderColor = documentStyle.getPropertyValue("--surface-border")

    // User Registration Trends Chart
    this.userRegistrationData = {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          label: "New Users",
          data: [12, 19, 15, 25, 22, 30],
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    }

    // Project Status Distribution Chart
    this.projectStatusData = {
      labels: ["Active", "Completed", "On Hold", "Cancelled"],
      datasets: [
        {
          data: [65, 25, 8, 2],
          backgroundColor: [
            "#10b981", // green for Active
            "#3b82f6", // blue for Completed
            "#f59e0b", // amber for On Hold
            "#ef4444", // red for Cancelled
          ],
          borderWidth: 0,
        },
      ],
    }

    this.chartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: textColor,
          },
          grid: {
            color: borderColor,
          },
        },
        y: {
          ticks: {
            color: textColor,
          },
          grid: {
            color: borderColor,
          },
        },
      },
    }

    this.doughnutOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
    }
  }

  getRoleSeverity(role: string): string {
    switch (role?.toLowerCase()) {
      case "admin":
        return "danger"
      case "product_owner":
        return "warning"
      case "scrum_master":
        return "info"
      default:
        return "secondary"
    }
  }

  editUser(user: UserResponse) {
    // Navigate to user edit page
    console.log("Edit user:", user)
  }

  toggleUserLock(user: UserResponse) {
    this.userService.toggleUserLock({ "user-id": user.id! }).subscribe({
      next: () => {
        this.loadDashboardData()
      },
      error: (error) => console.error("Error toggling user lock:", error),
    })
  }

  viewProject(project: ProjetResponse) {
    // Navigate to project details
    console.log("View project:", project)
  }

  manageProject(project: ProjetResponse) {
    // Navigate to project management
    console.log("Manage project:", project)
  }

  navigateToUsers() {
    this.router.navigate(["/dashboard/users"])
  }

  navigateToProjects() {
    this.router.navigate(["/dashboard/projects"])
  }

  navigateToNotifications() {
    this.router.navigate(["/dashboard/notifications"])
  }

  navigateToMeetings() {
    this.router.navigate(["/dashboard/meetings"])
  }

  navigateToStats() {
    this.router.navigate(["/dashboard/stats"])
  }

  openSystemSettings() {
    console.log("Open system settings")
  }

  initiateBackup() {
    console.log("Initiate backup")
  }

  viewSystemLogs() {
    console.log("View system logs")
  }

  generateReport() {
    console.log("Generate report")
  }
}
