import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { ButtonModule } from "primeng/button"
import { TableModule } from "primeng/table"
import { DialogModule } from "primeng/dialog"
import { InputTextModule } from "primeng/inputtext"
import { InputTextarea } from "primeng/inputtextarea"
import { DropdownModule } from "primeng/dropdown"
import { CalendarModule } from "primeng/calendar"
import { TagModule } from "primeng/tag"
import { ProgressBarModule } from "primeng/progressbar"
import { CardModule } from "primeng/card"
import { ToastModule } from "primeng/toast"
import { ConfirmDialogModule } from "primeng/confirmdialog"
import { MessageModule } from "primeng/message"
import { ProgressSpinnerModule } from "primeng/progressspinner"
import { MessageService, ConfirmationService } from "primeng/api"
import type { SprintResponse } from "../../../services/models/sprint-response"
import type { SprintRequest } from "../../../services/models/sprint-request"
import  { Router } from "@angular/router"
import  { SprintService } from "../../../services/services/sprint.service"
import  { TokenService } from "../../../services/token/token.service"
import  { HttpClient } from "@angular/common/http"

interface Sprint {
  id: number
  nom: string
  objectif: string
  dateDebut: Date
  dateFin: Date
  statut: "A_FAIRE" | "EN_COURS" | "TERMINE"
  projet?: {
    id: number
    nom: string
  }
  sprintBacklog?: {
    id: number
  }
  createdDate?: Date
  lastModifiedDate?: Date
}

@Component({
  selector: "app-sprints",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    InputTextarea,
    DropdownModule,
    CalendarModule,
    TagModule,
    ProgressBarModule,
    CardModule,
    ToastModule,
    ConfirmDialogModule,
    MessageModule,
    ProgressSpinnerModule,
  ],
  templateUrl: "./all-sprints.component.html",
  styleUrl: "./all-sprints.component.scss",
  providers: [MessageService, ConfirmationService],
})
export class AllSprintsComponent implements OnInit {
  sprints: Sprint[] = []
  displayDialog = false
  sprint: Sprint = this.getEmptySprint()
  isEditMode = false
  selectedSprints: Sprint[] = []
  loading = false
  errorMessage = ""

  searchTerm = ""
  selectedStatusFilter = ""
  showActiveOnly = false

  statusOptions = [
    { label: "À faire", value: "A_FAIRE" },
    { label: "En cours", value: "EN_COURS" },
    { label: "Terminé", value: "TERMINE" },
  ]

  statusFilterOptions = [
    { label: "All Statuses", value: "" },
    { label: "À faire", value: "A_FAIRE" },
    { label: "En cours", value: "EN_COURS" },
    { label: "Terminé", value: "TERMINE" },
  ]

  projectOptions = [
    { label: "Select Project", value: null },
    { label: "Project 1", value: 1 },
    { label: "Project 2", value: 2 },
  ]

  selectedProjectId = 1

  constructor(
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private sprintService: SprintService,
    private tokenService: TokenService,
    private http: HttpClient,
  ) {}

  ngOnInit() {
    this.loadSprints()
  }

  loadSprints() {
    this.loading = true
    this.errorMessage = ""

    if (this.showActiveOnly) {
      this.loadActiveSprints()
      return
    }

    if (this.selectedStatusFilter) {
      this.loadSprintsByStatus()
      return
    }

    if (this.searchTerm.trim()) {
      this.searchSprints()
      return
    }

    this.http
      .get<any>("http://localhost:8088/api/v1/sprints", {
        params: {
          page: "0",
          size: "100",
        },
      })
      .subscribe({
        next: (response) => {
          this.sprints =
            response.content?.map((sprintResponse: SprintResponse) => this.mapSprintResponseToSprint(sprintResponse)) ||
            []
          this.loading = false
        },
        error: (error) => {
          console.error("Error loading sprints:", error)
          this.handleError("Failed to load sprints", error)
          this.loading = false
        },
      })
  }

  loadActiveSprints() {
    this.loading = true

    this.http.get<SprintResponse[]>("http://localhost:8088/api/v1/sprints/active").subscribe({
      next: (response) => {
        this.sprints = response.map((sprintResponse) => this.mapSprintResponseToSprint(sprintResponse))
        this.loading = false
      },
      error: (error) => {
        console.error("Error loading active sprints:", error)
        this.handleError("Failed to load active sprints", error)
        this.loading = false
      },
    })
  }

  loadSprintsByStatus() {
    this.loading = true

    this.http
      .get<any>(`http://localhost:8088/api/v1/sprints/statut/${this.selectedStatusFilter}`, {
        params: {
          page: "0",
          size: "100",
        },
      })
      .subscribe({
        next: (response) => {
          this.sprints =
            response.content?.map((sprintResponse: SprintResponse) => this.mapSprintResponseToSprint(sprintResponse)) ||
            []
          this.loading = false
        },
        error: (error) => {
          console.error("Error loading sprints by status:", error)
          this.handleError("Failed to load sprints by status", error)
          this.loading = false
        },
      })
  }

