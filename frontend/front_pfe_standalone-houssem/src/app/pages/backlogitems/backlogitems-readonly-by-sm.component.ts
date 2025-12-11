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
import type { BacklogItemResponse, ProductBacklogResponse, ProjetResponse } from "../../services/models"
import  { BacklogItemService, ProductBacklogService, ProjetService } from "../../services/services"

@Component({
  selector: "app-backlog-items-readonly-by-sm",
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
       Header 
      <div class="header">
        <div>
          <h1>Project Backlog Items</h1>
          <p class="subtitle">View backlog items from your projects </p>
        </div>
      </div>

       Stats Cards 
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon"><i class="pi pi-list"></i></div>
          <div class="stat-content">
            <div class="stat-number">{{ getTotalItems() }}</div>
            <div class="stat-label">Total Items</div>
          </div>
        </div>
        <div class="stat-card todo">
          <div class="stat-icon"><i class="pi pi-circle"></i></div>
          <div class="stat-content">
            <div class="stat-number">{{ getTodoItems() }}</div>
            <div class="stat-label">To Do</div>
          </div>
        </div>
        <div class="stat-card progress">
          <div class="stat-icon"><i class="pi pi-clock"></i></div>
          <div class="stat-content">
            <div class="stat-number">{{ getInProgressItems() }}</div>
            <div class="stat-label">In Progress</div>
          </div>
        </div>
        <div class="stat-card completed">
          <div class="stat-icon"><i class="pi pi-check-circle"></i></div>
          <div class="stat-content">
            <div class="stat-number">{{ getCompletedItems() }}</div>
            <div class="stat-label">Completed</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="pi pi-star"></i></div>
          <div class="stat-content">
            <div class="stat-number">{{ getTotalStoryPoints() }}</div>
            <div class="stat-label">Story Points</div>
          </div>
        </div>
      </div>

       Filters 
      <div class="filters">
        <span class="p-input-icon-left">
          <i class="pi pi-search"></i>
          <input 
            type="text" 
            pInputText 
            placeholder="Search by title..." 
            [(ngModel)]="searchTerm"
            (keyup.enter)="applyFilters()">
        </span>
        <p-dropdown 
          [(ngModel)]="selectedProjectId" 
          [options]="projects"
          optionLabel="nom"
          optionValue="id"
          placeholder="All Projects"
          [showClear]="true"
          (onChange)="applyFilters()">
        </p-dropdown>
        <p-dropdown 
          [(ngModel)]="filterStatus" 
          [options]="statusOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="All Statuses"
          [showClear]="true"
          (onChange)="applyFilters()">
        </p-dropdown>
        <button 
          pButton 
          type="button" 
          icon="pi pi-filter-slash"
          label="Clear Filters"
          class="p-button-outlined"
          (click)="clearFilters()">
        </button>
      </div>

       Table 
      <p-table 
        [value]="filteredItems" 
        [paginator]="true" 
        [rows]="10"
        [loading]="loading"
        [showCurrentPageReport]="true"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} items"
        [rowsPerPageOptions]="[10, 25, 50]"
        styleClass="p-datatable-gridlines">
        
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="titre">Title <p-sortIcon field="titre"></p-sortIcon></th>
            <th pSortableColumn="projectName">Project <p-sortIcon field="projectName"></p-sortIcon></th>
            <th pSortableColumn="priorite">Priority <p-sortIcon field="priorite"></p-sortIcon></th>
            <th pSortableColumn="points">Points <p-sortIcon field="points"></p-sortIcon></th>
            <th pSortableColumn="statut">Status <p-sortIcon field="statut"></p-sortIcon></th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-item>
          <tr>
            <td>
              <div>
                <strong>{{ item.titre }}</strong>
                <div class="text-sm text-gray-600" *ngIf="item.description">{{ item.description }}</div>
              </div>
            </td>
            <td>{{ item.projectName }}</td>
            <td>{{ getPriorityLabel(item.priorite || 1) }}</td>
            <td>{{ item.points || 0 }}</td>
            <td>
              <p-tag 
                [value]="getStatusLabel(item.statut || 'A_FAIRE')" 
                [severity]="getStatusSeverity(item.statut || 'A_FAIRE')">
              </p-tag>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="5" class="text-center">
              <div class="empty-state">
                <i class="pi pi-inbox"></i>
                <h3>No backlog items found</h3>
                <p>No items available in your projects</p>
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
    .stat-card.todo .stat-icon { color: #3b82f6; }
    .stat-card.progress .stat-icon { color: #f59e0b; }
    .stat-card.completed .stat-icon { color: #10b981; }
    .stat-number { font-size: 2rem; font-weight: 700; }
    .stat-label { color: #6b7280; font-size: 0.875rem; }
    .filters { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .filters .p-input-icon-left { flex: 1; min-width: 200px; }
    .filters p-dropdown { min-width: 180px; }
    .empty-state { padding: 3rem; text-align: center; }
    .empty-state i { font-size: 4rem; color: #d1d5db; margin-bottom: 1rem; }
    .empty-state h3 { margin: 0.5rem 0; }
    .empty-state p { color: #6b7280; }
    .text-sm { font-size: 0.875rem; }
    .text-gray-600 { color: #6b7280; }
    .text-center { text-align: center; }
  `,
  ],
  providers: [MessageService],
})
export class BacklogItemsReadonlyBySMComponent implements OnInit {
  backlogItems: BacklogItemResponse[] = []
  filteredItems: BacklogItemResponse[] = []
  projects: ProjetResponse[] = []
  productBacklogs: ProductBacklogResponse[] = []
  selectedProjectId: number | null = null
  loading = false
  searchTerm = ""
  filterStatus: "EN_COURS" | "TERMINE" | "A_FAIRE" | null = null

  statusOptions = [
    { label: "À faire", value: "A_FAIRE" },
    { label: "En cours", value: "EN_COURS" },
    { label: "Terminé", value: "TERMINE" },
  ]

  priorityOptions = [
    { label: "Très faible", value: 1 },
    { label: "Faible", value: 2 },
    { label: "Moyenne", value: 3 },
    { label: "Élevée", value: 4 },
    { label: "Très élevée", value: 5 },
  ]

  constructor(
    private router: Router,
    private messageService: MessageService,
    private backlogItemService: BacklogItemService,
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
        this.productBacklogs = (response.content || []).filter(
          (backlog) => backlog.projectId && projectIds.includes(backlog.projectId),
        )
        this.loadAllBacklogItems()
      },
      error: (error) => {
        console.error("Error loading product backlogs:", error)
        this.loading = false
      },
    })
  }

  loadAllBacklogItems() {
    const backlogIds = this.productBacklogs.map((b) => b.id).filter((id) => id !== undefined)

    if (backlogIds.length === 0) {
      this.backlogItems = []
      this.filteredItems = []
      this.loading = false
      return
    }

    const itemPromises = backlogIds.map((backlogId) =>
      this.backlogItemService
        .findByProductBacklog({
          "product-backlog-id": backlogId!,
          page: 0,
          size: 1000,
        })
        .toPromise(),
    )

    Promise.all(itemPromises)
      .then((responses) => {
        this.backlogItems = responses.flatMap((response) => {
          const items = response?.content || []
          return items.map((item) => {
            const backlog = this.productBacklogs.find((b) => b.id === item.productBacklogId)
            return {
              ...item,
              projectName: backlog?.projectName || "Unknown",
            }
          })
        })
        this.filteredItems = [...this.backlogItems]
        this.loading = false
      })
      .catch((error) => {
        console.error("Error loading backlog items:", error)
        this.loading = false
      })
  }

  applyFilters() {
    this.filteredItems = this.backlogItems.filter((item) => {
      const matchesSearch = !this.searchTerm || item.titre?.toLowerCase().includes(this.searchTerm.toLowerCase())

      const matchesProject =
        !this.selectedProjectId ||
        this.productBacklogs.find((b) => b.id === item.productBacklogId)?.projectId === this.selectedProjectId

      const matchesStatus = !this.filterStatus || item.statut === this.filterStatus

      return matchesSearch && matchesProject && matchesStatus
    })
  }

  clearFilters() {
    this.searchTerm = ""
    this.selectedProjectId = null
    this.filterStatus = null
    this.filteredItems = [...this.backlogItems]
  }

  getStatusLabel(status: string): string {
    const option = this.statusOptions.find((s) => s.value === status)
    return option ? option.label : status
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case "A_FAIRE":
        return "info"
      case "EN_COURS":
        return "warning"
      case "TERMINE":
        return "success"
      default:
        return "info"
    }
  }

  getPriorityLabel(priority: number): string {
    const option = this.priorityOptions.find((p) => p.value === priority)
    return option ? option.label : priority.toString()
  }

  getTotalItems(): number {
    return this.filteredItems.length
  }

  getCompletedItems(): number {
    return this.filteredItems.filter((item) => item.statut === "TERMINE").length
  }

  getInProgressItems(): number {
    return this.filteredItems.filter((item) => item.statut === "EN_COURS").length
  }

  getTodoItems(): number {
    return this.filteredItems.filter((item) => item.statut === "A_FAIRE").length
  }

  getTotalStoryPoints(): number {
    return this.filteredItems.reduce((sum, item) => sum + (item.points || 0), 0)
  }
}
