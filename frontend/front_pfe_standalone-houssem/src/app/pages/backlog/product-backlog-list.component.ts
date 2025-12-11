import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { ButtonModule } from "primeng/button"
import { TableModule } from "primeng/table"
import { DialogModule } from "primeng/dialog"
import { InputTextModule } from "primeng/inputtext"
import { DropdownModule } from "primeng/dropdown"
import { TagModule } from "primeng/tag"
import { ToastModule } from "primeng/toast"
import { ConfirmDialogModule } from "primeng/confirmdialog"
import { MessageService, ConfirmationService } from "primeng/api"
import  { Router } from "@angular/router"
import type { ProductBacklogResponse, ProjetResponse } from "../../services/models"
import  { ProductBacklogService, ProjetService } from "../../services/services"

@Component({
  selector: "app-product-backlog-list",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  template: `
    <div class="container">
      <!-- Header -->
      <div class="header">
        <div>
          <h1>Product Backlogs</h1>
          <p class="subtitle">Manage your product backlogs for all projects</p>
        </div>
        <button 
          pButton 
          type="button" 
          label="Add Backlog" 
          icon="pi pi-plus"
          class="p-button-success"
          (click)="showAddDialog()">
        </button>
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
        [(selection)]="selectedBacklogs"
        [paginator]="true" 
        [rows]="10"
        [loading]="loading"
        [showCurrentPageReport]="true"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} backlogs"
        [rowsPerPageOptions]="[10, 25, 50]"
        styleClass="p-datatable-gridlines">
        
        <ng-template pTemplate="header">
          <tr>
            <th style="width: 3rem"><p-tableHeaderCheckbox></p-tableHeaderCheckbox></th>
            <th pSortableColumn="projectName">Project <p-sortIcon field="projectName"></p-sortIcon></th>
            <th>Items Count</th>
            <th>Actions</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-backlog>
          <tr>
            <td><p-tableCheckbox [value]="backlog"></p-tableCheckbox></td>
            <td>{{ backlog.projectName }}</td>
            <td>{{ backlog.backlogItemsCount || 0 }}</td>
            <td>
              <button 
                pButton 
                type="button" 
                icon="pi pi-eye" 
                class="p-button-text p-button-sm"
                pTooltip="View Items"
                (click)="viewBacklogItems(backlog)">
              </button>
              <button 
                pButton 
                type="button" 
                icon="pi pi-pencil" 
                class="p-button-text p-button-sm"
                pTooltip="Edit"
                (click)="editBacklog(backlog)">
              </button>
              <button 
                pButton 
                type="button" 
                icon="pi pi-trash" 
                class="p-button-text p-button-sm p-button-danger"
                pTooltip="Delete"
                (click)="deleteBacklog(backlog)">
              </button>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="4" class="text-center">
              <div class="empty-state">
                <i class="pi pi-inbox"></i>
                <h3>No product backlogs found</h3>
                <p>Create your first product backlog to get started</p>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Add/Edit Dialog -->
    <p-dialog 
      [(visible)]="displayDialog" 
      [header]="isEditMode ? 'Edit Product Backlog' : 'Create Product Backlog'"
      [modal]="true" 
      [style]="{width: '500px'}">
      
      <div class="dialog-content">
        <div class="field">
          <label for="project">Project *</label>
          <p-dropdown 
            id="project"
            [(ngModel)]="currentBacklog.projetId" 
            [options]="projects"
            optionLabel="nom"
            optionValue="id"
            placeholder="Select project"
            class="w-full"
            [disabled]="isEditMode">
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
          (click)="saveBacklog()">
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
    .stat-number { font-size: 2rem; font-weight: 700; }
    .stat-label { color: #6b7280; font-size: 0.875rem; }
    .empty-state { padding: 3rem; text-align: center; }
    .empty-state i { font-size: 4rem; color: #d1d5db; margin-bottom: 1rem; }
    .empty-state h3 { margin: 0.5rem 0; }
    .empty-state p { color: #6b7280; }
    .dialog-content { padding: 1rem 0; }
    .field { margin-bottom: 1.5rem; }
    .field label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
    .w-full { width: 100%; }
    .text-center { text-align: center; }
  `,
  ],
  providers: [MessageService, ConfirmationService],
})
export class ProductBacklogListComponent implements OnInit {
  productBacklogs: ProductBacklogResponse[] = []
  selectedBacklogs: ProductBacklogResponse[] = []
  projects: ProjetResponse[] = []
  displayDialog = false
  isEditMode = false
  currentBacklog: any = this.getEmptyBacklog()
  loading = false

  constructor(
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private productBacklogService: ProductBacklogService,
    private projetService: ProjetService,
  ) {}

  ngOnInit() {
    this.loadProductBacklogs()
    this.loadProjects()
  }

