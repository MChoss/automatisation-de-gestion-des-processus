import { CommonModule } from "@angular/common"
import { Component, type OnInit } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { ButtonModule } from "primeng/button"
import { DropdownModule } from "primeng/dropdown"
import { IconFieldModule } from "primeng/iconfield"
import { InputIconModule } from "primeng/inputicon"
import { InputTextModule } from "primeng/inputtext"

import type { ProjetResponse } from "../../../../services/models/projet-response"
import { AppTopbar } from "../../../../layout/component/app.topbar"
import { AppSidebar } from "../../../../layout/component/app.sidebar"
import { Router } from "@angular/router"
import { ProjetService } from "../../../../services/services"

interface Project {
  id: number
  title: string
  description: string
  status: string
  createdDate: Date
}

interface DropdownOption {
  label: string
  value: string
}

@Component({
  selector: "app-menu",
  standalone: true, // Added standalone: true to make it a standalone component
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    DropdownModule,
    AppTopbar,
    AppSidebar,
  ],
  templateUrl: "./menu.component.html",
  styleUrls: ["./menu.component.scss"],
})
export class MenuComponent implements OnInit {
  searchTerm = ""
  selectedStatus = ""
  selectedSort = "newest"
  loading = false
  error: string | null = null
  allProjects: Project[] = []

  statusOptions: DropdownOption[] = [
    { label: "All Status", value: "" },
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "Inactive" },
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
  ) {}

  ngOnInit(): void {
    this.loadProjects()
  }

  private loadProjects(): void {
    this.loading = true
    this.error = null

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
      },
    })
  }

  private mapApiToComponent(apiProject: ProjetResponse): Project {
    return {
      id: apiProject.id || 0,
      title: apiProject.nom || "",
      description: apiProject.description || "",
      status: this.mapApiStatusToComponent(apiProject.actif),
      createdDate: apiProject.dateDebut ? new Date(apiProject.dateDebut) : new Date(),
    }
  }

  private mapApiStatusToComponent(actif?: boolean): string {
    return actif ? "Active" : "Inactive"
  }

  applyFilters(): void {
    let filtered = [...this.allProjects]

    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase()
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(searchLower) ||
          project.description.toLowerCase().includes(searchLower) ||
          project.status.toLowerCase().includes(searchLower),
      )
    }

    // Apply status filter
    if (this.selectedStatus) {
      filtered = filtered.filter((project) => project.status === this.selectedStatus)
    }

    // Apply sorting
    switch (this.selectedSort) {
      case "newest":
        filtered.sort((a, b) => b.createdDate.getTime() - a.createdDate.getTime())
        break
      case "oldest":
        filtered.sort((a, b) => a.createdDate.getTime() - b.createdDate.getTime())
        break
      case "az":
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      case "za":
        filtered.sort((a, b) => b.title.localeCompare(a.title))
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

  getStatusClass(status: string): string {
    switch (status) {
      case "Active":
        return "status-active"
      case "Inactive":
        return "status-inactive"
      default:
        return "status-default"
    }
  }

  viewProject(projectId: number): void {
    const project = this.allProjects.find((p) => p.id === projectId)
    if (project) {
      localStorage.setItem("selectedProject", JSON.stringify(project))
      this.router.navigate(["projects_details/", projectId])
    }
  }

  retryLoadProjects(): void {
    this.loadProjects()
  }
}