  searchSprints() {
    this.loading = true

    const params: any = {
      page: "0",
      size: "100",
    }

    if (this.searchTerm.trim()) {
      params.nom = this.searchTerm.trim()
    }

    if (this.selectedStatusFilter) {
      params.statut = this.selectedStatusFilter
    }

    this.http.get<any>("http://localhost:8088/api/v1/sprints/search", { params }).subscribe({
      next: (response) => {
        this.sprints =
          response.content?.map((sprintResponse: SprintResponse) => this.mapSprintResponseToSprint(sprintResponse)) ||
          []
        this.loading = false
      },
      error: (error) => {
        console.error("Error searching sprints:", error)
        this.handleError("Failed to search sprints", error)
        this.loading = false
      },
    })
  }

  private mapSprintResponseToSprint = (sprintResponse: SprintResponse): Sprint => {
    return {
      id: sprintResponse.id || 0,
      nom: sprintResponse.nom || "",
      objectif: sprintResponse.objectif || "",
      dateDebut: sprintResponse.dateDebut ? new Date(sprintResponse.dateDebut) : new Date(),
      dateFin: sprintResponse.dateFin ? new Date(sprintResponse.dateFin) : new Date(),
      statut: sprintResponse.statut || "A_FAIRE",
      projet: sprintResponse.projetId ? { id: sprintResponse.projetId, nom: "" } : undefined,
      sprintBacklog: sprintResponse.sprintBacklogId ? { id: sprintResponse.sprintBacklogId } : undefined,
      // createdDate: sprintResponse.createdDate ? new Date(sprintResponse.createdDate) : new Date(),
    }
  }

  private mapSprintToSprintRequest(sprint: Sprint): SprintRequest {
    const formatDate = (date: Date): string => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      return `${year}-${month}-${day}`
    }

    const request: SprintRequest = {
      nom: sprint.nom.trim(),
      objectif: sprint.objectif.trim(),
      dateDebut: formatDate(sprint.dateDebut),
      dateFin: formatDate(sprint.dateFin),
      projetId: this.selectedProjectId,
    }

