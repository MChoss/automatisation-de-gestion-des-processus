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
import type { BacklogItemResponse, BacklogItemRequest, ProductBacklogResponse } from "../../services/models"
import  { BacklogItemService, ProductBacklogService } from "../../services/services"

@Component({
  selector: "app-backlog-items",
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
  templateUrl: "./backlogitems.component.html",
  styleUrl: "./backlogitems.component.scss",
  providers: [MessageService, ConfirmationService],
})
export class BacklogItemsComponent implements OnInit {
  backlogItems: BacklogItemResponse[] = []
  selectedItems: BacklogItemResponse[] = []
  displayDialog = false
  isEditMode = false
  currentItem: BacklogItemRequest = this.getEmptyItem()
  productBacklogs: ProductBacklogResponse[] = []
  currentProductBacklogId: number | null = null
  currentProductBacklog: ProductBacklogResponse | null = null
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
    private confirmationService: ConfirmationService,
    private backlogItemService: BacklogItemService,
    private productBacklogService: ProductBacklogService,
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      if (params["id"]) {
        this.currentProductBacklogId = +params["id"]
        this.loadProductBacklog()
        this.loadBacklogItems()
      } else {
        this.loadAllBacklogItems()
      }
    })
    this.loadProductBacklogs()
  }

  loadProductBacklog() {
    if (this.currentProductBacklogId) {
      this.productBacklogService
        .findProductBacklogById({
          "backlog-id": this.currentProductBacklogId,
        })
        .subscribe({
          next: (backlog) => {
            this.currentProductBacklog = backlog
          },
          error: (error) => {
            console.error("Error loading product backlog:", error)
          },
        })
    }
  }

  loadBacklogItems() {
    this.loading = true
    if (this.currentProductBacklogId) {
      this.backlogItemService
        .findByProductBacklog({
          "product-backlog-id": this.currentProductBacklogId,
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

  showAddDialog() {
    this.isEditMode = false
    this.currentItem = this.getEmptyItem()
    if (this.currentProductBacklogId) {
      this.currentItem.productBacklogId = this.currentProductBacklogId
    }
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
    if (this.isFormValid()) {
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
            this.displayDialog = false
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
      this.refreshItems()
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
      this.refreshItems()
    }
  }

  clearFilters() {
    this.searchTerm = ""
    this.filterStatus = null
    this.refreshItems()
  }

  refreshItems() {
    if (this.currentProductBacklogId) {
      this.loadBacklogItems()
    } else {
      this.loadAllBacklogItems()
    }
  }

  isFormValid(): boolean {
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

  getProductBacklogName(id: number): string {
    const backlog = this.productBacklogs.find((b) => b.id === id)
    return backlog ? backlog.projectName || "Unknown" : "Unknown"
  }

  goBack() {
    if (this.currentProductBacklogId && this.currentProductBacklog?.projectId) {
      this.router.navigate(["/product-backlog", this.currentProductBacklog.projectId])
    } else {
      this.router.navigate(["/product_backlog"])
    }
  }

  bulkDelete() {
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

  onPageChange(event: any) {
    this.currentPage = event.page
    this.pageSize = event.rows
    this.refreshItems()
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