  loadProductBacklogs() {
    this.loading = true
    this.projetService.findAllProjetsByOwner({ page: 0 }).subscribe({
      next: (projectsResponse) => {
        const ownerProjectIds = projectsResponse.content?.map((p) => p.id).filter((id) => id !== undefined) || []

        this.productBacklogService
          .findAllProductBacklogs({
            page: 0,
            size: 100,
          })
          .subscribe({
            next: (response) => {
              this.productBacklogs =
                response.content?.filter(
                  (backlog) => backlog.projectId !== undefined && ownerProjectIds.includes(backlog.projectId),
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
      },
      error: (error) => {
        console.error("Error loading owner projects:", error)
        this.loading = false
      },
    })
  }

  loadProjects() {
    this.projetService.findAllProjetsByOwner({ page: 0 }).subscribe({
      next: (response) => {
        this.projects = response.content || []
      },
      error: (error) => {
        console.error("Error loading projects:", error)
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

  showAddDialog() {
    this.isEditMode = false
    this.currentBacklog = this.getEmptyBacklog()
    this.displayDialog = true
  }

  editBacklog(backlog: ProductBacklogResponse) {
    this.isEditMode = true
    this.currentBacklog = {
      projetId: backlog.projectId || 0,
    }
    this.displayDialog = true
  }

  deleteBacklog(backlog: ProductBacklogResponse) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the product backlog for "${backlog.projectName}"?`,
      header: "Confirm Delete",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        if (backlog.id) {
          this.productBacklogService.deleteProductBacklog({ "backlog-id": backlog.id }).subscribe({
            next: () => {
              this.messageService.add({
                severity: "success",
                summary: "Success",
                detail: "Product backlog deleted successfully",
              })
              this.loadProductBacklogs()
            },
            error: (error) => {
              console.error("Error deleting product backlog:", error)
              this.messageService.add({
                severity: "error",
                summary: "Error",
                detail: "Failed to delete product backlog",
              })
            },
          })
        }
      },
    })
  }

  saveBacklog() {
    if (this.isFormValid()) {
      if (this.isEditMode) {
        const backlogToEdit = this.productBacklogs.find((b) => b.projectId === this.currentBacklog.projetId)
        if (backlogToEdit && backlogToEdit.id) {
          this.productBacklogService
            .updateProductBacklog({
              "backlog-id": backlogToEdit.id,
              body: this.currentBacklog,
            })
            .subscribe({
              next: () => {
                this.messageService.add({
                  severity: "success",
                  summary: "Success",
                  detail: "Product backlog updated successfully",
                })
                this.displayDialog = false
                this.loadProductBacklogs()
              },
              error: (error) => {
                console.error("Error updating product backlog:", error)
                this.messageService.add({
                  severity: "error",
                  summary: "Error",
                  detail: "Failed to update product backlog",
                })
              },
            })
        }
      } else {
        this.productBacklogService.createProductBacklog({ body: this.currentBacklog }).subscribe({
          next: () => {
            this.messageService.add({
              severity: "success",
              summary: "Success",
              detail: "Product backlog created successfully",
            })
            this.displayDialog = false
            this.loadProductBacklogs()
          },
          error: (error) => {
            console.error("Error creating product backlog:", error)
            this.messageService.add({
              severity: "error",
              summary: "Error",
              detail: "Failed to create product backlog",
            })
          },
        })
      }
    }
  }

  isFormValid(): boolean {
    return !!(this.currentBacklog.projetId && this.currentBacklog.projetId > 0)
  }

  getEmptyBacklog(): any {
    return {
      projetId: 0,
    }
  }

  viewBacklogItems(backlog: ProductBacklogResponse) {
    if (backlog.id) {
      this.router.navigate(["/backlog-items", backlog.id])
    }
  }

  bulkDelete() {
    if (this.selectedBacklogs.length > 0) {
      this.confirmationService.confirm({
        message: `Are you sure you want to delete ${this.selectedBacklogs.length} selected backlogs?`,
        header: "Confirm Bulk Delete",
        icon: "pi pi-exclamation-triangle",
        accept: () => {
          const deletePromises = this.selectedBacklogs
            .filter((backlog) => backlog.id)
            .map((backlog) => this.productBacklogService.deleteProductBacklog({ "backlog-id": backlog.id! }))

          Promise.all(deletePromises)
            .then(() => {
              this.messageService.add({
                severity: "success",
                summary: "Success",
                detail: `${this.selectedBacklogs.length} backlogs deleted successfully`,
              })
              this.selectedBacklogs = []
              this.loadProductBacklogs()
            })
            .catch((error) => {
              console.error("Error in bulk delete:", error)
              this.messageService.add({
                severity: "error",
                summary: "Error",
                detail: "Failed to delete some backlogs",
              })
            })
        },
      })
    }
  }
}
