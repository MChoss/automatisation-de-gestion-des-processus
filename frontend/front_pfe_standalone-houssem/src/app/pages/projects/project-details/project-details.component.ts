import { Component, type OnInit } from "@angular/core"
import  { ActivatedRoute, Router } from "@angular/router"
import {  Location, CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"

import { ButtonModule } from "primeng/button"
import { InputTextModule } from "primeng/inputtext"
import { InputTextarea } from "primeng/inputtextarea"
import { DropdownModule } from "primeng/dropdown"
import { ToastModule } from "primeng/toast"
import { ConfirmDialogModule } from "primeng/confirmdialog"
import { MessageService } from "primeng/api"
import { ConfirmationService } from "primeng/api"
import  { ProjetService } from "../../../services/services/projet.service"
import type { ProjetResponse } from "../../../services/models/projet-response"
import type { ProjetRequest } from "../../../services/models/projet-request"

interface Project {
  id: number
  title: string
  description: string
  status: string
  priority?: string
  createdDate: Date
  lastModified?: Date
}

interface DropdownOption {
  label: string
  value: string
}

@Component({
  selector: "app-projet-detail",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputTextarea,
    DropdownModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: "./project-details.component.html",
  styleUrls: ["./project-details.component.scss"],
})
export class ProjectDetailsComponent implements OnInit {
  // ALL PROPERTIES THAT HTML NEEDS
  project: Project | null = null
  originalProject: Project | null = null
  isEditMode = false
  error: string | null = null
  loading = false

  statusOptions: DropdownOption[] = [
    { label: "Active", value: "Active" },
    { label: "In Progress", value: "In Progress" },
    { label: "Completed", value: "Completed" },
    { label: "On Hold", value: "On Hold" },
    { label: "Cancelled", value: "Cancelled" },
    { label: "Planning", value: "Planning" },
  ]

  priorityOptions: DropdownOption[] = [
    { label: "Low", value: "Low" },
    { label: "Medium", value: "Medium" },
    { label: "High", value: "High" },
    { label: "Critical", value: "Critical" },
  ]

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private projetService: ProjetService,
  ) {}

  ngOnInit(): void {
    this.loadProject()
  }

  loadProject(): void {
    const id = this.route.snapshot.paramMap.get("id")
    console.log("Loading project with ID:", id)

    if (id != null) {
      this.loading = true
      this.error = null

      this.projetService.findProjetById({ "projet-id": Number(id) }).subscribe({
        next: (response: ProjetResponse) => {
          console.log("API response:", response)
          this.project = this.mapApiToComponent(response)
          this.originalProject = { ...this.project }
          this.loading = false
          this.error = null
        },
        error: (error) => {
          console.error("Error loading project:", error)
          this.error = "Project not found or failed to load"
          this.loading = false
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "Failed to load project details",
          })
        },
      })
    } else {
      this.error = "Invalid project ID"
    }
  }

  private mapApiToComponent(apiProject: ProjetResponse): Project {
    return {
      id: apiProject.id || 0,
      title: apiProject.nom || "",
      description: apiProject.description || "",
      status: this.mapApiStatusToComponent(apiProject.actif),
      priority: "Medium", // API doesn't have priority, using default
      createdDate: apiProject.dateDebut ? new Date(apiProject.dateDebut) : new Date(),
      lastModified: new Date(), // API doesn't have modification date, using current date
    }
  }

  private mapComponentToApi(project: Project): ProjetRequest {
    return {
      nom: project.title,
      description: project.description,
      actif: this.mapComponentStatusToApi(project.status),
      dateDebut: "",
      productOwner: { id: 0, name: "" }, // Provide a default User object
      scrumMaster: { id: 0, name: "" }, // Provide a default User object
    }
  }

  private mapApiStatusToComponent(actif?: boolean): string {
    return actif ? "Active" : "On Hold"
  }

  private mapComponentStatusToApi(status: string): boolean {
    return status === "Active" || status === "In Progress" || status === "Completed"
  }

  goBack(): void {
    this.location.back()
  }

  toggleEditMode(): void {
    if (this.isEditMode) {
      if (this.originalProject) {
        this.project = { ...this.originalProject }
      }
    }
    this.isEditMode = !this.isEditMode
  }

  saveProject(): void {
    if (this.project && this.isFormValid()) {
      this.loading = true
      const apiRequest = this.mapComponentToApi(this.project)

      this.projetService
        .updateProjet({
          projet_id: this.project.id,
          body: apiRequest,
        })
        .subscribe({
          next: (response: ProjetResponse) => {
            this.project = this.mapApiToComponent(response)
            this.originalProject = { ...this.project }
            this.isEditMode = false
            this.loading = false

            this.messageService.add({
              severity: "success",
              summary: "Success",
              detail: "Project updated successfully",
            })
          },
          error: (error) => {
            console.error("Error updating project:", error)
            this.loading = false
            this.messageService.add({
              severity: "error",
              summary: "Error",
              detail: "Failed to update project",
            })
          },
        })
    }
  }

  isFormValid(): boolean {
    return !!(this.project?.title?.trim() && this.project?.description?.trim() && this.project?.status)
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date))
  }

  getStatusClass(status: string): string {
    switch (status) {
      case "Active":
        return "status-active"
      case "In Progress":
        return "status-in-progress"
      case "Completed":
        return "status-completed"
      case "On Hold":
        return "status-on-hold"
      case "Cancelled":
        return "status-cancelled"
      case "Planning":
        return "status-planning"
      default:
        return "status-default"
    }
  }

  viewProductBacklog(): void {
    if (this.project?.id) {
      this.router.navigate(["/project-backlog-items", this.project.id])
    }
  }

  viewReports(): void {
    this.messageService.add({
      severity: "info",
      summary: "Info",
      detail: "Reports view coming soon!",
    })
  }

  deleteProject(): void {
    this.confirmationService.confirm({
      message: "Are you sure you want to delete this project? This action cannot be undone.",
      header: "Confirm Delete",
      icon: "pi pi-exclamation-triangle",
      acceptButtonStyleClass: "p-button-danger",
      accept: () => {
        if (this.project?.id) {
          this.projetService.deleteProjet({ "projet-id": this.project.id }).subscribe({
            next: () => {
              this.messageService.add({
                severity: "success",
                summary: "Deleted",
                detail: "Project deleted successfully",
              })
              this.router.navigate(["/projet"])
            },
            error: (error) => {
              console.error("Error deleting project:", error)
              this.messageService.add({
                severity: "error",
                summary: "Error",
                detail: "Failed to delete project",
              })
            },
          })
        }
      },
    })
  }
}
