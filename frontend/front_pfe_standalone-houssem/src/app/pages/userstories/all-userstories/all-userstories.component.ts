import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"

import { ButtonModule } from "primeng/button"
import { TableModule } from "primeng/table"
import { DialogModule } from "primeng/dialog"
import { InputTextModule } from "primeng/inputtext"
import { InputTextarea } from "primeng/inputtextarea"
import { DropdownModule } from "primeng/dropdown"
import { TagModule } from "primeng/tag"
import { CardModule } from "primeng/card"
import { ToastModule } from "primeng/toast"
import { ConfirmDialogModule } from "primeng/confirmdialog"
import { IconFieldModule } from "primeng/iconfield"
import { InputIconModule } from "primeng/inputicon"
import { MessageService, ConfirmationService } from "primeng/api"
import { AppTopbar } from "../../../layout/component/app.topbar"
import type { UserStoryResponse } from "../../../services/models/user-story-response"
import type { UserStoryRequest } from "../../../services/models/user-story-request"
import  { Router } from "@angular/router"
import  { UserStoryService } from "../../../services/services"
import { AppSidebar } from "../../../layout/component/app.sidebar"

@Component({
  selector: "app-user-stories",
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
    InputTextarea,
    DropdownModule,
    TagModule,
    CardModule,
    ToastModule,
    ConfirmDialogModule,
    IconFieldModule,
    InputIconModule,
  ],
  templateUrl: "./all-userstories.component.html",
  styleUrl: "./all-userstories.component.scss",
  providers: [MessageService, ConfirmationService],
})
export class AllUserstoriesComponent implements OnInit {
  allUserStories: UserStoryResponse[] = []
  filteredUserStories: UserStoryResponse[] = []

  displayDialog = false
  userStoryForm: UserStoryRequest = this.getEmptyUserStoryForm()
  isEditMode = false
  selectedStoryId: number | null = null
  loading = false

  priorityOptions = [
    { label: "Low (1)", value: 1 },
    { label: "Medium (2)", value: 2 },
    { label: "High (3)", value: 3 },
    { label: "Critical (4)", value: 4 },
  ]

  statusOptions = [
    { label: "À faire", value: "A_FAIRE" },
    { label: "En cours", value: "EN_COURS" },
    { label: "Terminé", value: "TERMINE" },
  ]

  statusFilterOptions = [
    { label: "Tous les statuts", value: "" },
    { label: "À faire", value: "A_FAIRE" },
    { label: "En cours", value: "EN_COURS" },
    { label: "Terminé", value: "TERMINE" },
  ]

  priorityFilterOptions = [
    { label: "Toutes les priorités", value: "" },
    { label: "Faible (1)", value: 1 },
    { label: "Moyenne (2)", value: 2 },
    { label: "Élevée (3)", value: 3 },
    { label: "Critique (4)", value: 4 },
  ]

  storyPointOptions = [
    { label: "1", value: 1 },
    { label: "2", value: 2 },
    { label: "3", value: 3 },
    { label: "5", value: 5 },
    { label: "8", value: 8 },
    { label: "13", value: 13 },
    { label: "21", value: 21 },
  ]

  searchTerm = ""
  statusFilter = ""
  priorityFilter = ""

  constructor(
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private userStoryService: UserStoryService,
  ) {}

  ngOnInit() {
    this.loadUserStories()
  }

  loadUserStories() {
    this.loading = true

    this.userStoryService.findAllUserStories({ page: 0, size: 1000 }).subscribe({
      next: (response) => {
        this.allUserStories = response.content || []
        this.applyFilters()
        this.loading = false
        console.log("[v0] Loaded user stories:", this.allUserStories.length)
      },
      error: (error) => {
        console.error("Error loading user stories:", error)
        this.messageService.add({
          severity: "error",
          summary: "Erreur",
          detail: "Échec du chargement des user stories",
        })
        this.loading = false
      },
    })
  }

  applyFilters(): void {
    let filtered = [...this.allUserStories]

    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase()
      filtered = filtered.filter(
        (story) =>
          story.titre?.toLowerCase().includes(searchLower) || story.description?.toLowerCase().includes(searchLower),
      )
    }

    // Apply status filter
    if (this.statusFilter) {
      filtered = filtered.filter((story) => story.statut === this.statusFilter)
    }

    // Apply priority filter
    if (this.priorityFilter) {
      const priority = Number.parseInt(this.priorityFilter)
      filtered = filtered.filter((story) => story.priorite === priority)
    }

