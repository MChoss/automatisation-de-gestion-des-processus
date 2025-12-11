import { CommonModule } from "@angular/common"
import { Component, type OnInit } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { ButtonModule } from "primeng/button"
import { DropdownModule } from "primeng/dropdown"
import { IconFieldModule } from "primeng/iconfield"
import { InputIconModule } from "primeng/inputicon"
import { InputTextModule } from "primeng/inputtext"
import { DialogModule } from "primeng/dialog"
import { CalendarModule } from "primeng/calendar"
import { CheckboxModule } from "primeng/checkbox"
import { ToastModule } from "primeng/toast"
import { ConfirmDialogModule } from "primeng/confirmdialog"
import { MessageModule } from "primeng/message"
import { ProgressSpinnerModule } from "primeng/progressspinner"
import { MenuModule } from "primeng/menu"

import type { ProjetResponse } from "../../../services/models/projet-response"
import type { ProjetRequest } from "../../../services/models"
import  { Router } from "@angular/router"
import  { ProjetService } from "../../../services/services"
import { ConfirmationService,  MenuItem, MessageService } from "primeng/api"
import  { AuthService } from "../../../services/auth.service"

interface Project {
  id?: number
  nom: string
  description: string
  actif: boolean
  dateDebut: Date
  dateFin?: Date
  statut?: string
  productOwner?: any
  scrumMaster?: any
  users?: any[]
  productBacklog?: any
}

interface DropdownOption {
  label: string
  value: string
}

@Component({
  selector: "app-all-projects",
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    DropdownModule,
    DialogModule,
    CalendarModule,
    CheckboxModule,
    ToastModule,
    ConfirmDialogModule,
    MessageModule,
    ProgressSpinnerModule,
    MenuModule,
  ],
  templateUrl: "./all-projects.component.html",
  styleUrl: "./all-projects.component.scss",
  providers: [MessageService, ConfirmationService],
})
export class AllProjectsComponent implements OnInit {
  searchTerm = ""
  selectedStatus = ""
  selectedSort = "newest"
  loading = false
  error: string | null = null
  allProjects: Project[] = []

  projectDialog = false
  editMode = false
  currentProject: Project = this.getEmptyProject()
  submitting = false
  errorMessage = ""

  statusOptions: DropdownOption[] = [
    { label: "All Status", value: "" },
    { label: "Active", value: "true" },
    { label: "Inactive", value: "false" },
  ]

  sortOptions: DropdownOption[] = [
    { label: "Newest First", value: "newest" },
    { label: "Oldest First", value: "oldest" },
    { label: "A-Z", value: "az" },
    { label: "Z-A", value: "za" },
  ]

  filteredProjects: Project[] = []

  constructor(
    private router: Router,
    private projetService: ProjetService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadProjects()
  }

