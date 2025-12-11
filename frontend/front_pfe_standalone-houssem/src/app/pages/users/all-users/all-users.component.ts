import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { ButtonModule } from "primeng/button"
import { TableModule } from "primeng/table"
import { DialogModule } from "primeng/dialog"
import { InputTextModule } from "primeng/inputtext"
import { DropdownModule } from "primeng/dropdown"
import { TagModule } from "primeng/tag"
import { CardModule } from "primeng/card"
import { ToastModule } from "primeng/toast"
import { ConfirmDialogModule } from "primeng/confirmdialog"
import { CalendarModule } from "primeng/calendar"
import { MultiSelectModule } from "primeng/multiselect"
import { MessageModule } from "primeng/message"
import { ProgressSpinnerModule } from "primeng/progressspinner"
import { InputSwitchModule } from "primeng/inputswitch"
import { MessageService, ConfirmationService } from "primeng/api"
import { TooltipModule } from "primeng/tooltip"
import  { Router } from "@angular/router"
import  { HttpClient } from "@angular/common/http"
import type { UserResponse } from "../../../services/models"
import  { UserManagementService } from "../../../services/services"

interface User {
  id: number
  nom: string
  prenom: string
  email: string
  fullName: string
  dateNaissance: string
  enabled: boolean
  accountLocked: boolean
  createdDate: string
  lastModifiedDate: string
  roles: Role[]
}

interface Role {
  id: number
  name: string
  createdDate: string
  lastModifiedDate: string
}

interface UserRequest {
  nom: string
  prenom: string
  email: string
  dateNaissance?: string
  password?: string
  enabled: boolean
  accountLocked: boolean
  roleIds?: number[]
}

interface PageResponse<T> {
  content: T[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

@Component({
  selector: "app-all-users",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    TagModule,
    CardModule,
    ToastModule,
    ConfirmDialogModule,
    CalendarModule,
    MultiSelectModule,
    TooltipModule,
    MessageModule,
    ProgressSpinnerModule,
    InputSwitchModule,
  ],
  templateUrl: "./all-users.component.html",
  styleUrl: "./all-users.component.scss",
  providers: [MessageService, ConfirmationService],
})
export class AllUsersComponent implements OnInit {
  users: User[] = []
  displayDialog = false
  user: UserRequest = this.getEmptyUser()
  isEditMode = false
  selectedUsers: User[] = []
  loading = false
  errorMessage = ""

  // Search and filter
  searchTerm = ""
  selectedStatusFilter = ""
  showActiveOnly = false

  // Pagination
  totalRecords = 0
  rows = 10
  first = 0

  // Available roles
  availableRoles: Role[] = []
  selectedUser: User | null = null

  statusFilterOptions = [
    { label: "All Users", value: "" },
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
    { label: "Locked", value: "locked" },
    { label: "Unlocked", value: "unlocked" },
  ]

  constructor(
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private http: HttpClient,
    private userManagementService: UserManagementService,
  ) {}

  ngOnInit() {
    console.log("[v0] AllUsersComponent initialized")
    this.loadRoles()
    this.loadUsers()
  }

