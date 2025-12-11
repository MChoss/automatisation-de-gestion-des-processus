import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"

@Component({
  selector: "app-scrum-master-sidebar",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="sidebar-container">
      <div class="sidebar-header">
        <h3>SCRUM MASTER</h3>
      </div>

      <nav class="sidebar-nav">
        <a routerLink="/dashboard/scrum-master/overview" routerLinkActive="active" class="nav-item">
          <i class="pi pi-home"></i>
          <span>Dashboard</span>
        </a>

        <a routerLink="/dashboard/scrum-master/my-projects" routerLinkActive="active" class="nav-item">
          <i class="pi pi-briefcase"></i>
          <span>My Projects</span>
        </a>

        <a routerLink="/dashboard/scrum-master/product-backlogs" routerLinkActive="active" class="nav-item">
          <i class="pi pi-database"></i>
          <span>Product Backlogs</span>
        </a>

        <a routerLink="/dashboard/scrum-master/sprints" routerLinkActive="active" class="nav-item">
          <i class="pi pi-forward"></i>
          <span>Sprints</span>
        </a>

        <a routerLink="/dashboard/scrum-master/tasks" routerLinkActive="active" class="nav-item">
          <i class="pi pi-check-square"></i>
          <span>Tasks</span>
        </a>

        <a routerLink="/dashboard/scrum-master/statistics" routerLinkActive="active" class="nav-item">
          <i class="pi pi-chart-bar"></i>
          <span>Statistics</span>
        </a>

        <!-- Added BPMN Modeler menu item -->
        <a routerLink="/dashboard/scrum-master/bpmn/models" routerLinkActive="active" class="nav-item">
          <i class="pi pi-sitemap"></i>
          <span>Process Models</span>
        </a>
      </nav>
    </div>
  `,
  styles: [
    `
      .sidebar-container {
        position: fixed;
        left: 0;
        top: 60px;
        width: 320px;
        height: calc(100vh - 60px);
        background: #ffffff;
        border-right: 1px solid #e5e7eb;
        overflow-y: auto;
        z-index: 999;
      }

      .sidebar-header {
        padding: 1.5rem 1rem;
        border-bottom: 1px solid #e5e7eb;
      }

      .sidebar-header h3 {
        margin: 0;
        font-size: 0.875rem;
        font-weight: 600;
        color: #6b7280;
        letter-spacing: 0.05em;
      }

      .sidebar-nav {
        padding: 1rem 0;
      }

      .nav-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1.5rem;
        color: #4b5563;
        text-decoration: none;
        transition: all 0.2s;
        cursor: pointer;
      }

      .nav-item:hover {
        background: #f3f4f6;
        color: #3b82f6;
      }

      .nav-item.active {
        background: #eff6ff;
        color: #3b82f6;
        border-left: 3px solid #3b82f6;
        padding-left: calc(1.5rem - 3px);
      }

      .nav-item i {
        font-size: 1.125rem;
        width: 1.25rem;
      }

      .nav-item span {
        font-size: 0.9375rem;
        font-weight: 500;
      }
    `,
  ],
})
export class AppScrumMasterSidebar {}
