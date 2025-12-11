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
import { TooltipModule } from "primeng/tooltip"
import { MessageService, ConfirmationService } from "primeng/api"
import  { Router, ActivatedRoute } from "@angular/router"
import type {
  ProductBacklogResponse,
  ProjetResponse,
  BacklogItemResponse,
  ProductBacklogRequest,
  BacklogItemRequest,
} from "../../../services/models"
import  { ProductBacklogService, ProjetService } from "../../../services/services"
import  { BacklogItemService } from "../../../services/services/backlog-item.service"
import  { AuthService } from "../../../services/auth.service"

@Component({
  selector: "app-product-backlog-readonly",
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
    TooltipModule,
  ],
  templateUrl: "../product-backlog/product-backlog.component.html",
  styleUrl: "../product-backlog/product-backlog.component.scss",
  providers: [MessageService, ConfirmationService],
})
export class ProductBacklogReadonlyComponent implements OnInit {
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

  isReadOnly = true
  selectedBacklog: ProductBacklogResponse = {}

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
    private authService: AuthService,
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
    if (this.authService.isScrumMaster()) {
      const userId = this.authService.getUserId()
      if (userId) {
        this.projetService.findAllProjetsByScrumMasterId({ "scrum-master-id": userId }).subscribe({
          next: (response) => {
            const projects: ProjetResponse[] = response.content ?? []
            const backlogPromises = projects
              .filter((p: ProjetResponse) => p.id)
              .map((p: ProjetResponse) =>
                this.productBacklogService
                  .findProductBacklogByProjectId({ "project-id": p.id! })
                  .toPromise()
                  .catch(() => null),
              )

            Promise.all(backlogPromises).then((backlogs) => {
              this.productBacklogs = backlogs.filter((b) => b !== null) as ProductBacklogResponse[]
              this.totalRecords = this.productBacklogs.length
              this.loading = false
            })
          },
          error: (error: any) => {
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
    }
  }

  loadProjects() {
    if (this.authService.isScrumMaster()) {
      const userId = this.authService.getUserId()
      if (userId) {
        this.projetService.findAllProjetsByScrumMasterId({ "scrum-master-id": userId }).subscribe({
          next: (response) => {
            this.projects = response.content || []
          },
          error: (error) => {
            console.error("Error loading projects:", error)
          },
        })
      }
    }
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
      summary: "Read Only",
      detail: "Scrum Masters can only view backlogs",
    })
  }

  bulkDelete() {
    this.messageService.add({
      severity: "info",
      summary: "Read Only",
      detail: "Scrum Masters cannot delete backlogs",
    })
  }

  bulkDeleteItems() {
    this.messageService.add({
      severity: "info",
      summary: "Read Only",
      detail: "Scrum Masters cannot delete items",
    })
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

  onItemPageChange(event: any) {
    this.currentItemPage = event.page
    this.itemPageSize = event.rows
    this.refreshItems()
  }

  refreshItems() {
    if (this.productBacklogs.length > 0 && this.productBacklogs[0].id) {
      this.loadBacklogItems(this.productBacklogs[0].id)
    }
  }

  viewBacklogItems(backlog: ProductBacklogResponse) {
    if (backlog.id) {
      this.router.navigate(["/backlog-items", backlog.id])
    }
  }

  showAddItemDialog() {
    this.messageService.add({
      severity: "info",
      summary: "Read Only",
      detail: "Scrum Masters can only view items",
    })
  }

  editItem(item: BacklogItemResponse) {
    this.messageService.add({
      severity: "info",
      summary: "Read Only",
      detail: "Scrum Masters cannot edit items",
    })
  }

  deleteItem(item: BacklogItemResponse) {
    this.messageService.add({
      severity: "info",
      summary: "Read Only",
      detail: "Scrum Masters cannot delete items",
    })
  }

  saveItem() {
    this.messageService.add({
      severity: "info",
      summary: "Read Only",
      detail: "Scrum Masters cannot save items",
    })
  }

  changeStatus(item: BacklogItemResponse, newStatus: "EN_COURS" | "TERMINE" | "A_FAIRE") {
    this.messageService.add({
      severity: "info",
      summary: "Read Only",
      detail: "Scrum Masters cannot change item status",
    })
  }

  updatePriority(item: BacklogItemResponse, newPriority: number) {
    this.messageService.add({
      severity: "info",
      summary: "Read Only",
      detail: "Scrum Masters cannot update item priority",
    })
  }

  isFormValid(): boolean {
    return !!(this.currentBacklog.projetId && this.currentBacklog.projetId > 0)
  }

  isItemFormValid(): boolean {
    return !!(
      this.currentItem.titre?.trim() &&
      this.currentItem.productBacklogId &&
      this.currentItem.priorite &&
      this.currentItem.priorite > 0
    )
  }

  getEmptyBacklog(): ProductBacklogRequest {
    return {
      projetId: 0,
    }
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

  hideDialog() {
    this.displayDialog = false
    this.selectedBacklog = {}
    this.isEditMode = false
  }

  showAddDialog() {
    this.messageService.add({
      severity: "info",
      summary: "Read Only",
      detail: "Scrum Masters can only view product backlogs",
    })
  }

  editBacklog(backlog: ProductBacklogResponse) {
    this.messageService.add({
      severity: "info",
      summary: "Read Only",
      detail: "Scrum Masters cannot edit product backlogs",
    })
  }

  deleteBacklog(backlog: ProductBacklogResponse) {
    this.messageService.add({
      severity: "info",
      summary: "Read Only",
      detail: "Scrum Masters cannot delete product backlogs",
    })
  }

  saveBacklog() {
    this.messageService.add({
      severity: "info",
      summary: "Read Only",
      detail: "Scrum Masters cannot save product backlogs",
    })
  }
}
