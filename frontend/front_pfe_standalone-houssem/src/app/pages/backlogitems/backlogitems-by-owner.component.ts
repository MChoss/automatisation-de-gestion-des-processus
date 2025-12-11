import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { ButtonModule } from "primeng/button"
import { TableModule } from "primeng/table"
import { DialogModule } from "primeng/dialog"
import { InputTextModule } from "primeng/inputtext"
import { DropdownModule } from "primeng/dropdown"
import { InputNumberModule } from "primeng/inputnumber"
import { TagModule } from "primeng/tag"
import { ToastModule } from "primeng/toast"
import { ConfirmDialogModule } from "primeng/confirmdialog"
import { MessageService, ConfirmationService } from "primeng/api"
import  { Router } from "@angular/router"
import type {
  BacklogItemResponse,
  BacklogItemRequest,
  ProductBacklogResponse,
  ProjetResponse,
} from "../../services/models"
import  { BacklogItemService, ProductBacklogService, ProjetService } from "../../services/services"

@Component({
  selector: "app-backlog-items-by-owner",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    InputNumberModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  template: `
    <div class="container">
       Header 
      <div class="header">
        <div>
          <h1>My Backlog Items</h1>
          <p class="subtitle">Manage backlog items across all your projects</p>
        </div>
        <button 
          pButton 
          type="button" 
          label="Add Item" 
          icon="pi pi-plus"
          class="p-button-success"
          (click)="showAddDialog()">
        </button>
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
        [(selection)]="selectedItems"
        [paginator]="true" 
        [rows]="10"
        [loading]="loading"
        [showCurrentPageReport]="true"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} items"
        [rowsPerPageOptions]="[10, 25, 50]"
        styleClass="p-datatable-gridlines">
        
        <ng-template pTemplate="header">
          <tr>
            <th style="width: 3rem"><p-tableHeaderCheckbox></p-tableHeaderCheckbox></th>
            <th pSortableColumn="titre">Title <p-sortIcon field="titre"></p-sortIcon></th>
            <th pSortableColumn="projectName">Project <p-sortIcon field="projectName"></p-sortIcon></th>
            <th pSortableColumn="priorite">Priority <p-sortIcon field="priorite"></p-sortIcon></th>
            <th pSortableColumn="points">Points <p-sortIcon field="points"></p-sortIcon></th>
            <th pSortableColumn="statut">Status <p-sortIcon field="statut"></p-sortIcon></th>
            <th style="width: 10rem">Actions</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-item>
          <tr>
            <td><p-tableCheckbox [value]="item"></p-tableCheckbox></td>
            <td>
              <div>
                <strong>{{ item.titre }}</strong>
                <div class="text-sm text-gray-600" *ngIf="item.description">{{ item.description }}</div>
              </div>
            </td>
            <td>{{ item.projectName }}</td>
            <td>
              <p-dropdown 
                [ngModel]="item.priorite" 
                [options]="priorityOptions"
                optionLabel="label"
                optionValue="value"
                (onChange)="updatePriority(item, $event.value)">
              </p-dropdown>
            </td>
            <td>{{ item.points || 0 }}</td>
            <td>
              <p-dropdown 
                [ngModel]="item.statut" 
                [options]="statusOptions"
                optionLabel="label"
                optionValue="value"
                (onChange)="changeStatus(item, $event.value)">
              </p-dropdown>
            </td>
            <td>
              <button 
                pButton 
                type="button" 
                icon="pi pi-pencil" 
                class="p-button-text p-button-sm"
                (click)="editItem(item)">
              </button>
              <button 
                pButton 
                type="button" 
                icon="pi pi-trash" 
                class="p-button-text p-button-sm p-button-danger"
                (click)="deleteItem(item)">
              </button>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="7" class="text-center">
              <div class="empty-state">
                <i class="pi pi-inbox"></i>
                <h3>No backlog items found</h3>
                <p>Create your first backlog item to get started</p>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

     Add/Edit Dialog 
    <p-dialog 
      [(visible)]="displayDialog" 
      [header]="isEditMode ? 'Edit Backlog Item' : 'Create Backlog Item'"
      [modal]="true" 
      [style]="{width: '600px'}">
      
      <div class="dialog-content">
        <div class="field">
          <label for="project">Project *</label>
          <p-dropdown 
            id="project"
            [(ngModel)]="selectedBacklogId" 
            [options]="productBacklogs"
            optionLabel="projectName"
            optionValue="id"
            placeholder="Select project"
            class="w-full"
            [disabled]="isEditMode">
          </p-dropdown>
        </div>

        <div class="field">
          <label for="titre">Title *</label>
          <input 
            id="titre"
            type="text" 
            pInputText 
            [(ngModel)]="currentItem.titre" 
            placeholder="Enter item title"
            class="w-full">
        </div>

        <div class="field">
          <label for="description">Description</label>
          <textarea 
            id="description"
            pInputTextarea 
            [(ngModel)]="currentItem.description" 
            placeholder="Enter item description"
            rows="3"
            class="w-full">
          </textarea>
        </div>

        <div class="field-group">
          <div class="field">
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

          <div class="field">
            <label for="points">Story Points</label>
            <p-inputNumber 
              id="points"
              [(ngModel)]="currentItem.points" 
              [min]="0"
              [max]="100"
              placeholder="0"
              class="w-full">
            </p-inputNumber>
          </div>
        </div>

        <div class="field">
          <label for="statut">Status</label>
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
          class="p-button-primary"
          [disabled]="!isFormValid()"
          (click)="saveItem()">
        </button>
      </ng-template>
    </p-dialog>

    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
  `,
  styles: [
    `
    .container { padding: 2rem; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
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
    .dialog-content { padding: 1rem 0; }
    .field { margin-bottom: 1.5rem; }
    .field label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
    .field-group { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .w-full { width: 100%; }
    .text-sm { font-size: 0.875rem; }
    .text-gray-600 { color: #6b7280; }
  `,
  ],
  providers: [MessageService, ConfirmationService],
})
export class BacklogItemsByOwnerComponent implements OnInit {
  backlogItems: BacklogItemResponse[] = []
  filteredItems: BacklogItemResponse[] = []
  selectedItems: BacklogItemResponse[] = []
  projects: ProjetResponse[] = []
  productBacklogs: ProductBacklogResponse[] = []
  displayDialog = false
  isEditMode = false
  currentItem: BacklogItemRequest = this.getEmptyItem()
  selectedProjectId: number | null = null
  selectedBacklogId: number | null = null
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
    private confirmationService: ConfirmationService,
    private backlogItemService: BacklogItemService,
    private productBacklogService: ProductBacklogService,
    private projetService: ProjetService,
  ) {}

  ngOnInit() {
    this.loadOwnerProjects()
  }

  loadOwnerProjects() {
    this.loading = true
    this.projetService.findAllProjetsByOwner({ page: 0 }).subscribe({
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

  showAddDialog() {
    this.isEditMode = false
    this.currentItem = this.getEmptyItem()
    this.selectedBacklogId = null
    this.displayDialog = true
  }

  editItem(item: BacklogItemResponse) {
    this.isEditMode = true
    this.currentItem = {
      titre: item.titre || "",
      description: item.description || "",
      priorite: item.priorite || 1,
      points: item.points || 0,
      statut: item.statut || "A_FAIRE",
      productBacklogId: item.productBacklogId || 0,
    }
    this.selectedBacklogId = item.productBacklogId || null
    this.displayDialog = true
  }

  deleteItem(item: BacklogItemResponse) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${item.titre}"?`,
      header: "Confirm Delete",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        if (item.id) {
          this.backlogItemService.deleteBacklogItem({ "backlog-item-id": item.id }).subscribe({
            next: () => {
              this.messageService.add({
                severity: "success",
                summary: "Success",
                detail: "Backlog item deleted successfully",
              })
              this.loadAllBacklogItems()
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
      },
    })
  }

  saveItem() {
    if (this.isFormValid()) {
      this.currentItem.productBacklogId = this.selectedBacklogId || 0

      if (this.isEditMode) {
        const itemToEdit = this.backlogItems.find(
          (item) =>
            item.titre === this.currentItem.titre && item.productBacklogId === this.currentItem.productBacklogId,
        )
        if (itemToEdit && itemToEdit.id) {
          this.backlogItemService
            .updateBacklogItem({
              "backlog-item-id": itemToEdit.id,
              body: this.currentItem,
            })
            .subscribe({
              next: () => {
                this.messageService.add({
                  severity: "success",
                  summary: "Success",
                  detail: "Backlog item updated successfully",
                })
                this.displayDialog = false
                this.loadAllBacklogItems()
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
      } else {
        this.backlogItemService.createBacklogItem({ body: this.currentItem }).subscribe({
          next: () => {
            this.messageService.add({
              severity: "success",
              summary: "Success",
              detail: "Backlog item created successfully",
            })
            this.displayDialog = false
            this.loadAllBacklogItems()
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
    }
  }

  changeStatus(item: BacklogItemResponse, newStatus: "EN_COURS" | "TERMINE" | "A_FAIRE") {
    if (item.id) {
      this.backlogItemService
        .changeStatut1({
          "backlog-item-id": item.id,
          statut: newStatus,
        })
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: "success",
              summary: "Success",
              detail: "Status updated successfully",
            })
            this.loadAllBacklogItems()
          },
          error: (error) => {
            console.error("Error updating status:", error)
            this.messageService.add({
              severity: "error",
              summary: "Error",
              detail: "Failed to update status",
            })
          },
        })
    }
  }

  updatePriority(item: BacklogItemResponse, newPriority: number) {
    if (item.id) {
      this.backlogItemService
        .updatePriorite({
          "backlog-item-id": item.id,
          priorite: newPriority,
        })
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: "success",
              summary: "Success",
              detail: "Priority updated successfully",
            })
            this.loadAllBacklogItems()
          },
          error: (error) => {
            console.error("Error updating priority:", error)
            this.messageService.add({
              severity: "error",
              summary: "Error",
              detail: "Failed to update priority",
            })
          },
        })
    }
  }

  isFormValid(): boolean {
    return !!(
      this.currentItem.titre?.trim() &&
      this.selectedBacklogId &&
      this.currentItem.priorite &&
      this.currentItem.priorite > 0
    )
  }

  getEmptyItem(): BacklogItemRequest {
    return {
      titre: "",
      description: "",
      priorite: 1,
      points: 0,
      statut: "A_FAIRE",
      productBacklogId: 0,
    }
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