  private loadProjects(): void {
    this.loading = true
    this.error = null

    const isAdmin = this.authService.isAdmin()

    if (isAdmin) {
      this.projetService.findAllProjets().subscribe({
        next: (response) => {
          this.allProjects = response.content?.map(this.mapApiToComponent) || []
          this.applyFilters()
          this.loading = false
        },
        error: (error) => {
          console.error("Error loading projects:", error)
          this.error = "Failed to load projects. Please try again."
          this.loading = false
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "Failed to load projects",
          })
        },
      })
    } else {
      this.projetService.findAllProjetsByOwner().subscribe({
        next: (response) => {
          this.allProjects = response.content?.map(this.mapApiToComponent) || []
          this.applyFilters()
          this.loading = false
        },
        error: (error) => {
          console.error("Error loading projects:", error)
          this.error = "Failed to load projects. Please try again."
          this.loading = false
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "Failed to load projects",
          })
        },
      })
    }
  }

  private mapApiToComponent(apiProject: ProjetResponse): Project {
    return {
      id: apiProject.id,
      nom: apiProject.nom || "",
      description: apiProject.description || "",
      actif: apiProject.actif || false,
      dateDebut: apiProject.dateDebut ? new Date(apiProject.dateDebut) : new Date(),
      statut: apiProject.statut,
      productOwner: apiProject.productOwner,
      scrumMaster: apiProject.scrumMaster,
      productBacklog: apiProject.productBacklog,
    }
  }

  openNewProjectDialog(): void {
    this.currentProject = this.getEmptyProject()
    this.editMode = false
    this.projectDialog = true
    this.errorMessage = ""
  }

  editProject(project: Project): void {
    this.currentProject = { ...project }
    this.editMode = true
    this.projectDialog = true
    this.errorMessage = ""
  }

  saveProject(): void {
    if (!this.isFormValid()) {
      this.errorMessage = "Please fill in all required fields"
      return
    }

    this.submitting = true
    this.errorMessage = ""

    const projectRequest: ProjetRequest = {
      id: this.currentProject.id,
      nom: this.currentProject.nom,
      description: this.currentProject.description,
      dateDebut:
        this.currentProject.dateDebut instanceof Date
          ? this.currentProject.dateDebut.toISOString()
          : this.currentProject.dateDebut,
      actif: this.currentProject.actif,
      productOwner: this.currentProject.productOwner,
      scrumMaster: this.currentProject.scrumMaster,
    }

    if (this.editMode && this.currentProject.id) {
      this.projetService
        .updateProjet({
          projet_id: this.currentProject.id,
          body: projectRequest,
        })
        .subscribe({
          next: (response) => {
            this.messageService.add({
              severity: "success",
              summary: "Success",
              detail: "Project updated successfully",
            })
            this.projectDialog = false
            this.loadProjects()
            this.submitting = false
          },
          error: (error) => {
            console.error("Error updating project:", error)
            this.errorMessage = this.getErrorMessage(error)
            this.submitting = false
          },
        })
    } else {
      this.projetService.saveProjet({ body: projectRequest }).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: "success",
            summary: "Success",
            detail: "Project created successfully",
          })
          this.projectDialog = false
          this.loadProjects()
          this.submitting = false
        },
        error: (error) => {
          console.error("Error creating project:", error)
          this.errorMessage = this.getErrorMessage(error)
          this.submitting = false
        },
      })
    }
  }

  deleteProject(project: Project): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the project "${project.nom}"? This action cannot be undone.`,
      header: "Confirm Delete",
      icon: "pi pi-exclamation-triangle",
      acceptButtonStyleClass: "p-button-danger",
      accept: () => {
        if (project.id) {
          this.projetService.deleteProjet({ "projet-id": project.id }).subscribe({
            next: () => {
              this.messageService.add({
                severity: "success",
                summary: "Success",
                detail: "Project deleted successfully",
              })
              this.loadProjects()
            },
            error: (error) => {
              console.error("Error deleting project:", error)
              this.messageService.add({
                severity: "error",
                summary: "Error",
                detail: this.getErrorMessage(error),
              })
            },
          })
        }
      },
    })
  }

  toggleProjectStatus(project: Project): void {
    if (project.id) {
      this.projetService.updateActifStatus({ "projet-id": project.id }).subscribe({
        next: () => {
          const newStatus = !project.actif
          this.messageService.add({
            severity: "success",
            summary: "Success",
            detail: `Project ${newStatus ? "activated" : "deactivated"} successfully`,
          })
          this.loadProjects()
        },
        error: (error) => {
          console.error("Error updating project status:", error)
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: this.getErrorMessage(error),
          })
        },
      })
    }
  }

  private getEmptyProject(): Project {
    return {
      nom: "",
      description: "",
      actif: true,
      dateDebut: new Date(),
    }
  }

  isFormValid(): boolean {
    return !!(
      this.currentProject &&
      this.currentProject.nom &&
      this.currentProject.nom.trim() &&
      this.currentProject.description &&
      this.currentProject.description.trim() &&
      this.currentProject.dateDebut
    )
  }

  private getErrorMessage(error: any): string {
    if (error?.error?.message) {
      return error.error.message
    }
    if (error?.message) {
      return error.message
    }
    return "An unexpected error occurred"
  }

  hideDialog(): void {
    this.projectDialog = false
    this.errorMessage = ""
  }

  clearError(): void {
    this.errorMessage = ""
  }

  getProjectMenuItems(project: Project): MenuItem[] {
    return [
      {
        label: "View Details",
        icon: "pi pi-eye",
        command: () => this.viewProject(project.id!),
      },
      {
        label: "View Product Backlog",
        icon: "pi pi-list",
        command: () => this.viewProductBacklog(project.id!),
      },
      {
        label: "Edit",
        icon: "pi pi-pencil",
        command: () => this.editProject(project),
      },
      {
        label: project.actif ? "Deactivate" : "Activate",
        icon: project.actif ? "pi pi-times-circle" : "pi pi-check-circle",
        command: () => this.toggleProjectStatus(project),
      },
      {
        separator: true,
      },
      {
        label: "Delete",
        icon: "pi pi-trash",
        styleClass: "text-red-500",
        command: () => this.deleteProject(project),
      },
    ]
  }

  applyFilters(): void {
    let filtered = [...this.allProjects]

    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase()
      filtered = filtered.filter(
        (project) =>
          project.nom.toLowerCase().includes(searchLower) || project.description.toLowerCase().includes(searchLower),
      )
    }

    if (this.selectedStatus) {
      const isActive = this.selectedStatus === "true"
      filtered = filtered.filter((project) => project.actif === isActive)
    }

    switch (this.selectedSort) {
      case "newest":
        filtered.sort((a, b) => b.dateDebut.getTime() - a.dateDebut.getTime())
        break
      case "oldest":
        filtered.sort((a, b) => a.dateDebut.getTime() - b.dateDebut.getTime())
        break
      case "az":
        filtered.sort((a, b) => a.nom.localeCompare(b.nom))
        break
      case "za":
        filtered.sort((a, b) => b.nom.localeCompare(a.nom))
        break
    }

    this.filteredProjects = filtered
  }

  onSearchChange(): void {
    this.applyFilters()
  }

  onStatusChange(): void {
    this.applyFilters()
  }

  onSortChange(): void {
    this.applyFilters()
  }

  clearFilters(): void {
    this.searchTerm = ""
    this.selectedStatus = ""
    this.selectedSort = "newest"
    this.applyFilters()
  }

  hasActiveFilters(): boolean {
    return this.searchTerm.trim() !== "" || this.selectedStatus !== ""
  }

  getStatusClass(actif: boolean): string {
    return actif ? "status-active" : "status-inactive"
  }

  getStatusLabel(actif: boolean): string {
    return actif ? "Active" : "Inactive"
  }

  viewProject(projectId: number): void {
    const project = this.allProjects.find((p) => p.id === projectId)
    if (project) {
      localStorage.setItem("selectedProject", JSON.stringify(project))
      this.router.navigate(["projects_details/", projectId])
    }
  }

  viewProductBacklog(projectId: number): void {
    const project = this.allProjects.find((p) => p.id === projectId)
    if (project) {
      localStorage.setItem("selectedProject", JSON.stringify(project))
      this.router.navigate(["product-backlog/", projectId])
    }
  }

  retryLoadProjects(): void {
    this.loadProjects()
  }

  isAdmin(): boolean {
    return this.authService.isAdmin()
  }
}
