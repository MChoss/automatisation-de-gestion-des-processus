import { Component, type OnInit } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { ButtonModule } from "primeng/button"
import { InputTextModule } from "primeng/inputtext"
import { InputTextarea } from "primeng/inputtextarea"
import { DropdownModule } from "primeng/dropdown"
import { ToastModule } from "primeng/toast"
import { MessageService } from "primeng/api"
import { AppTopbar } from "../../../layout/component/app.topbar"
import { AppSidebar } from "../../../layout/component/app.sidebar"
import { Router } from "@angular/router"
import { CommonModule } from "@angular/common"
import { Location } from "@angular/common"

interface Project {
  id?: number
  title: string
  description: string
  status: string
  priority: string
  createdDate?: Date
  lastModified?: Date
}

interface DropdownOption {
  label: string
  value: string
}

@Component({
  selector: "app-add-project",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppTopbar,
    AppSidebar,
    ButtonModule,
    InputTextModule,
    InputTextarea,
    DropdownModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: "./add-project.component.html",
  styleUrls: ["./add-project.component.scss"],
})
export class AddProjectComponent implements OnInit {
  project: Project = {
    title: "",
    description: "",
    status: "Planning",
    priority: "Medium",
  }

  isSubmitting = false

  statusOptions: DropdownOption[] = [
    { label: "Planning", value: "Planning" },
    { label: "Active", value: "Active" },
    { label: "In Progress", value: "In Progress" },
    { label: "On Hold", value: "On Hold" },
  ]

  priorityOptions: DropdownOption[] = [
    { label: "Low", value: "Low" },
    { label: "Medium", value: "Medium" },
    { label: "High", value: "High" },
    { label: "Critical", value: "Critical" },
  ]

  constructor(
    private router: Router,
    private location: Location,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    // Initialize component
  }

  goBack(): void {
    this.location.back()
  }

  resetForm(): void {
    this.project = {
      title: "",
      description: "",
      status: "Planning",
      priority: "Medium",
    }
  }

  isFormValid(): boolean {
    return !!(
      this.project.title?.trim() &&
      this.project.description?.trim() &&
      this.project.status &&
      this.project.priority
    )
  }

  createProject(): void {
    if (!this.isFormValid()) {
      this.messageService.add({
        severity: "error",
        summary: "Validation Error",
        detail: "Please fill in all required fields",
      })
      return
    }

    this.isSubmitting = true

    // Simulate API call
    setTimeout(() => {
      const newProject: Project = {
        ...this.project,
        id: Math.floor(Math.random() * 1000) + 100,
        createdDate: new Date(),
        lastModified: new Date(),
      }

      this.messageService.add({
        severity: "success",
        summary: "Success",
        detail: "Project created successfully!",
      })

      this.isSubmitting = false

      // Navigate to project detail or project list
      setTimeout(() => {
        this.router.navigate(["/projet/detail", newProject.id])
      }, 1500)
    }, 1000)
  }
}