  loadUsers(page = 0, size = 10): void {
    if (this.loading) return
    this.loading = true
    this.clearError()

    console.log("[v0] Loading users with params:", {
      page,
      size,
      searchTerm: this.searchTerm,
      statusFilter: this.selectedStatusFilter,
      activeOnly: this.showActiveOnly,
    })

    this.userManagementService
      .findAllUsers({
        page,
        size,
        sort: "id",
        direction: "asc",
      })
      .subscribe({
        next: (response: any) => {
          console.log("[v0] Users loaded successfully:", response)
          let users: User[] = (response.content ?? []).map((u: UserResponse) => ({
            id: u.id ?? 0,
            nom: u.nom ?? "",
            prenom: u.prenom ?? "",
            email: u.email ?? "",
            fullName: u.fullName ?? "",
            dateNaissance: u.dateNaissance ?? "",
            enabled: u.enabled ?? false,
            accountLocked: u.accountLocked ?? false,
            createdDate: u.createdDate ?? "",
            lastModifiedDate: u.lastModifiedDate ?? "",
            roles: (u.roles ?? []).map((r: any) => ({
              id: r.id ?? 0,
              name: r.name ?? "",
              createdDate: r.createdDate ?? "",
              lastModifiedDate: r.lastModifiedDate ?? "",
            })),
          }))

          // Apply client-side filtering
          users = this.applyFilters(users)

          this.users = users
          this.totalRecords = users.length
          this.loading = false
        },
        error: (error) => {
          console.error("[v0] Error loading users:", error)
          this.handleError("Failed to load users", error)
          this.loading = false
        },
      })
  }

  private applyFilters(users: User[]): User[] {
    let filteredUsers = [...users]

    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchTerm = this.searchTerm.toLowerCase()
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.nom?.toLowerCase().includes(searchTerm) ||
          user.prenom?.toLowerCase().includes(searchTerm) ||
          user.email?.toLowerCase().includes(searchTerm) ||
          user.fullName?.toLowerCase().includes(searchTerm),
      )
    }

    // Apply status filter
    if (this.selectedStatusFilter) {
      switch (this.selectedStatusFilter) {
        case "active":
          filteredUsers = filteredUsers.filter((user) => user.enabled)
          break
        case "inactive":
          filteredUsers = filteredUsers.filter((user) => !user.enabled)
          break
        case "locked":
          filteredUsers = filteredUsers.filter((user) => user.accountLocked)
          break
        case "unlocked":
          filteredUsers = filteredUsers.filter((user) => !user.accountLocked)
          break
      }
    }

    // Apply active only filter
    if (this.showActiveOnly) {
      filteredUsers = filteredUsers.filter((user) => user.enabled)
    }