    this.filteredUserStories = filtered
  }

  onSearchChange(): void {
    this.applyFilters()
  }

  onStatusChange(): void {
    this.applyFilters()
  }

  onPriorityChange(): void {
    this.applyFilters()
  }

  clearFilters(): void {
    this.searchTerm = ""
    this.statusFilter = ""
    this.priorityFilter = ""
    this.applyFilters()
  }

  hasActiveFilters(): boolean {
    return this.searchTerm.trim() !== "" || this.statusFilter !== "" || this.priorityFilter !== ""
  }

  getEmptyUserStoryForm(): UserStoryRequest {
    return {
      titre: "",
      description: "",
      points: 1,
      priorite: 2,
      statut: "A_FAIRE",
      sprintBacklogId: undefined,
    }
  }

  showAddDialog() {
    this.userStoryForm = this.getEmptyUserStoryForm()
    this.isEditMode = false
    this.selectedStoryId = null
    this.displayDialog = true
  }

  editUserStory(story: UserStoryResponse) {
    this.userStoryForm = {
      titre: story.titre || "",
      description: story.description || "",
      points: story.points || 1,
      priorite: story.priorite || 2,
      statut: story.statut || "A_FAIRE",
      sprintBacklogId: story.sprintBacklogId,
    }
    this.selectedStoryId = story.id || null
    this.isEditMode = true
    this.displayDialog = true
  }

  saveUserStory() {
    console.log("[v0] Saving user story:", this.userStoryForm)
    console.log("[v0] Is edit mode:", this.isEditMode)
    console.log("[v0] Selected story ID:", this.selectedStoryId)

    if (this.isFormValid()) {
      this.loading = true

      if (this.isEditMode && this.selectedStoryId) {
        this.userStoryService
          .updateUserStory({
            "user-story-id": this.selectedStoryId,
            body: {
              ...this.userStoryForm,
              statut: this.userStoryForm.statut || "A_FAIRE",
            },
          })
          .subscribe({
            next: () => {
              console.log("[v0] User story updated successfully")
              this.messageService.add({
                severity: "success",
                summary: "Succès",
                detail: "User story mise à jour avec succès",
              })
              this.displayDialog = false
              this.loading = false
              this.loadUserStories()
            },
            error: (error) => {
              console.error("[v0] Error updating user story:", error)
              this.messageService.add({
                severity: "error",
                summary: "Erreur",
                detail: error?.error?.message || "Échec de la mise à jour de la user story",
              })
              this.loading = false
            },
          })
      } else {
        this.userStoryService
          .saveUserStory({
            body: {
              ...this.userStoryForm,
              statut: this.userStoryForm.statut || "A_FAIRE",
              priorite: this.userStoryForm.priorite || 2,
              points: this.userStoryForm.points || 1,
            },
          })
          .subscribe({
            next: (id) => {
              console.log("[v0] User story created successfully with ID:", id)
              this.messageService.add({
                severity: "success",
                summary: "Succès",
                detail: "User story créée avec succès",
              })
              this.displayDialog = false
              this.loading = false
              this.loadUserStories()
            },
            error: (error) => {
              console.error("[v0] Error creating user story:", error)
              this.messageService.add({
                severity: "error",
                summary: "Erreur",
                detail: error?.error?.message || "Échec de la création de la user story",
              })
              this.loading = false
            },
          })
      }
    } else {
      console.log("[v0] Form validation failed:", {
        titre: this.userStoryForm.titre,
        description: this.userStoryForm.description,
      })
    }
  }

  deleteUserStory(story: UserStoryResponse) {
    console.log("[v0] Attempting to delete user story:", story)
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir supprimer "${story.titre}"?`,
      header: "Confirmer la suppression",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        if (story.id) {
          this.loading = true
          this.userStoryService.deleteUserStory({ "user-story-id": story.id }).subscribe({
            next: () => {
              console.log("[v0] User story deleted successfully")
              this.messageService.add({
                severity: "success",
                summary: "Succès",
                detail: "User story supprimée avec succès",
              })
              this.loading = false
              this.loadUserStories()
            },
            error: (error) => {
              console.error("[v0] Error deleting user story:", error)
              this.messageService.add({
                severity: "error",
                summary: "Erreur",
                detail: error?.error?.message || "Échec de la suppression de la user story",
              })
              this.loading = false
            },
          })
        }
      },
    })
  }

  changeStatus(story: UserStoryResponse, newStatus: string) {
    console.log("[v0] Changing status for story:", story.id, "to:", newStatus)
    if (story.id) {
      this.loading = true
      this.userStoryService
        .updateUserStoryStatut({
          "user-story-id": story.id,
          statut: newStatus as any,
        })
        .subscribe({
          next: () => {
            console.log("[v0] Status updated successfully")
            this.messageService.add({
              severity: "success",
              summary: "Succès",
              detail: "Statut mis à jour avec succès",
            })
            this.loading = false
            this.loadUserStories()
          },
          error: (error) => {
            console.error("[v0] Error updating status:", error)
            this.messageService.add({
              severity: "error",
              summary: "Erreur",
              detail: error?.error?.message || "Échec de la mise à jour du statut",
            })
            this.loading = false
          },
        })
    }
  }

  isFormValid(): boolean {
    const isValid = !!(this.userStoryForm.titre?.trim() && this.userStoryForm.description?.trim())
    console.log("[v0] Form validation result:", isValid, {
      titre: this.userStoryForm.titre?.trim(),
      description: this.userStoryForm.description?.trim(),
    })
    return isValid
  }

  getPrioritySeverity(priority: number): string {
    switch (priority) {
      case 1:
        return "info"
      case 2:
        return "warning"
      case 3:
        return "danger"
      case 4:
        return "danger"
      default:
        return "info"
    }
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case "A_FAIRE":
        return "secondary"
      case "EN_COURS":
        return "warning"
      case "TERMINE":
        return "success"
      default:
        return "secondary"
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case "A_FAIRE":
        return "À faire"
      case "EN_COURS":
        return "En cours"
      case "TERMINE":
        return "Terminé"
      default:
        return status
    }
  }

  getPriorityLabel(priority: number): string {
    switch (priority) {
      case 1:
        return "Faible"
      case 2:
        return "Moyenne"
      case 3:
        return "Élevée"
      case 4:
        return "Critique"
      default:
        return "Moyenne"
    }
  }

  goBack() {
    this.router.navigate(["/projet"])
  }

  getTotalUserStories(): number {
    return this.allUserStories.length
  }

  getUserStoriesByStatus(status: string): number {
    return this.allUserStories.filter((s) => s.statut === status).length
  }

  getTotalStoryPoints(): number {
    return this.allUserStories.reduce((total, story) => total + (story.points || 0), 0)
  }
}
