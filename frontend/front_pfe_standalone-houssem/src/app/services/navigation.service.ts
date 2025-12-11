import { Injectable } from "@angular/core"
import type { MenuItem } from "primeng/api"
import { AuthService } from "./auth.service"

@Injectable({
  providedIn: "root",
})
export class NavigationService {
  constructor(private authService: AuthService) {}

  getMenuItems(): MenuItem[] {
    const menuItems: MenuItem[] = []

    // Product Owner Menu: dashboard, my projects, product backlogs, meetings, stats, notifications
    if (this.authService.isProductOwner()) {
      menuItems.push(
        {
          label: "Dashboard",
          icon: "pi pi-fw pi-home",
          routerLink: [this.authService.getDashboardRoute()],
        },
        {
          label: "My Projects",
          icon: "pi pi-fw pi-briefcase",
          routerLink: ["/dashboard/my-projects"],
        },
        {
          label: "Product Backlogs",
          icon: "pi pi-fw pi-list",
          routerLink: ["/dashboard/product-backlogs"],
        },
        {
          label: "Meetings",
          icon: "pi pi-fw pi-calendar",
          routerLink: ["/meetings"],
        },
        {
          label: "Stats",
          icon: "pi pi-fw pi-chart-bar",
          routerLink: ["/stats"],
        },
        {
          label: "Notifications",
          icon: "pi pi-fw pi-bell",
          routerLink: ["/notifications"],
        },
      )
    }

    // Scrum Master Menu: dashboard, my projects, sprints, tasks, alerts, notifications, meetings, stats
    if (this.authService.isScrumMaster()) {
      menuItems.push(
        {
          label: "Dashboard",
          icon: "pi pi-fw pi-home",
          routerLink: [this.authService.getDashboardRoute()],
        },
        {
          label: "My Projects",
          icon: "pi pi-fw pi-briefcase",
          routerLink: ["/all_projects"],
        },
        {
          label: "Sprints",
          icon: "pi pi-fw pi-forward",
          routerLink: ["/all_sprints"],
        },
        {
          label: "Tasks",
          icon: "pi pi-fw pi-check-square",
          routerLink: ["/backlogitems"],
        },
        {
          label: "Alerts",
          icon: "pi pi-fw pi-exclamation-triangle",
          routerLink: ["/alerts"],
        },
        {
          label: "Notifications",
          icon: "pi pi-fw pi-bell",
          routerLink: ["/notifications"],
        },
        {
          label: "Meetings",
          icon: "pi pi-fw pi-calendar",
          routerLink: ["/meetings"],
        },
        {
          label: "Stats",
          icon: "pi pi-fw pi-chart-bar",
          routerLink: ["/stats"],
        },
      )
    }

    // System Administration Menu: dashboard, manage users, manage projects, notifications, meetings, stats, system settings, backup data, view logs, generate report
    if (this.authService.isAdmin()) {
      menuItems.push(
        {
          label: "Dashboard",
          icon: "pi pi-fw pi-home",
          routerLink: ["/dashboard/admin"],
        },
        {
          label: "Manage Users",
          icon: "pi pi-fw pi-users",
          routerLink: ["/dashboard/users"],
        },
        {
          label: "Manage Projects",
          icon: "pi pi-fw pi-briefcase",
          routerLink: ["/dashboard/projects"],
        },
        {
          label: "Notifications",
          icon: "pi pi-fw pi-bell",
          routerLink: ["/notifications"],
        },
        {
          label: "Meetings",
          icon: "pi pi-fw pi-calendar",
          routerLink: ["/meetings"],
        },
        {
          label: "Statistics",
          icon: "pi pi-fw pi-chart-bar",
          routerLink: ["/stats"],
        },
        {
          label: "System Settings",
          icon: "pi pi-fw pi-cog",
          routerLink: ["/system-settings"],
        },
        {
          label: "Backup Data",
          icon: "pi pi-fw pi-download",
          routerLink: ["/backup"],
        },
        {
          label: "View Logs",
          icon: "pi pi-fw pi-file-o",
          routerLink: ["/logs"],
        },
        {
          label: "Generate Report",
          icon: "pi pi-fw pi-chart-line",
          routerLink: ["/reports"],
        },
      )
    }

    return menuItems
  }

  getQuickActions(): MenuItem[] {
    const actions: MenuItem[] = []

    if (this.authService.isAdmin()) {
      actions.push(
        { label: "Add User", icon: "pi pi-user-plus", command: () => this.navigateToAddUser() },
        { label: "System Backup", icon: "pi pi-download", command: () => this.initiateBackup() },
      )
    }

    if (this.authService.isProductOwner()) {
      actions.push(
        { label: "Create Project", icon: "pi pi-plus", command: () => this.createProject() },
        { label: "Add User Story", icon: "pi pi-book", command: () => this.addUserStory() },
      )
    }

    if (this.authService.isScrumMaster()) {
      actions.push(
        { label: "Start Sprint", icon: "pi pi-play", command: () => this.startSprint() },
        { label: "Daily Standup", icon: "pi pi-users", command: () => this.dailyStandup() },
      )
    }

    return actions
  }

  private navigateToAddUser(): void {
    console.log("Navigate to add user")
  }

  private initiateBackup(): void {
    console.log("Initiate system backup")
  }

  private createProject(): void {
    console.log("Create new project")
  }

  private addUserStory(): void {
    console.log("Add user story")
  }

  private startSprint(): void {
    console.log("Start sprint")
  }

  private dailyStandup(): void {
    console.log("Daily standup")
  }
}
