import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { ButtonModule } from "primeng/button"
import { TableModule } from "primeng/table"
import { InputTextModule } from "primeng/inputtext"
import { DropdownModule } from "primeng/dropdown"
import { TagModule } from "primeng/tag"
import { ToastModule } from "primeng/toast"
import { DialogModule } from "primeng/dialog"
import { InputNumberModule } from "primeng/inputnumber"
import { ConfirmDialogModule } from "primeng/confirmdialog"
import { MessageService, ConfirmationService } from "primeng/api"
import  { Router, ActivatedRoute } from "@angular/router"
import type { BacklogItemResponse, ProductBacklogResponse, ProjetResponse } from "../../services/models"
import  { BacklogItemService, ProductBacklogService, ProjetService } from "../../services/services"
import  { TokenService } from "../../services/token/token.service"

@Component({
  selector: "app-project-backlog-items",
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
    DialogModule,
    InputNumberModule,
    ConfirmDialogModule,
  ],
  template: `
    <div class="container">
      <!-- Header -->
      <div class="header">
        <div class="header-left">
          <button 
            pButton 
            type="button" 
            icon="pi pi-arrow-left"
            class="p-button-text p-button-plain"
            (click)="goBack()">
          </button>
          <div>
            <h1>Project Backlog Items</h1>
            <p class="subtitle">View backlog items from your projects</p>
          </div>
        </div>
        <!-- Add button for creating new backlog items (admin and product owner only) -->
        <button 
          *ngIf="canManageBacklog()"
          pButton 
          type="button" 
          icon="pi pi-plus"
          label="Add Item"
          class="p-button-success"
          (click)="openAddDialog()">
        </button>
      </div>

      <!-- Stats Cards -->
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

      <!-- Filters -->
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

      <!-- Table -->
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
            <th pSortableColumn="priorite">Priority <p-sortIcon field="priorite"></p-sortIcon></th>
            <th pSortableColumn="points">Points <p-sortIcon field="points"></p-sortIcon></th>
            <th pSortableColumn="statut">Status <p-sortIcon field="statut"></p-sortIcon></th>
            <!-- Add actions column for edit/delete (admin and product owner only) -->
            <th *ngIf="canManageBacklog()">Actions</th>
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
            <td>{{ getPriorityLabel(item.priorite || 1) }}</td>
            <td>{{ item.points || 0 }}</td>
            <td>
              <p-tag 
                [value]="getStatusLabel(item.statut || 'A_FAIRE')" 
                [severity]="getStatusSeverity(item.statut || 'A_FAIRE')">
              </p-tag>
            </td>
            <!-- Add action buttons for edit and delete -->
            <td *ngIf="canManageBacklog()" class="action-buttons">
              <button 
                pButton 
                type="button" 
                icon="pi pi-pencil"
                class="p-button-rounded p-button-warning p-button-sm"
                (click)="openEditDialog(item)"
                pTooltip="Edit"
                tooltipPosition="top">
              </button>
              <button 
                pButton 
                type="button" 
                icon="pi pi-trash"
                class="p-button-rounded p-button-danger p-button-sm"
                (click)="confirmDelete(item)"
                pTooltip="Delete"
                tooltipPosition="top">
              </button>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td [attr.colspan]="canManageBacklog() ? 5 : 4" class="text-center">
              <div class="empty-state">
                <i class="pi pi-inbox"></i>
                <h3>No backlog items found</h3>
                <p>No items available in this project's backlog</p>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Add dialog for creating/editing backlog items -->
    <p-dialog 
      [(visible)]="displayDialog" 
      [header]="isEditMode ? 'Edit Backlog Item' : 'Add Backlog Item'"
      [modal]="true" 
      [style]="{ width: '50vw' }"
      [breakpoints]="{ '960px': '75vw', '640px': '90vw' }"
      (onHide)="resetForm()">
      
      <div class="form-group">
        <label for="titre">Title *</label>
        <input 
          id="titre"
          type="text" 
          pInputText 
          [(ngModel)]="currentItem.titre"
          placeholder="Enter item title"
          class="w-full">
      </div>

      <div class="form-group">
        <label for="description">Description</label>
        <textarea 
          id="description"
          pInputTextarea 
          [(ngModel)]="currentItem.description"
          placeholder="Enter item description"
          rows="4"
          class="w-full">
        </textarea>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="priorite">Priority *</label>
          <p-dropdown 
            id="priorite"
            [(ngModel)]="currentItem.priorite" 
            [options]="priorityOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select priority"
            class="w-full">
          </p-dropdown>
        </div>

        <div class="form-group">
          <label for="points">Story Points *</label>
          <p-inputNumber 
            id="points"
            [(ngModel)]="currentItem.points"
            placeholder="Enter story points"
            [min]="0"
            class="w-full">
          </p-inputNumber>
        </div>
      </div>

      <div class="form-group">
        <label for="statut">Status *</label>
        <p-dropdown 
          id="statut"
          [(ngModel)]="currentItem.statut" 
          [options]="statusOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Select status"
          class="w-full">
        </p-dropdown>
      </div>

      <ng-template pTemplate="footer">
        <button 
          pButton 
          type="button" 
          label="Cancel" 
          icon="pi pi-times"
          class="p-button-text"
          (click)="displayDialog = false">
        </button>
        <button 
          pButton 
          type="button" 
          [label]="isEditMode ? 'Update' : 'Create'"
          icon="pi pi-check"
          class="p-button-success"
          (click)="saveItem()"
          [disabled]="!isFormValid()">
        </button>
      </ng-template>
    </p-dialog>

    <p-confirmDialog></p-confirmDialog>
    <p-toast></p-toast>
  `,
  styles: [
    `
    .container { padding: 2rem; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
    .header-left { display: flex; align-items: flex-start; gap: 1rem; }
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
    .action-buttons { display: flex; gap: 0.5rem; }
    .form-group { margin-bottom: 1.5rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .w-full { width: 100%; }
  `,
  ],
  providers: [MessageService, ConfirmationService],
})
export class ProjectBacklogItemsComponent implements OnInit {
  backlogItems: BacklogItemResponse[] = []
  filteredItems: BacklogItemResponse[] = []
  productBacklog: ProductBacklogResponse | null = null
  project: ProjetResponse | null = null
  projectId: number | null = null
  loading = false
  searchTerm = ""
  filterStatus: "EN_COURS" | "TERMINE" | "A_FAIRE" | null = null
  displayDialog = false
  isEditMode = false
  currentItem: any = this.getEmptyItem()
  userRoles: string[] = []

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
    private confirmationService: ConfirmationService,
    private backlogItemService: BacklogItemService,
    private productBacklogService: ProductBacklogService,
    private projetService: ProjetService,
    private tokenService: TokenService,
  ) {}

  ngOnInit() {
    this.extractUserRoles()
    this.route.params.subscribe((params) => {
      if (params["projectId"]) {
        this.projectId = +params["projectId"]
        this.loadProjectDetails()
        this.loadProjectBacklog()
      }
    })
  }

  extractUserRoles() {
    try {
      const token = this.tokenService.token
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]))
        const authorities = payload.authorities || payload.roles || []
        this.userRoles = authorities.map((auth: any) =>
          typeof auth === "string" ? auth : auth.authority || auth.name || "",
        )
      }
    } catch (error) {
      console.error("Error extracting user roles:", error)
    }
  }

  canManageBacklog(): boolean {
    return this.userRoles.some(
      (role) => role === "ADMIN" || role === "ROLE_ADMIN" || role === "PRODUCT_OWNER" || role === "ROLE_PRODUCT_OWNER",
    )
  }

  loadProjectDetails() {
    if (this.projectId) {
      this.projetService.findProjetById({ "projet-id": this.projectId }).subscribe({
        next: (project) => {
          this.project = project
        },
        error: (error) => {
          console.error("Error loading project details:", error)
        },
      })
    }
  }

  loadProjectBacklog() {
    if (this.projectId) {
      this.loading = true
      this.productBacklogService.findProductBacklogByProjectId({ "project-id": this.projectId }).subscribe({
        next: (backlog) => {
          this.productBacklog = backlog
          if (backlog.id) {
            this.loadBacklogItems(backlog.id)
          }
        },
        error: (error) => {
          console.error("Error loading project backlog:", error)
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "Failed to load product backlog",
          })
          this.loading = false
        },
      })
    }
  }

  loadBacklogItems(productBacklogId: number) {
    this.backlogItemService
      .findByProductBacklog({
        "product-backlog-id": productBacklogId,
        page: 0,
        size: 1000,
      })
      .subscribe({
        next: (response) => {
          this.backlogItems = response.content || []
          this.filteredItems = [...this.backlogItems]
          this.loading = false
        },
        error: (error) => {
          console.error("Error loading backlog items:", error)
          this.backlogItems = []
          this.filteredItems = []
          this.loading = false
        },
      })
  }

  applyFilters() {
    this.filteredItems = this.backlogItems.filter((item) => {
      const matchesSearch = !this.searchTerm || item.titre?.toLowerCase().includes(this.searchTerm.toLowerCase())
      const matchesStatus = !this.filterStatus || item.statut === this.filterStatus
      return matchesSearch && matchesStatus
    })
  }

  clearFilters() {
    this.searchTerm = ""
    this.filterStatus = null
    this.filteredItems = [...this.backlogItems]
  }

  openAddDialog() {
    this.isEditMode = false
    this.currentItem = this.getEmptyItem()
    this.displayDialog = true
  }

  openEditDialog(item: BacklogItemResponse) {
    this.isEditMode = true
    this.currentItem = { ...item }
    this.displayDialog = true
  }

  confirmDelete(item: BacklogItemResponse) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${item.titre}"?`,
      header: "Confirm Delete",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.deleteItem(item)
      },
    })
  }

  deleteItem(item: BacklogItemResponse) {
    if (!item.id) return

    this.backlogItemService.deleteBacklogItem({ "backlog-item-id": item.id }).subscribe({
      next: () => {
        this.messageService.add({
          severity: "success",
          summary: "Success",
          detail: "Backlog item deleted successfully",
        })
        this.loadProjectBacklog()
      },
      error: (error) => {
        console.error("Error deleting backlog item:", error)
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to delete backlog item",
        })
      },
    })
  }

  saveItem() {
    if (!this.isFormValid()) return

    if (this.isEditMode) {
      this.updateItem()
    } else {
      this.createItem()
    }
  }

  createItem() {
    if (!this.productBacklog?.id) {
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: "Product backlog not found",
      })
      return
    }

    const itemRequest = {
      titre: this.currentItem.titre,
      description: this.currentItem.description,
      priorite: this.currentItem.priorite,
      points: this.currentItem.points,
      statut: this.currentItem.statut,
      productBacklogId: this.productBacklog.id,
    }

    this.backlogItemService.createBacklogItem({ body: itemRequest }).subscribe({
      next: () => {
        this.messageService.add({
          severity: "success",
          summary: "Success",
          detail: "Backlog item created successfully",
        })
        this.displayDialog = false
        this.loadProjectBacklog()
      },
      error: (error) => {
        console.error("Error creating backlog item:", error)
        this.messageService.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to create backlog item",
        })
      },
    })
  }

  updateItem() {
    if (!this.currentItem.id) return

    const itemRequest = {
      titre: this.currentItem.titre,
      description: this.currentItem.description,
      priorite: this.currentItem.priorite,
      points: this.currentItem.points,
      statut: this.currentItem.statut,
      productBacklogId: this.currentItem.productBacklogId,
    }

    this.backlogItemService
      .updateBacklogItem({
        "backlog-item-id": this.currentItem.id,
        body: itemRequest,
      })
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: "success",
            summary: "Success",
            detail: "Backlog item updated successfully",
          })
          this.displayDialog = false
          this.loadProjectBacklog()
        },
        error: (error) => {
          console.error("Error updating backlog item:", error)
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "Failed to update backlog item",
          })
        },
      })
  }

  resetForm() {
    this.currentItem = this.getEmptyItem()
    this.isEditMode = false
  }

  isFormValid(): boolean {
    return !!(
      this.currentItem.titre &&
      this.currentItem.titre.trim() &&
      this.currentItem.priorite &&
      this.currentItem.points !== null &&
      this.currentItem.points !== undefined &&
      this.currentItem.statut
    )
  }

  getEmptyItem() {
    return {
      titre: "",
      description: "",
      priorite: 3,
      points: 0,
      statut: "A_FAIRE",
    }
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

  goBack() {
    this.router.navigate(["/projects_details", this.projectId])
  }
}
