import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { ButtonModule } from "primeng/button"
import { TableModule } from "primeng/table"
import { InputTextModule } from "primeng/inputtext"
import { DropdownModule } from "primeng/dropdown"
import { TagModule } from "primeng/tag"
import { ToastModule } from "primeng/toast"
import { MessageService } from "primeng/api"
import  { Router } from "@angular/router"
import type { ProductBacklogResponse, ProjetResponse } from "../../services/models"
import  { ProductBacklogService, ProjetService } from "../../services/services"

@Component({
  selector: "app-scrum-master-product-backlogs",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    DropdownModule,
    TagModule,
    ToastModule,
  ],
  template: `
    <div class="container">
      <!-- Header -->
      <div class="header">
        <div>
          <h1>Product Backlogs</h1>
          <p class="subtitle">View product backlogs from your assigned projects</p>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon"><i class="pi pi-th-large"></i></div>
          <div class="stat-content">
            <div class="stat-number">{{ getTotalBacklogs() }}</div>
            <div class="stat-label">Total Backlogs</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="pi pi-check-circle"></i></div>
          <div class="stat-content">
            <div class="stat-number">{{ getActiveProjects() }}</div>
            <div class="stat-label">Active Projects</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="pi pi-list"></i></div>
          <div class="stat-content">
            <div class="stat-number">{{ getTotalItems() }}</div>
            <div class="stat-label">Total Items</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="pi pi-folder"></i></div>
          <div class="stat-content">
            <div class="stat-number">{{ projects.length }}</div>
            <div class="stat-label">Projects</div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <p-table 
        [value]="productBacklogs" 
        [paginator]="true" 
        [rows]="10"
        [loading]="loading"
        [showCurrentPageReport]="true"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} backlogs"
        [rowsPerPageOptions]="[10, 25, 50]"
        styleClass="p-datatable-gridlines">
        
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="projectName">Project <p-sortIcon field="projectName"></p-sortIcon></th>
            <th>Items Count</th>
            <th>Actions</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-backlog>
          <tr>
            <td>{{ backlog.projectName }}</td>
            <td>{{ backlog.backlogItemsCount || 0 }}</td>
            <td>
              <button 
                pButton 
                type="button" 
                icon="pi pi-eye" 
                label="View Items"
                class="p-button-text p-button-sm"
                (click)="viewBacklogItems(backlog)">
              </button>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="3" class="text-center">
              <div class="empty-state">
                <i class="pi pi-inbox"></i>
                <h3>No product backlogs found</h3>
                <p>No backlogs available in your assigned projects</p>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <p-toast></p-toast>
  `,
  styles: [
    `
    .container { padding: 2rem; }
    .header { margin-bottom: 2rem; }
    .header h1 { margin: 0; font-size: 1.875rem; font-weight: 700; }
    .subtitle { color: #6b7280; margin-top: 0.5rem; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .stat-card { background: white; border-radius: 0.5rem; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display: flex; gap: 1rem; }
    .stat-icon { font-size: 2rem; color: #10b981; }
    .stat-number { font-size: 2rem; font-weight: 700; }
    .stat-label { color: #6b7280; font-size: 0.875rem; }
    .empty-state { padding: 3rem; text-align: center; }
    .empty-state i { font-size: 4rem; color: #d1d5db; margin-bottom: 1rem; }
    .empty-state h3 { margin: 0.5rem 0; }
    .empty-state p { color: #6b7280; }
    .text-center { text-align: center; }
  `,
  ],
  providers: [MessageService],
})
export class ScrumMasterProductBacklogsComponent implements OnInit {
  productBacklogs: ProductBacklogResponse[] = []
  projects: ProjetResponse[] = []
  loading = false

  constructor(
    private router: Router,
    private messageService: MessageService,
    private productBacklogService: ProductBacklogService,
    private projetService: ProjetService,
  ) {}

  ngOnInit() {
    this.loadScrumMasterProjects()
  }

  loadScrumMasterProjects() {
    this.loading = true
    this.projetService.findAllProjetsByScrumMaster({ page: 0 }).subscribe({
      next: (response) => {
        this.projects = response.content || []
        this.loadProductBacklogs()
      },
      error: (error) => {
        console.error("Error loading projects:", error)
        this.loading = false
      },
    })
  }

  loadProductBacklogs() {
    const projectIds = this.projects.map((p) => p.id).filter((id) => id !== undefined)

    this.productBacklogService.findAllProductBacklogs({ page: 0, size: 100 }).subscribe({
      next: (response) => {
        this.productBacklogs =
          response.content?.filter(
            (backlog) => backlog.projectId !== undefined && projectIds.includes(backlog.projectId),
          ) || []
        this.loading = false
      },
      error: (error) => {
        console.error("Error loading product backlogs:", error)
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to load product backlogs",
        })
        this.loading = false
      },
    })
  }

  getTotalBacklogs(): number {
    return this.productBacklogs.length
  }

  getActiveProjects(): number {
    return this.projects.filter((p) => p.actif).length
  }

  getTotalItems(): number {
    return this.productBacklogs.reduce((sum, backlog) => sum + (backlog.backlogItemsCount || 0), 0)
  }

  viewBacklogItems(backlog: ProductBacklogResponse) {
    if (backlog.id) {
      this.router.navigate(["/backlog-items", backlog.id])
    }
  }
}
