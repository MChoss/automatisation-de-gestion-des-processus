import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { ButtonModule } from "primeng/button"
import { TableModule } from "primeng/table"
import { DialogModule } from "primeng/dialog"
import { InputTextModule } from "primeng/inputtext"
import { DropdownModule } from "primeng/dropdown"
import { TagModule } from "primeng/tag"
import { ProgressBarModule } from "primeng/progressbar"
import { CardModule } from "primeng/card"
import { ToastModule } from "primeng/toast"
import { ConfirmDialogModule } from "primeng/confirmdialog"
import { MessageModule } from "primeng/message"
import { ProgressSpinnerModule } from "primeng/progressspinner"
import { MessageService, ConfirmationService } from "primeng/api"
import { AppTopbar } from "../../layout/component/app.topbar"
import { AppSidebar } from "../../layout/component/app.sidebar"
import type { SprintBacklogResponse } from "../../services/models/sprint-backlog-response"
import type { SprintBacklogRequest } from "../../services/models/sprint-backlog-request"
import  { Router } from "@angular/router"
import  { HttpClient } from "@angular/common/http"

interface SprintBacklog {
  id: number
  productBacklog?: {
    id: number
    nom: string
  }
  sprints?: Array<{
    id: number
    nom: string
    statut: string
  }>
  userStories?: Array<{
    id: number
    titre: string
    statut: string
    points: number
  }>
  totalUserStories: number
  completedUserStories: number
  totalStoryPoints: number
  completedStoryPoints: number
  completionPercentage: number
  storyPointsCompletionPercentage: number
}

@Component({
  selector: "app-sprintbacklog",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppTopbar,
    AppSidebar,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    TagModule,
    ProgressBarModule,
    CardModule,
    ToastModule,
    ConfirmDialogModule,
    MessageModule,
    ProgressSpinnerModule,
  ],
  templateUrl: "./sprintbacklog.component.html",
  styleUrl: "./sprintbacklog.component.scss",
  providers: [MessageService, ConfirmationService],
})
export class SprintBacklogComponent implements OnInit {
  sprintBacklogs: SprintBacklog[] = []
  displayDialog = false
  sprintBacklog: SprintBacklog = this.getEmptySprintBacklog()
  isEditMode = false
  selectedSprintBacklogs: SprintBacklog[] = []
  loading = false
  errorMessage = ""

  searchTerm = ""
  selectedProductBacklogFilter = ""

  productBacklogOptions = [
    { label: "All Product Backlogs", value: "" },
    { label: "Product Backlog 1", value: 1 },
    { label: "Product Backlog 2", value: 2 },
  ]

  selectedProductBacklogId = 1
  selectedSprintId = 1

  constructor(
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private http: HttpClient,
  ) {}

  ngOnInit() {
    this.loadSprintBacklogs()
  }

  loadSprintBacklogs() {
    this.loading = true
    this.errorMessage = ""

    if (this.searchTerm.trim()) {
      this.searchSprintBacklogs()
      return
    }

    this.http
      .get<any>("http://localhost:8088/api/v1/sprint-backlogs", {
        params: {
          page: "0",
          size: "100",
        },
      })
      .subscribe({
        next: (response) => {
          this.sprintBacklogs =
            response.content?.map((sprintBacklogResponse: SprintBacklogResponse) =>
              this.mapSprintBacklogResponseToSprintBacklog(sprintBacklogResponse),
            ) || []
          this.loading = false
        },
        error: (error) => {
          console.error("Error loading sprint backlogs:", error)
          this.handleError("Failed to load sprint backlogs", error)
          this.loading = false
        },
      })
  }

  searchSprintBacklogs() {
    this.loading = true

    const params: any = {
      page: "0",
      size: "100",
    }

    if (this.searchTerm.trim()) {
      params.search = this.searchTerm.trim()
    }

    if (this.selectedProductBacklogFilter) {
      params.productBacklogId = this.selectedProductBacklogFilter
    }

    this.http.get<any>("http://localhost:8088/api/v1/sprint-backlogs", { params }).subscribe({
      next: (response) => {
        this.sprintBacklogs =
          response.content?.map((sprintBacklogResponse: SprintBacklogResponse) =>
            this.mapSprintBacklogResponseToSprintBacklog(sprintBacklogResponse),
          ) || []
        this.loading = false
      },
      error: (error) => {
        console.error("Error searching sprint backlogs:", error)
        this.handleError("Failed to search sprint backlogs", error)
        this.loading = false
      },
    })
  }

