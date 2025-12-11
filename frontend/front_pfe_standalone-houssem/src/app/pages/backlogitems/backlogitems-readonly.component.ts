import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ButtonModule } from "primeng/button"
import { TableModule } from "primeng/table"
import { InputTextModule } from "primeng/inputtext"
import { DropdownModule } from "primeng/dropdown"
import { TagModule } from "primeng/tag"
import { ToastModule } from "primeng/toast"
import { MessageService } from "primeng/api"
import  { Router, ActivatedRoute } from "@angular/router"
import type { BacklogItemResponse, ProductBacklogResponse } from "../../services/models"
import  { BacklogItemService, ProductBacklogService } from "../../services/services"
import { FormsModule } from "@angular/forms"

@Component({
  selector: "app-backlog-items-readonly",
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
    <div class="backlog-items-readonly-container">
       Header Section 
      <div class="header-section">
        <div class="header-content">
          <button pButton icon="pi pi-arrow-left" class="p-button-text" (click)="goBack()"></button>
          <div class="header-text">
            <h1>Backlog Items</h1>
            <p>All Backlog Items (Read-Only)</p>
          </div>
        </div>
      </div>

       Statistics Cards 
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ getTotalItems() }}</div>
          <div class="stat-label">Total Items</div>
          <i class="pi pi-list stat-icon"></i>
        </div>

        <div class="stat-card">
          <div class="stat-value">{{ getTodoItems() }}</div>
          <div class="stat-label">To Do</div>
          <i class="pi pi-circle stat-icon"></i>
        </div>

        <div class="stat-card">
          <div class="stat-value">{{ getInProgressItems() }}</div>
          <div class="stat-label">In Progress</div>
          <i class="pi pi-clock stat-icon"></i>
        </div>

        <div class="stat-card">
          <div class="stat-value">{{ getCompletedItems() }}</div>
          <div class="stat-label">Completed</div>
          <i class="pi pi-check-circle stat-icon"></i>
        </div>

        <div class="stat-card">
          <div class="stat-value">{{ getTotalStoryPoints() }}</div>
          <div class="stat-label">Story Points</div>
          <i class="pi pi-star stat-icon"></i>
        </div>
      </div>

       Search and Filter Section 
      <div class="search-filter-section">
        <div class="search-box">
          <i class="pi pi-search"></i>
          <input
            type="text"
            pInputText
            [(ngModel)]="searchTerm"
            (keyup.enter)="searchItems()"
            placeholder="Search items..."
          />
          <button pButton icon="pi pi-search" (click)="searchItems()" class="p-button-text"></button>
        </div>

        <p-dropdown
          [(ngModel)]="filterStatus"
          [options]="statusOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Filter by status"
          (onChange)="filterByStatus()"
          [showClear]="true"
        ></p-dropdown>

        <button pButton icon="pi pi-filter-slash" label="Clear Filters" (click)="clearFilters()" class="p-button-outlined"></button>
      </div>

       Backlog Items Table 
      <div class="table-section">
        <h2>Backlog Items</h2>
        <p-table
          [value]="backlogItems"
          [loading]="loading"
          [paginator]="true"
          [rows]="pageSize"
          [totalRecords]="totalRecords"
          [lazy]="true"
          (onLazyLoad)="onPageChange($event)"
          [rowsPerPageOptions]="[10, 25, 50]"
          styleClass="p-datatable-gridlines"
        >
          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="titre">Title <p-sortIcon field="titre"></p-sortIcon></th>
              <th>Description</th>
              <th pSortableColumn="priorite">Priority <p-sortIcon field="priorite"></p-sortIcon></th>
              <th pSortableColumn="points">Story Points <p-sortIcon field="points"></p-sortIcon></th>
              <th pSortableColumn="statut">Status <p-sortIcon field="statut"></p-sortIcon></th>
              <th>Product Backlog</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-item>
            <tr>
              <td>{{ item.titre }}</td>
              <td>{{ item.description || 'N/A' }}</td>
              <td>
                <p-tag [value]="getPriorityLabel(item.priorite)" [severity]="getPrioritySeverity(item.priorite)"></p-tag>
              </td>
              <td>{{ item.points || 0 }}</td>
              <td>
                <p-tag [value]="item.statut" [severity]="getStatusSeverity(item.statut)"></p-tag>
              </td>
              <td>{{ getProductBacklogName(item.productBacklogId) }}</td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="text-center">No backlog items found</td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <p-toast></p-toast>
    </div>
  `,
  styles: [
    `
      .backlog-items-readonly-container {
        padding: 2rem;
        max-width: 1400px;
        margin: 0 auto;
      }

      .header-section {
        margin-bottom: 2rem;
      }

      .header-content {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .header-text h1 {
        margin: 0;
        font-size: 1.75rem;
        font-weight: 600;
        color: #1f2937;
      }

      .header-text p {
        margin: 0.25rem 0 0 0;
        color: #6b7280;
        font-size: 0.875rem;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
      }

      .stat-card {
        background: white;
        border-radius: 0.5rem;
        padding: 1.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        position: relative;
        border-left: 4px solid #10b981;
      }

      .stat-value {
        font-size: 2rem;
        font-weight: 700;
        color: #10b981;
        margin-bottom: 0.5rem;
      }

      .stat-label {
        color: #6b7280;
        font-size: 0.875rem;
        font-weight: 500;
      }

      .stat-icon {
        position: absolute;
        top: 1.5rem;
        right: 1.5rem;
        font-size: 1.5rem;
        color: #10b981;
        opacity: 0.3;
      }

      .search-filter-section {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
        flex-wrap: wrap;
      }

      .search-box {
        flex: 1;
        min-width: 300px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: white;
        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
        padding: 0 0.75rem;
      }

      .search-box input {
        flex: 1;
        border: none;
        outline: none;
      }

      .table-section {
        background: white;
        border-radius: 0.5rem;
        padding: 1.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .table-section h2 {
        margin: 0 0 1rem 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #1f2937;
      }

      .text-center {
        text-align: center;
        padding: 2rem;
        color: #6b7280;
      }
    `,
  ],
  providers: [MessageService],
})
export class BacklogItemsReadonlyComponent implements OnInit {
  backlogItems: BacklogItemResponse[] = []
  productBacklogs: ProductBacklogResponse[] = []
  loading = false
  totalRecords = 0
  currentPage = 0
  pageSize = 10
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
    private route: ActivatedRoute,
    private messageService: MessageService,
    private backlogItemService: BacklogItemService,
    private productBacklogService: ProductBacklogService,
  ) {}

  ngOnInit() {
    this.loadAllBacklogItems()
    this.loadProductBacklogs()
  }

  loadAllBacklogItems() {
    this.loading = true
    this.backlogItemService
      .findAllBacklogItems({
        page: this.currentPage,
        size: this.pageSize,
      })
      .subscribe({
        next: (response) => {
          this.backlogItems = response.content || []
          this.totalRecords = response.totalElements || 0
          this.loading = false
        },
        error: (error) => {
          console.error("Error loading backlog items:", error)
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "Failed to load backlog items",
          })
          this.loading = false
        },
      })
  }

  loadProductBacklogs() {
    this.productBacklogService.findAllProductBacklogs({ page: 0, size: 100 }).subscribe({
      next: (response) => {
        this.productBacklogs = response.content || []
      },
      error: (error) => {
        console.error("Error loading product backlogs:", error)
      },
    })
  }

  searchItems() {
    if (this.searchTerm.trim()) {
      this.loading = true
      this.backlogItemService
        .searchBacklogItems({
          q: this.searchTerm,
          page: this.currentPage,
          size: this.pageSize,
        })
        .subscribe({
          next: (response) => {
            this.backlogItems = response.content || []
            this.totalRecords = response.totalElements || 0
            this.loading = false
          },
          error: (error) => {
            console.error("Error searching backlog items:", error)
            this.loading = false
          },
        })
    } else {
      this.loadAllBacklogItems()
    }
  }

  filterByStatus() {
    if (this.filterStatus) {
      this.loading = true
      this.backlogItemService
        .findByStatut({
          statut: this.filterStatus,
          page: this.currentPage,
          size: this.pageSize,
        })
        .subscribe({
          next: (response) => {
            this.backlogItems = response.content || []
            this.totalRecords = response.totalElements || 0
            this.loading = false
          },
          error: (error) => {
            console.error("Error filtering by status:", error)
            this.loading = false
          },
        })
    } else {
      this.loadAllBacklogItems()
    }
  }

  clearFilters() {
    this.searchTerm = ""
    this.filterStatus = null
    this.loadAllBacklogItems()
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

  getPrioritySeverity(priority: number): string {
    if (priority >= 4) return "danger"
    if (priority === 3) return "warning"
    return "info"
  }

  getProductBacklogName(id: number): string {
    const backlog = this.productBacklogs.find((b) => b.id === id)
    return backlog ? backlog.projectName || "Unknown" : "Unknown"
  }

  goBack() {
    this.router.navigate(["/dashboard/scrum-master/overview"])
  }

  onPageChange(event: any) {
    this.currentPage = event.page
    this.pageSize = event.rows
    this.loadAllBacklogItems()
  }

  getTotalItems(): number {
    return this.backlogItems.length
  }

  getCompletedItems(): number {
    return this.backlogItems.filter((item) => item.statut === "TERMINE").length
  }

  getInProgressItems(): number {
    return this.backlogItems.filter((item) => item.statut === "EN_COURS").length
  }

  getTodoItems(): number {
    return this.backlogItems.filter((item) => item.statut === "A_FAIRE").length
  }

  getTotalStoryPoints(): number {
    return this.backlogItems.reduce((sum, item) => sum + (item.points || 0), 0)
  }
}