    console.log("[v0] Mapped sprint request:", request)
    return request
  }

  getEmptySprint(): Sprint {
    return {
      id: 0,
      nom: "",
      objectif: "",
      dateDebut: new Date(),
      dateFin: new Date(),
      statut: "A_FAIRE",
    }
  }

  showAddDialog() {
    this.sprint = this.getEmptySprint()
    this.isEditMode = false
    this.displayDialog = true
  }

  editSprint(sprint: Sprint) {
    this.sprint = { ...sprint }
    this.isEditMode = true
    this.displayDialog = true
  }

  saveSprint() {
    if (this.isFormValid()) {
      this.loading = true

      if (this.isEditMode) {
        const sprintRequest = this.mapSprintToSprintRequest(this.sprint)
        console.log("[v0] Updating sprint with payload:", sprintRequest)

        this.http
          .put<any>(`http://localhost:8088/api/v1/sprints/${this.sprint.id}`, sprintRequest, {
            headers: {
              "Content-Type": "application/json",
            },
          })
          .subscribe({
            next: (response) => {
              console.log("[v0] Sprint update response:", response)
              this.messageService.add({
                severity: "success",
                summary: "Success",
                detail: "Sprint updated successfully",
              })
              this.displayDialog = false
              this.loadSprints()
              this.loading = false
            },
            error: (error) => {
              console.error("[v0] Error updating sprint:", error)
              this.handleError("Failed to update sprint", error)
              this.loading = false
            },
          })
      } else {
        const sprintRequest = this.mapSprintToSprintRequest(this.sprint)
        console.log("[v0] Creating sprint with payload:", sprintRequest)

        this.http
          .post<any>("http://localhost:8088/api/v1/sprints/add", sprintRequest, {
            headers: {
              "Content-Type": "application/json",
            },
          })
          .subscribe({
            next: (sprintId) => {
              console.log("[v0] Sprint create response:", sprintId)
              this.messageService.add({
                severity: "success",
                summary: "Success",
                detail: "Sprint created successfully",
              })
              this.displayDialog = false
              this.loadSprints()
              this.loading = false
            },
            error: (error) => {
              console.error("[v0] Error creating sprint:", error)
              this.handleError("Failed to create sprint", error)
              this.loading = false
            },
          })
      }
    } else {
      this.messageService.add({
        severity: "warn",
        summary: "Validation Error",
        detail: "Please fill in all required fields and ensure the end date is after the start date.",
        life: 5000,
      })
    }
  }

  deleteSprint(sprint: Sprint) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${sprint.nom}"? 
      
      Warning: This sprint may have related data (user stories, tasks, etc.) that must be removed first. If the deletion fails, please remove all related data before trying again.`,
      header: "Confirm Delete",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.loading = true

        console.log("[v0] Deleting sprint with ID:", sprint.id)

        this.http.delete(`http://localhost:8088/api/v1/sprints/${sprint.id}`).subscribe({
          next: (response) => {
            console.log("[v0] Sprint delete response:", response)
            this.messageService.add({
              severity: "success",
              summary: "Success",
              detail: "Sprint deleted successfully",
            })
            this.loadSprints()
            this.loading = false
          },
          error: (error) => {
            console.error("[v0] Error deleting sprint:", error)
            this.handleError("Failed to delete sprint", error)
            this.loading = false
          },
        })
      },
    })
  }

  changeSprintStatus(sprint: Sprint, newStatus: "A_FAIRE" | "EN_COURS" | "TERMINE") {
    this.loading = true

    console.log("[v0] Changing sprint status for ID:", sprint.id, "to:", newStatus)

    this.http
      .patch(`http://localhost:8088/api/v1/sprints/${sprint.id}/statut`, null, {
        params: { statut: newStatus },
      })
      .subscribe({
        next: (response) => {
          console.log("[v0] Status change response:", response)
          this.messageService.add({
            severity: "success",
            summary: "Success",
            detail: `Sprint status changed to ${this.getStatusLabel(newStatus)}`,
          })
          this.loadSprints()
          this.loading = false
        },
        error: (error) => {
          console.error("[v0] Error changing sprint status:", error)
          this.handleError("Failed to change sprint status", error)
          this.loading = false
        },
      })
  }

  private handleError(message: string, error: any) {
    let errorMessage = message

    if (error.error?.error && error.error.error.includes("TransientObjectException")) {
      errorMessage =
        "Cannot perform operation: This sprint has related data (user stories, tasks, or backlog items) that must be removed first. Please clean up all related data before trying again."
    } else if (error.error?.businessErrorDescription) {
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

  isFormValid(): boolean {
    const isNameValid = typeof this.sprint.nom === "string" && this.sprint.nom.trim().length >= 3
    const isGoalValid = typeof this.sprint.objectif === "string" && this.sprint.objectif.trim().length >= 5
    const isStartDateValid = this.sprint.dateDebut instanceof Date
    const isEndDateValid = this.sprint.dateFin instanceof Date
    const isDateRangeValid = isStartDateValid && isEndDateValid && this.sprint.dateDebut < this.sprint.dateFin

    return Boolean(isNameValid && isGoalValid && isDateRangeValid)
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case "A_FAIRE":
        return "info"
      case "EN_COURS":
        return "success"
      case "TERMINE":
        return "success"
      default:
        return "info"
    }
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  getActiveSprints(): Sprint[] {
    return this.sprints.filter((s) => s.statut === "EN_COURS")
  }

  getPlannedSprints(): Sprint[] {
    return this.sprints.filter((s) => s.statut === "A_FAIRE")
  }

  getCompletedSprints(): Sprint[] {
    return this.sprints.filter((s) => s.statut === "TERMINE")
  }

  getStatusLabel(apiStatus: string): string {
    switch (apiStatus) {
      case "A_FAIRE":
        return "À faire"
      case "EN_COURS":
        return "En cours"
      case "TERMINE":
        return "Terminé"
      default:
        return "À faire"
    }
  }

  clearError() {
    this.errorMessage = ""
  }

  confirmDelete(sprint: Sprint) {
    this.deleteSprint(sprint)
  }

  goBack() {
    this.router.navigate(["/"])
  }

  onSearchChange() {
    this.loadSprints()
  }

  onStatusFilterChange() {
    this.loadSprints()
  }

  onActiveFilterChange() {
    this.loadSprints()
  }

  clearFilters() {
    this.searchTerm = ""
    this.selectedStatusFilter = ""
    this.showActiveOnly = false
    this.loadSprints()
  }

  deleteSelectedSprints() {
    if (this.selectedSprints.length === 0) {
      this.messageService.add({
        severity: "warn",
        summary: "Warning",
        detail: "Please select sprints to delete",
      })
      return
    }

    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${this.selectedSprints.length} selected sprint(s)?`,
      header: "Confirm Bulk Delete",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.loading = true
        let deletedCount = 0
        let errorCount = 0

        this.selectedSprints.forEach((sprint, index) => {
          this.http.delete(`http://localhost:8088/api/v1/sprints/${sprint.id}`).subscribe({
            next: () => {
              deletedCount++
              if (deletedCount + errorCount === this.selectedSprints.length) {
                this.finalizeBulkDelete(deletedCount, errorCount)
              }
            },
            error: (error) => {
              console.error(`Error deleting sprint ${sprint.nom}:`, error)
              errorCount++
              if (deletedCount + errorCount === this.selectedSprints.length) {
                this.finalizeBulkDelete(deletedCount, errorCount)
              }
            },
          })
        })
      },
    })
  }

  private finalizeBulkDelete(deletedCount: number, errorCount: number) {
    this.selectedSprints = []
    this.loading = false
    this.loadSprints()

    if (deletedCount > 0) {
      this.messageService.add({
        severity: "success",
        summary: "Success",
        detail: `${deletedCount} sprint(s) deleted successfully`,
      })
    }

    if (errorCount > 0) {
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: `Failed to delete ${errorCount} sprint(s). They may have related data that needs to be removed first.`,
      })
    }
  }

  viewSprintDetails(sprint: Sprint) {
    // Navigate to sprint details page or show details dialog
    this.router.navigate(["/sprints", sprint.id])
  }
}
