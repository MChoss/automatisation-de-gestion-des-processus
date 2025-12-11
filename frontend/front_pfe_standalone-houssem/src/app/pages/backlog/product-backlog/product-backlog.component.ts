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
import  { Router, ActivatedRoute } from "@angular/router"
import  { ProductBacklogService } from "../../../services/services/product-backlog.service"
import  { BacklogItemService } from "../../../services/services/backlog-item.service"
import type { ProductBacklogResponse } from "../../../services/models/product-backlog-response"
import type { ProductBacklogRequest } from "../../../services/models/product-backlog-request"
import type { BacklogItemResponse } from "../../../services/models/backlog-item-response"
import type { BacklogItemRequest } from "../../../services/models/backlog-item-request"
import  { ProjetService } from "../../../services/services/projet.service"
import type { ProjetResponse } from "../../../services/models/projet-response"
import { TooltipModule } from "primeng/tooltip"

@Component({
  selector: "app-product-backlog",
  standalone: true,
  imports: [
    CommonModule,
    TooltipModule,
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
  templateUrl: "./product-backlog.component.html",
  styleUrl: "./product-backlog.component.scss",
  providers: [MessageService, ConfirmationService],
})
export class ProductBacklogComponent implements OnInit {
  productBacklogs: ProductBacklogResponse[] = []
  selectedBacklogs: ProductBacklogResponse[] = []
  displayDialog = false
  isEditMode = false
  currentBacklog: ProductBacklogRequest = this.getEmptyBacklog()
  projects: ProjetResponse[] = []
  loading = false
  totalRecords = 0
  currentPage = 0
  pageSize = 10
  projectId: number | null = null
  currentProject: ProjetResponse | null = null
  singleProjectMode = false

  backlogItems: BacklogItemResponse[] = []
  selectedItems: BacklogItemResponse[] = []
  displayItemDialog = false
  isEditItemMode = false
  currentItem: BacklogItemRequest = this.getEmptyItem()
  itemsLoading = false
  totalItemRecords = 0
  currentItemPage = 0
  itemPageSize = 10
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
    private confirmationService: ConfirmationService,
    private productBacklogService: ProductBacklogService,
    private backlogItemService: BacklogItemService,
    private projetService: ProjetService,
  ) {}

  ngOnInit() {
    const projectIdParam = this.route.snapshot.paramMap.get("id")
    if (projectIdParam) {
      this.projectId = Number(projectIdParam)
      this.singleProjectMode = true
      this.loadProjectDetails()
      this.loadProjectBacklog()
    } else {
      this.loadProductBacklogs()
    }
    this.loadProjects()
  }

  loadProjectDetails() {
    if (this.projectId) {
      this.projetService.findProjetById({ "projet-id": this.projectId }).subscribe({
        next: (project) => {
          this.currentProject = project
        },
        error: (error) => {
          console.error("Error loading project details:", error)
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "Failed to load project details",
          })
        },
      })
    }
  }

  loadProjectBacklog() {
    if (this.projectId) {
      this.loading = true
      this.productBacklogService.findProductBacklogByProjectId({ "project-id": this.projectId }).subscribe({
        next: (backlog) => {
          this.productBacklogs = [backlog]
          this.totalRecords = 1
          this.loading = false
          if (backlog.id) {
            this.loadBacklogItems(backlog.id)
          }
        },
        error: (error) => {
          console.error("Error loading project backlog:", error)
          this.productBacklogs = []
          this.totalRecords = 0
          this.loading = false
          if (error.status === 404) {
            this.messageService.add({
              severity: "info",
              summary: "No Backlog Found",
              detail: "This project does not have a product backlog yet. You can create one.",
            })
          } else {
            this.messageService.add({
              severity: "error",
              summary: "Error",
              detail: "Failed to load product backlog",
            })
          }
        },
      })
    }
  }

  loadBacklogItems(productBacklogId: number) {
    this.itemsLoading = true
    this.backlogItemService
      .findByProductBacklog({
        "product-backlog-id": productBacklogId,
        page: this.currentItemPage,
        size: this.itemPageSize,
      })
      .subscribe({
        next: (response) => {
          this.backlogItems = response.content || []
          this.totalItemRecords = response.totalElements || 0
          this.itemsLoading = false
        },
        error: (error) => {
          console.error("Error loading backlog items:", error)
          this.backlogItems = []
          this.totalItemRecords = 0
          this.itemsLoading = false
        },
      })
  }

  loadProductBacklogs() {
    this.loading = true
    const currentUserId = this.getCurrentUserId()

    this.projetService.findAllProjetsByOwner({ page: 0 }).subscribe({
      next: (projectsResponse) => {
        const ownerProjectIds = projectsResponse.content?.map((p) => p.id).filter((id) => id !== undefined) || []

        this.productBacklogService
          .findAllProductBacklogs({
            page: this.currentPage,
            size: this.pageSize,
          })
          .subscribe({
            next: (response) => {
              // Filter backlogs to only show those belonging to owner's projects
              this.productBacklogs =
                response.content?.filter(
                  (backlog) => backlog.projectId !== undefined && ownerProjectIds.includes(backlog.projectId),
                ) || []
              this.totalRecords = this.productBacklogs.length
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
    if (this.singleProjectMode && this.projectId) {
      this.currentBacklog.projetId = this.projectId
    }
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
              if (this.singleProjectMode) {
                this.loadProjectBacklog()
              } else {
                this.loadProductBacklogs()
              }
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
                if (this.singleProjectMode) {
                  this.loadProjectBacklog()
                } else {
                  this.loadProductBacklogs()
                }
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
            if (this.singleProjectMode) {
              this.loadProjectBacklog()
            } else {
              this.loadProductBacklogs()
            }
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

  getEmptyBacklog(): ProductBacklogRequest {
    return {
      projetId: 0,
    }
  }

  goBack() {
    if (this.singleProjectMode && this.projectId) {
      this.router.navigate(["/projects_details", this.projectId])
    } else {
      this.router.navigate(["/projet"])
    }
  }

  exportBacklog() {
    this.messageService.add({
      severity: "info",
      summary: "Export",
      detail: "Backlog export functionality coming soon",
    })
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
              if (this.singleProjectMode) {
                this.loadProjectBacklog()
              } else {
                this.loadProductBacklogs()
              }
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

  onPageChange(event: any) {
    this.currentPage = event.page
    this.pageSize = event.rows
    if (this.singleProjectMode) {
      this.loadProjectBacklog()
    } else {
      this.loadProductBacklogs()
    }
  }

  getProjectName(projectId: number): string {
    const project = this.projects.find((p) => p.id === projectId)
    return project ? project.nom || "Unknown Project" : "Unknown Project"
  }

  viewBacklogItems(backlog: ProductBacklogResponse) {
    if (backlog.id) {
      this.router.navigate(["/backlog-items", backlog.id])
    }
  }

  showAddItemDialog() {
    if (this.productBacklogs.length > 0 && this.productBacklogs[0].id) {
      this.isEditItemMode = false
      this.currentItem = this.getEmptyItem()
      this.currentItem.productBacklogId = this.productBacklogs[0].id
      this.displayItemDialog = true
    }
  }

  editItem(item: BacklogItemResponse) {
    this.isEditItemMode = true
    this.currentItem = {
      titre: item.titre || "",
      description: item.description || "",
      priorite: item.priorite || 1,
      points: item.points || 0,
      statut: item.statut || "A_FAIRE",
      productBacklogId: item.productBacklogId || 0,
    }
    this.displayItemDialog = true
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
              this.refreshItems()
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
    if (this.isItemFormValid()) {
      if (this.isEditItemMode) {
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
                this.displayItemDialog = false
                this.refreshItems()
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
            this.displayItemDialog = false
            this.refreshItems()
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
            this.refreshItems()
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
            this.refreshItems()
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

  refreshItems() {
    if (this.productBacklogs.length > 0 && this.productBacklogs[0].id) {
      this.loadBacklogItems(this.productBacklogs[0].id)
    }
  }

  isItemFormValid(): boolean {
    return !!(
      this.currentItem.titre?.trim() &&
      this.currentItem.productBacklogId &&
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

  getTotalItemsCount(): number {
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

  onItemPageChange(event: any) {
    this.currentItemPage = event.page
    this.itemPageSize = event.rows
    this.refreshItems()
  }

  bulkDeleteItems() {
    if (this.selectedItems.length > 0) {
      this.confirmationService.confirm({
        message: `Are you sure you want to delete ${this.selectedItems.length} selected items?`,
        header: "Confirm Bulk Delete",
        icon: "pi pi-exclamation-triangle",
        accept: () => {
          const deletePromises = this.selectedItems
            .filter((item) => item.id)
            .map((item) => this.backlogItemService.deleteBacklogItem({ "backlog-item-id": item.id! }))

          Promise.all(deletePromises)
            .then(() => {
              this.messageService.add({
                severity: "success",
                summary: "Success",
                detail: `${this.selectedItems.length} items deleted successfully`,
              })
              this.selectedItems = []
              this.refreshItems()
            })
            .catch((error) => {
              console.error("Error in bulk delete:", error)
              this.messageService.add({
                severity: "error",
                summary: "Error",
                detail: "Failed to delete some items",
              })
            })
        },
      })
    }
  }

  private getCurrentUserId(): number | null {
    return null
  }
}