  private mapSprintBacklogResponseToSprintBacklog = (sprintBacklogResponse: SprintBacklogResponse): SprintBacklog => {
    return {
      id: sprintBacklogResponse.id || 0,
      productBacklog: sprintBacklogResponse.productBacklog
        ? {
            id: sprintBacklogResponse.productBacklog.id || 0,
            nom: sprintBacklogResponse.productBacklog.projectName || "",
          }
        : undefined,
      sprints: sprintBacklogResponse.sprints
        ? sprintBacklogResponse.sprints.map(sprint => ({
            id: sprint.id ?? 0,
            nom: sprint.nom ?? "",
            statut: sprint.statut ?? ""
          }))
        : [],
      userStories: sprintBacklogResponse.userStories
        ? sprintBacklogResponse.userStories.map(us => ({
            id: us.id ?? 0,
            titre: us.titre ?? "",
            statut: us.statut ?? "",
            points: us.points ?? 0
          }))
        : [],
      totalUserStories: sprintBacklogResponse.totalUserStories || 0,
      completedUserStories: sprintBacklogResponse.completedUserStories || 0,
      totalStoryPoints: sprintBacklogResponse.totalStoryPoints || 0,
      completedStoryPoints: sprintBacklogResponse.completedStoryPoints || 0,
      completionPercentage: sprintBacklogResponse.completionPercentage || 0,
      storyPointsCompletionPercentage: sprintBacklogResponse.storyPointsCompletionPercentage || 0,
    }
  }

  private mapSprintBacklogToSprintBacklogRequest(sprintBacklog: SprintBacklog): SprintBacklogRequest {
    const request: SprintBacklogRequest = {
      productBacklogId: this.selectedProductBacklogId,
      sprintId: this.selectedSprintId, // Required field
      userStoryIds: sprintBacklog.userStories?.map((us) => us.id) || [],
    }

    console.log("[v0] Mapped sprint backlog request:", request)
    return request
  }

  getEmptySprintBacklog(): SprintBacklog {
    return {
      id: 0,
      totalUserStories: 0,
      completedUserStories: 0,
      totalStoryPoints: 0,
      completedStoryPoints: 0,
      completionPercentage: 0,
      storyPointsCompletionPercentage: 0,
    }
  }

  showAddDialog() {
    this.sprintBacklog = this.getEmptySprintBacklog()
    this.isEditMode = false
    this.displayDialog = true
  }

  editSprintBacklog(sprintBacklog: SprintBacklog) {
    this.sprintBacklog = { ...sprintBacklog }
    this.isEditMode = true
    this.displayDialog = true
  }

