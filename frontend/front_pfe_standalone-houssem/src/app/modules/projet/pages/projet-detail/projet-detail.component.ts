import { Component, OnInit } from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { Location, CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { AppTopbar } from "../../../../layout/component/app.topbar"
import { AppSidebar } from "../../../../layout/component/app.sidebar"
import { ButtonModule } from "primeng/button"
import { InputTextModule } from "primeng/inputtext"
import { InputTextarea } from "primeng/inputtextarea"
import { DropdownModule } from "primeng/dropdown"
import { ToastModule } from "primeng/toast"
import { ConfirmDialogModule } from "primeng/confirmdialog"
import { MessageService } from "primeng/api"
import { ConfirmationService } from "primeng/api"


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
        AppTopbar,
        AppSidebar,
        ButtonModule,
        InputTextModule,
        InputTextarea,
        DropdownModule,
        ToastModule,
        ConfirmDialogModule,
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: "./projet-detail.component.html",
    styleUrls: ["./projet-detail.component.scss"],
})
export class ProjectDetailComponent implements OnInit {
    // ALL PROPERTIES THAT HTML NEEDS
    project: Project | null = null
    originalProject: Project | null = null
    isEditMode: boolean = false
    error: string | null = null

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

    // Sample projects data
    Project = [
        {
            id: 1,
            title: "E-commerce Platform",
            description: "A comprehensive online shopping platform with advanced features including user authentication, payment processing, inventory management, and real-time analytics dashboard.",
            status: "Active",
            priority: "High",
            createdDate: new Date("2024-01-15"),
            lastModified: new Date("2024-03-10"),
        },
        {
            id: 2,
            title: "Mobile Banking App",
            description: "Secure mobile banking application with biometric authentication.",
            status: "In Progress",
            priority: "Critical",
            createdDate: new Date("2024-02-20"),
            lastModified: new Date("2024-03-12"),
        },
        {
            id: 3,
            title: "Task Management System",
            description: "An intuitive project management tool designed for teams to collaborate effectively, track progress, manage deadlines, assign tasks, and generate comprehensive reports for better productivity and workflow optimization.",
            status: "Completed",
            priority: "Medium",
            createdDate: new Date("2024-01-10"),
            lastModified: new Date("2024-02-28"),
        },
        {
            id: 4,
            title: "Weather Dashboard",
            description: "Real-time weather monitoring and forecasting application.",
            status: "On Hold",
            createdDate: new Date("2024-03-05"),
        },
        {
            id: 5,
            title: "Social Media Analytics",
            description:
                "Advanced analytics platform for social media performance tracking, engagement metrics, audience insights, competitor analysis, and automated reporting with customizable dashboards and data visualization tools.",
            status: "Active",
            createdDate: new Date("2024-02-28"),
        },
        {
            id: 6,
            title: "Learning Management System",
            description: "Educational platform for online courses and student progress tracking.",
            status: "In Progress",
            createdDate: new Date("2024-01-25"),
        },
        {
            id: 7,
            title: "Inventory Management",
            description: "Complete inventory tracking and management system for warehouses.",
            status: "Planning",
            createdDate: new Date("2024-03-01"),
        },
        {
            id: 8,
            title: "Customer Support Portal",
            description: "Comprehensive customer support and ticketing system.",
            status: "Cancelled",
            createdDate: new Date("2024-02-15"),
        },
    ]

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private location: Location,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
    ) {}

    ngOnInit(): void {
        this.loadProject()
    }

    

    // ALL METHODS THAT HTML CALLS
    loadProject(): void {
        const id = this.route.snapshot.paramMap.get("id")
        console.log("Loading project with ID:", id)
        console.log("Available projects:", this.Project)
        if (id != null) {
      
     
           
                const foundProject = this.Project.find((p) => p.id === Number(id))
                console.log("Found project:", foundProject)
                if (foundProject) {
                    this.project = { ...foundProject }
                    this.originalProject = { ...foundProject }
                    this.error = null
                } else {
                    this.error = "Project not found"
                }
            
        } else {
            this.error = "Invalid project ID"
        }
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
            this.project.lastModified = new Date()
            this.originalProject = { ...this.project }
            this.isEditMode = false

            this.messageService.add({
                severity: "success",
                summary: "Success",
                detail: "Project updated successfully",
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

    viewTasks(): void {
        this.messageService.add({
            severity: "info",
            summary: "Info",
            detail: "Tasks view coming soon!",
        })
    }

    manageTeam() {
        this.messageService.add({
            severity: "info",
            summary: "Info",
            detail: "Team management coming soon!",
        })
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
                this.messageService.add({
                    severity: "success",
                    summary: "Deleted",
                    detail: "Project deleted successfully",
                })
                this.router.navigate(["/projet"])
            },
        })
    }
}
