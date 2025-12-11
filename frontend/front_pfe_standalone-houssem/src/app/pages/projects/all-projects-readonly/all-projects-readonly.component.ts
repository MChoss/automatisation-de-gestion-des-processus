import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { ButtonModule } from "primeng/button"
import { DropdownModule } from "primeng/dropdown"
import { IconFieldModule } from "primeng/iconfield"
import { InputIconModule } from "primeng/inputicon"
import { TableModule } from "primeng/table"
import { InputTextModule } from "primeng/inputtext"
import { TagModule } from "primeng/tag"
import { ToastModule } from "primeng/toast"
import { DialogModule } from "primeng/dialog"
import { CalendarModule } from "primeng/calendar"
import { CheckboxModule } from "primeng/checkbox"
import { ConfirmDialogModule } from "primeng/confirmdialog"
import { MessageModule } from "primeng/message"
import { ProgressSpinnerModule } from "primeng/progressspinner"
import { MenuModule } from "primeng/menu"
import { MessageService, ConfirmationService, type MenuItem } from "primeng/api"
import  { Router } from "@angular/router"
import type { ProjetResponse } from "../../../services/models"
import  { ProjetService } from "../../../services/services"
import  { AuthService } from "../../../services/auth.service"
import { AppTopbar } from "../../../layout/component/app.topbar"
import { AppSidebar } from "../../../layout/component/app.sidebar"

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
  selector: "app-all-projects-readonly",
  standalone: true,
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
    TableModule,
    TagModule,
    
  ],
  templateUrl: "../all-projects/all-projects.component.html",
  styleUrl: "../all-projects/all-projects.component.scss",
  providers: [MessageService, ConfirmationService],
})
export class AllProjectsReadonlyComponent implements OnInit {
  searchTerm = ""
  selectedStatus = ""
  selectedSort = "newest"
  loading = false
  error: string | null = null
  allProjects: Project[] = []
  filteredProjects: Project[] = []

  projectDialog = false
  editMode = false
  currentProject: Project = this.getEmptyProject()
  submitting = false
  errorMessage = ""

  isReadOnly = true
  displayDialog = false
  selectedProject: ProjetResponse = {}
  isEditMode = false

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

  constructor(
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private projetService: ProjetService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.loadProjects()
  }

  loadProjects() {
    this.loading = true
    this.error = null

   if (this.authService.isScrumMaster()) {
      this.projetService.findAllProjetsByScrumMaster().subscribe({
        next: (response) => {
          this.allProjects = (response.content || []).map(this.mapApiToComponent)
          this.applyFilters()
          this.loading = false
        },
        error: (error: any) => {
          console.error("Error loading projects:", error)
          this.error = "Failed to load projects. Please try again."
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "Failed to load projects",
          })
          this.loading = false
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
    this.messageService.add({
      severity: "info",
      summary: "Read Only",
      detail: "Scrum Masters can only view projects",
    })
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

  retryLoadProjects(): void {
    this.loadProjects()
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

  getStatusClass(actif: boolean): string {
    return actif ? "status-active" : "status-inactive"
  }

  getStatusLabel(actif: boolean): string {
    return actif ? "Active" : "Inactive"
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
    ]
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

  isAdmin(): boolean {
    return false // Scrum Masters are not admins
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

  hideDialog(): void {
    this.projectDialog = false
    this.errorMessage = ""
    this.displayDialog = false
    this.selectedProject = {}
    this.isEditMode = false
  }

  clearError(): void {
    this.errorMessage = ""
  }

  showAddDialog() {
    this.messageService.add({
      severity: "info",
      summary: "Read Only",
      detail: "Scrum Masters can only view projects",
    })
  }

  editProject(project: Project | ProjetResponse) {
    this.messageService.add({
      severity: "info",
      summary: "Read Only",
      detail: "Scrum Masters cannot edit projects",
    })
  }

  deleteProject(project: Project | ProjetResponse) {
    this.messageService.add({
      severity: "info",
      summary: "Read Only",
      detail: "Scrum Masters cannot delete projects",
    })
  }

  saveProject() {
    this.messageService.add({
      severity: "info",
      summary: "Read Only",
      detail: "Scrum Masters cannot save projects",
    })
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case "EN_COURS":
        return "warning"
      case "TERMINE":
        return "success"
      case "A_FAIRE":
        return "info"
      default:
        return "info"
    }
  }
}