  saveSprintBacklog() {
    this.loading = true

    if (this.isEditMode) {
      // Update functionality would go here if supported by backend
      this.messageService.add({
        severity: "warn",
        summary: "Not Implemented",
        detail: "Update functionality not yet implemented",
      })
      this.loading = false
    } else {
      const sprintBacklogRequest = this.mapSprintBacklogToSprintBacklogRequest(this.sprintBacklog)
      console.log("[v0] Creating sprint backlog with payload:", sprintBacklogRequest)

      this.http
        .post<any>("http://localhost:8088/api/v1/sprint-backlogs", sprintBacklogRequest, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .subscribe({
          next: (sprintBacklogId) => {
            console.log("[v0] Sprint backlog create response:", sprintBacklogId)
            this.messageService.add({
              severity: "success",
              summary: "Success",
              detail: "Sprint backlog created successfully",
            })
            this.displayDialog = false
            this.loadSprintBacklogs()
            this.loading = false
          },
          error: (error) => {
            console.error("[v0] Error creating sprint backlog:", error)
            this.handleError("Failed to create sprint backlog", error)
            this.loading = false
          },
        })
    }
  }

  deleteSprintBacklog(sprintBacklog: SprintBacklog) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete this sprint backlog? 
      
      Warning: This will remove all associated user stories and sprints from this backlog.`,
      header: "Confirm Delete",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.loading = true

        console.log("[v0] Deleting sprint backlog with ID:", sprintBacklog.id)

        this.http.delete(`http://localhost:8088/api/v1/sprint-backlogs/${sprintBacklog.id}`).subscribe({
          next: (response) => {
            console.log("[v0] Sprint backlog delete response:", response)
            this.messageService.add({
              severity: "success",
              summary: "Success",
              detail: "Sprint backlog deleted successfully",
            })
            this.loadSprintBacklogs()
            this.loading = false
          },
          error: (error) => {
            console.error("[v0] Error deleting sprint backlog:", error)
            this.handleError("Failed to delete sprint backlog", error)
            this.loading = false
          },
        })
      },
    })
  }

  addUserStoryToBacklog(sprintBacklogId: number, userStoryId: number) {
    this.loading = true

    this.http
      .post(`http://localhost:8088/api/v1/sprint-backlogs/${sprintBacklogId}/user-stories/${userStoryId}`, {})
      .subscribe({
        next: (response) => {
          this.messageService.add({
            severity: "success",
            summary: "Success",
            detail: "User story added to sprint backlog",
          })
          this.loadSprintBacklogs()
          this.loading = false
        },
        error: (error) => {
          console.error("[v0] Error adding user story to backlog:", error)
          this.handleError("Failed to add user story to backlog", error)
          this.loading = false
        },
      })
  }

  removeUserStoryFromBacklog(sprintBacklogId: number, userStoryId: number) {
    this.loading = true

    this.http
      .delete(`http://localhost:8088/api/v1/sprint-backlogs/${sprintBacklogId}/user-stories/${userStoryId}`)
      .subscribe({
        next: (response) => {
          this.messageService.add({
            severity: "success",
            summary: "Success",
            detail: "User story removed from sprint backlog",
          })
          this.loadSprintBacklogs()
          this.loading = false
        },
        error: (error) => {
          console.error("[v0] Error removing user story from backlog:", error)
          this.handleError("Failed to remove user story from backlog", error)
          this.loading = false
        },
      })
  }

  private handleError(message: string, error: any) {
    let errorMessage = message

    if (error.error?.businessErrorDescription) {
      errorMessage = error.error.businessErrorDescription
    } else if (error.error?.message) {
      errorMessage = error.error.message
    } else if (error.status === 500) {
      errorMessage = "Server error occurred. Please try again or contact your administrator."
    }

    this.errorMessage = errorMessage
    this.messageService.add({
      severity: "error",
      summary: "Error",
      detail: errorMessage,
      life: 8000,
    })
  }

  getCompletionSeverity(percentage: number): string {
    if (percentage >= 80) return "success"
    if (percentage >= 50) return "warning"
    return "danger"
  }

  clearError() {
    this.errorMessage = ""
  }

  confirmDelete(sprintBacklog: SprintBacklog) {
    this.deleteSprintBacklog(sprintBacklog)
  }

  goBack() {
    this.router.navigate(["/"])
  }

  onSearchChange() {
    this.loadSprintBacklogs()
  }

  onProductBacklogFilterChange() {
    this.loadSprintBacklogs()
  }

  clearFilters() {
    this.searchTerm = ""
    this.selectedProductBacklogFilter = ""
    this.loadSprintBacklogs()
  }

  deleteSelectedSprintBacklogs() {
    if (this.selectedSprintBacklogs.length === 0) {
      this.messageService.add({
        severity: "warn",
        summary: "Warning",
        detail: "Please select sprint backlogs to delete",
      })
      return
    }

    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${this.selectedSprintBacklogs.length} selected sprint backlog(s)?`,
      header: "Confirm Bulk Delete",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.loading = true
        let deletedCount = 0
        let errorCount = 0

        this.selectedSprintBacklogs.forEach((sprintBacklog) => {
          this.http.delete(`http://localhost:8088/api/v1/sprint-backlogs/${sprintBacklog.id}`).subscribe({
            next: () => {
              deletedCount++
              if (deletedCount + errorCount === this.selectedSprintBacklogs.length) {
                this.finalizeBulkDelete(deletedCount, errorCount)
              }
            },
            error: (error) => {
              console.error(`Error deleting sprint backlog ${sprintBacklog.id}:`, error)
              errorCount++
              if (deletedCount + errorCount === this.selectedSprintBacklogs.length) {
                this.finalizeBulkDelete(deletedCount, errorCount)
              }
            },
          })
        })
      },
    })
  }

  private finalizeBulkDelete(deletedCount: number, errorCount: number) {
    this.selectedSprintBacklogs = []
    this.loading = false
    this.loadSprintBacklogs()

    if (deletedCount > 0) {
      this.messageService.add({
        severity: "success",
        summary: "Success",
        detail: `${deletedCount} sprint backlog(s) deleted successfully`,
      })
    }

    if (errorCount > 0) {
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: `Failed to delete ${errorCount} sprint backlog(s).`,
      })
    }
  }

  viewSprintBacklogDetails(sprintBacklog: SprintBacklog) {
    this.router.navigate(["/sprintbacklog", sprintBacklog.id])
  }
}