    return filteredUsers
  }

  loadRoles(): void {
    console.log("[v0] Loading roles...")
    this.http.get<Role[]>("http://localhost:8088/api/v1/users/roles").subscribe({
      next: (roles) => {
        console.log("[v0] Roles loaded successfully:", roles)
        this.availableRoles = roles
      },
      error: (error) => {
        console.error("[v0] Error loading roles:", error)
        this.handleError("Failed to load roles", error)
      },
    })
  }

  getEmptyUser(): UserRequest {
    return {
      nom: "",
      prenom: "",
      email: "",
      dateNaissance: "",
      password: "",
      enabled: true,
      accountLocked: false,
      roleIds: [],
    }
  }

  showAddDialog(): void {
    this.user = this.getEmptyUser()
    this.isEditMode = false
    this.displayDialog = true
  }

  editUser(user: User): void {
    this.user = {
      nom: user.nom || "",
      prenom: user.prenom || "",
      email: user.email || "",
      dateNaissance: user.dateNaissance || "",
      enabled: user.enabled || false,
      accountLocked: user.accountLocked || false,
      roleIds: user.roles?.map((role) => role.id) || [],
    }
    this.selectedUser = user
    this.isEditMode = true
    this.displayDialog = true
  }

  saveUser(): void {
    if (!this.user.nom?.trim() || !this.user.prenom?.trim() || !this.user.email?.trim()) {
      this.messageService.add({
        severity: "error",
        summary: "Validation Error",
        detail: "Please fill in name, last name, and email",
      })
      return
    }

    this.loading = true
    console.log("[v0] Saving user:", this.user)

    if (this.isEditMode && this.selectedUser) {
      // Update user
      this.http
        .put<User>(`http://localhost:8088/api/v1/users/${this.selectedUser.id}`, this.user, {
          headers: { "Content-Type": "application/json" },
        })
        .subscribe({
          next: (response) => {
            console.log("[v0] User updated successfully:", response)
            this.messageService.add({
              severity: "success",
              summary: "Success",
              detail: "User updated successfully",
            })
            this.displayDialog = false
            this.first = 0 // Reset pagination to first page
            this.loadUsers(0, this.rows) // Reload with current page size
            this.loading = false
          },
          error: (error) => {
            console.error("[v0] Error updating user:", error)
            this.handleError("Failed to update user", error)
            this.loading = false
          },
        })
    } else {
      // Create user
      this.http
        .post<User>("http://localhost:8088/api/v1/users", this.user, {
          headers: { "Content-Type": "application/json" },
        })
        .subscribe({
          next: (response) => {
            console.log("[v0] User created successfully:", response)
            this.messageService.add({
              severity: "success",
              summary: "Success",
              detail: "User created successfully",
            })
            this.displayDialog = false
            this.first = 0 // Reset pagination to first page
            this.loadUsers(0, this.rows) // Reload with current page size
            this.loading = false
          },
          error: (error) => {
            console.error("[v0] Error creating user:", error)
            this.handleError("Failed to create user", error)
            this.loading = false
          },
        })
    }
  }

  deleteUser(user: User): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${user.fullName}"? This action cannot be undone.`,
      header: "Confirm Delete",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.loading = true
        console.log("[v0] Deleting user:", user.id)

        this.http.delete(`http://localhost:8088/api/v1/users/${user.id}`).subscribe({
          next: () => {
            console.log("[v0] User deleted successfully")
            this.messageService.add({
              severity: "success",
              summary: "Success",
              detail: "User deleted successfully",
            })
            this.first = 0
            this.loadUsers()
            this.loading = false
          },
          error: (error) => {
            console.error("[v0] Error deleting user:", error)
            this.handleError("Failed to delete user", error)
            this.loading = false
          },
        })
      },
    })
  }

  toggleUserStatus(user: User): void {
    this.loading = true
    console.log("[v0] Toggling user status:", user.id)

    this.http.patch<User>(`http://localhost:8088/api/v1/users/${user.id}/toggle-status`, {}).subscribe({
      next: (response) => {
        console.log("[v0] User status toggled successfully:", response)
        this.messageService.add({
          severity: "info",
          summary: "Status Updated",
          detail: `User ${response.enabled ? "activated" : "deactivated"} successfully`,
        })
        this.loadUsers(Math.floor(this.first / this.rows), this.rows)
        this.loading = false
      },
      error: (error) => {
        console.error("[v0] Error toggling user status:", error)
        this.handleError("Failed to update user status", error)
        this.loading = false
      },
    })
  }

  toggleUserLock(user: User): void {
    this.loading = true
    console.log("[v0] Toggling user lock:", user.id)

    this.http.patch<User>(`http://localhost:8088/api/v1/users/${user.id}/toggle-lock`, {}).subscribe({
      next: (response) => {
        console.log("[v0] User lock toggled successfully:", response)
        this.messageService.add({
          severity: "info",
          summary: "Lock Status Updated",
          detail: `User account ${response.accountLocked ? "locked" : "unlocked"} successfully`,
        })
        this.loadUsers(Math.floor(this.first / this.rows), this.rows)
        this.loading = false
      },
      error: (error) => {
        console.error("[v0] Error toggling user lock:", error)
        this.handleError("Failed to update user lock status", error)
        this.loading = false
      },
    })
  }

  deleteSelectedUsers(): void {
    if (this.selectedUsers.length === 0) {
      this.messageService.add({
        severity: "warn",
        summary: "Warning",
        detail: "Please select users to delete",
      })
      return
    }

    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${this.selectedUsers.length} selected user(s)?`,
      header: "Confirm Bulk Delete",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.loading = true
        let deletedCount = 0
        let errorCount = 0

        this.selectedUsers.forEach((user) => {
          this.http.delete(`http://localhost:8088/api/v1/users/${user.id}`).subscribe({
            next: () => {
              deletedCount++
              if (deletedCount + errorCount === this.selectedUsers.length) {
                this.finalizeBulkDelete(deletedCount, errorCount)
              }
            },
            error: (error) => {
              console.error(`Error deleting user ${user.fullName}:`, error)
              errorCount++
              if (deletedCount + errorCount === this.selectedUsers.length) {
                this.finalizeBulkDelete(deletedCount, errorCount)
              }
            },
          })
        })
      },
    })
  }

  private finalizeBulkDelete(deletedCount: number, errorCount: number): void {
    this.selectedUsers = []
    this.loading = false
    this.loadUsers()

    if (deletedCount > 0) {
      this.messageService.add({
        severity: "success",
        summary: "Success",
        detail: `${deletedCount} user(s) deleted successfully`,
      })
    }

    if (errorCount > 0) {
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: `Failed to delete ${errorCount} user(s)`,
      })
    }
  }

  onSearchChange(): void {
    this.first = 0 // reset paginator
    this.loadUsers(0, this.rows)
  }

  onStatusFilterChange(): void {
    this.first = 0
    this.loadUsers(0, this.rows)
  }

  onActiveFilterChange(): void {
    this.first = 0
    this.loadUsers(0, this.rows)
  }

  clearFilters(): void {
    this.searchTerm = ""
    this.selectedStatusFilter = ""
    this.showActiveOnly = false
    this.first = 0
    this.loadUsers(0, this.rows)
  }

  onPageChange(event: any): void {
    this.first = event.first
    this.rows = event.rows
    const page = Math.floor(event.first / event.rows)

    console.log("[v0] Page change event:", { page, rows: event.rows })
    this.loadUsers(page, event.rows)
  }

  onGlobalFilter(event: Event): void {
    const target = event.target as HTMLInputElement
    this.searchTerm = target.value
    this.onSearchChange()
  }

  isFormValid(): boolean {
    return (
      (this.user.nom ?? "").trim() !== "" &&
      (this.user.prenom ?? "").trim() !== "" &&
      (this.user.email ?? "").trim() !== ""
    )
  }

  getStatusSeverity(enabled: boolean): string {
    return enabled ? "success" : "danger"
  }

  getLockSeverity(locked: boolean): string {
    return locked ? "danger" : "success"
  }

  formatDate(dateString: string): string {
    if (!dateString) return "N/A"
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateString))
  }

  goBack(): void {
    this.router.navigate(["/projet"])
  }

  getTotalUsers(): number {
    return this.totalRecords
  }

  getActiveUsers(): number {
    return this.users.filter((u) => u.enabled).length
  }

  getLockedUsers(): number {
    return this.users.filter((u) => u.accountLocked).length
  }

  getAdminUsers(): number {
    return this.users.filter((u) => u.roles?.some((role) => role.name === "ADMIN")).length
  }

  private handleError(message: string, error: any): void {
    let errorMessage = message

    if (error.error?.businessErrorDescription) {
      errorMessage = error.error.businessErrorDescription
    } else if (error.error?.message) {
      errorMessage = error.error.message
    } else if (error.status === 500) {
      errorMessage = "Server error occurred. Please try again or contact your administrator."
    } else if (error.status === 0) {
      errorMessage = "Cannot connect to server. Please check if the backend is running on http://localhost:8088"
    } else if (error.status === 404) {
      errorMessage = "API endpoint not found. Please check the backend configuration."
    } else if (error.status === 403) {
      errorMessage = "Access denied. Please check your authentication."
    }

    console.error("[v0] Detailed error:", error)
    this.errorMessage = errorMessage
    this.messageService.add({
      severity: "error",
      summary: "Error",
      detail: errorMessage,
      life: 8000,
    })
  }

  clearError(): void {
    this.errorMessage = ""
  }

  exportUsers(): void {
    this.messageService.add({
      severity: "info",
      summary: "Export",
      detail: "Users data exported successfully",
    })
  }
}
