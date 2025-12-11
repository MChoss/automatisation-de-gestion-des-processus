import { Component, Input, output, type OnInit, type OnChanges } from "@angular/core"
import type { Column } from "../../../models/column.model"
import type { Task } from "../../../models/task.model"
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome"
import { faBug, faCalendar, faPenToSquare, faPlus, type IconDefinition } from "@fortawesome/free-solid-svg-icons"
import { TaskTypeEnum } from "../../../models/enum/task.enum"
import { CommonModule } from "@angular/common"
import type { SubTask } from "../../../models/sub-task.model"
import { PriorityEnum } from "../../../models/enum/priority.enum"
import { FormsModule } from "@angular/forms"

@Component({
    selector: "app-table-view",
    standalone: true,
    imports: [CommonModule, FontAwesomeModule, FormsModule],
    templateUrl: "./table-view.component.html",
    styleUrl: "./table-view.component.scss",
})
export class TableViewComponent implements OnInit, OnChanges {
    @Input() public columns: Column[] = []
    @Input() public tasks: Task[] = []

    public newTask = output<void>()
    public openTask = output<Task>()

    public searchTerm = ""
    public statusFilter = ""
    public priorityFilter = ""
    public filteredTasks: Task[] = []
    public sortField = ""
    public sortDirection: "asc" | "desc" = "asc"

    public faPlus = faPlus
    public faCalendar = faCalendar
    public faBug = faBug
    public faPenToSquare = faPenToSquare

    public enumTaskType = TaskTypeEnum
    public priorityEnum = PriorityEnum

    ngOnInit() {
        this.filteredTasks = [...this.tasks]
    }

    ngOnChanges() {
        this.applyFilters()
    }

    onSearch() {
        this.applyFilters()
    }

    onFilterChange() {
        this.applyFilters()
    }

    applyFilters() {
        let filtered = [...this.tasks]

        // Apply search filter
        if (this.searchTerm.trim()) {
            const searchLower = this.searchTerm.toLowerCase()
            filtered = filtered.filter(
                (task) =>
                    task.title.toLowerCase().includes(searchLower) ||
                    task.description.toLowerCase().includes(searchLower) ||
                    (task.assignee && task.assignee.toLowerCase().includes(searchLower)),
            )
        }

        // Apply status filter
        if (this.statusFilter) {
            filtered = filtered.filter((task) => task.column.toString() === this.statusFilter)
        }

        // Apply priority filter
        if (this.priorityFilter) {
            filtered = filtered.filter((task) => task.priority.toString() === this.priorityFilter)
        }

        this.filteredTasks = filtered
    }

    sortBy(field: string) {
        if (this.sortField === field) {
            this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc"
        } else {
            this.sortField = field
            this.sortDirection = "asc"
        }

        this.filteredTasks.sort((a, b) => {
            let aValue: any = a[field as keyof Task]
            let bValue: any = b[field as keyof Task]

            if (field === "dueDate") {
                aValue = aValue ? new Date(aValue) : new Date("9999-12-31")
                bValue = bValue ? new Date(bValue) : new Date("9999-12-31")
            }

            if (aValue < bValue) {
                return this.sortDirection === "asc" ? -1 : 1
            }
            if (aValue > bValue) {
                return this.sortDirection === "asc" ? 1 : -1
            }
            return 0
        })
    }

    getIconType(type: number): IconDefinition {
        switch (Number(type)) {
            case this.enumTaskType.bug:
                return this.faBug
            default:
                return this.faCalendar
        }
    }

    getCheckedSubTaksLength(tasks: SubTask[]): number {
        return tasks.filter((x) => x.checked == true).length
    }

    getPriorityName(id: number): string {
        switch (Number(id)) {
            case this.priorityEnum.high:
                return "High"
            case this.priorityEnum.medium:
                return "Medium"
            default:
                return "Low"
        }
    }

    getPriorityClass(id: number): string {
        switch (Number(id)) {
            case this.priorityEnum.high:
                return "high"
            case this.priorityEnum.medium:
                return "medium"
            default:
                return "low"
        }
    }

    getStatusName(colIndex: number): string {
        switch (colIndex) {
            case 0:
                return "To Do"
            case 1:
                return "In Progress"
            case 2:
                return "Review"
            case 3:
                return "Done"
            default:
                return "Unknown"
        }
    }

    getStatusClass(colIndex: number): string {
        switch (colIndex) {
            case 0:
                return "todo"
            case 1:
                return "progress"
            case 2:
                return "review"
            case 3:
                return "done"
            default:
                return "todo"
        }
    }

    getInitials(name: string): string {
        if (!name) return "?"
        return name
            .split(" ")
            .map((word) => word.charAt(0))
            .join("")
            .toUpperCase()
            .substring(0, 2)
    }

    getLabelClass(label: string): string {
        return label.toLowerCase().replace(/\s+/g, "-")
    }

    isOverdue(dueDate: string): boolean {
        if (!dueDate) return false
        return new Date(dueDate) < new Date()
    }

    getCurrentDate(): string {
        return new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        })
    }

    getColName(colIndex: number): string {
        return this.columns[colIndex]?.name || "Unknown"
    }
}
