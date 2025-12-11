import { Component, inject, Input, type OnInit, output } from "@angular/core"
import type { Column } from "../../../models/column.model"
import { Task } from "../../../models/task.model"
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome"
import {
    faBug,
    faCalendar,
    faCheck,
    faClose,
    faPencil,
    faPlus,
    faSave,
    faTrash,
    type IconDefinition,
} from "@fortawesome/free-solid-svg-icons"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { SubTask } from "../../../models/sub-task.model"
import { TaskTypeEnum } from "../../../models/enum/task.enum"
import { CommonModule } from "@angular/common"
import { PriorityEnum } from "../../../models/enum/priority.enum"
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap"

@Component({
    selector: "app-add-task",
    standalone: true,
    imports: [CommonModule, FontAwesomeModule, ReactiveFormsModule, FormsModule],
    templateUrl: "./add-task.component.html",
    styleUrl: "./add-task.component.scss",
})
export class AddTaskComponent implements OnInit {
    @Input() public task: Task = new Task(1, "")
    @Input() public columns: Column[] = []

    public close = output<void>()
    public saveTasks = output<void>()
    public removeTask = output<number>()

    public faTrash = faTrash
    public faPlus = faPlus
    public faSave = faSave
    public faPencil = faPencil
    public faCheck = faCheck
    public faClose = faClose
    public faCalendar = faCalendar
    public faBug = faBug

    public enumTaskType = TaskTypeEnum
    public priorityEnum = PriorityEnum

    public newLabel = ""
    public availableLabels = [
        "Frontend",
        "Backend",
        "Design",
        "Security",
        "Database",
        "React",
        "Review",
        "Bug",
        "Feature",
    ]

    private activeModal = inject(NgbActiveModal)

    constructor() {}

    ngOnInit(): void {
        // Set default column if not set
        if (this.task.column === undefined && this.columns.length > 0) {
            this.task.column = 0
        }

        // Initialize properties if they don't exist
        if (!this.task.labels) {
            this.task.labels = []
        }

        if (!this.task.assignee) {
            this.task.assignee = ""
        }

        if (!this.task.dueDate) {
            this.task.dueDate = ""
        }
    }

    addLabel(): void {
        if (this.newLabel.trim() && !this.availableLabels.includes(this.newLabel.trim())) {
            this.availableLabels.push(this.newLabel.trim())
            this.toggleLabel(this.newLabel.trim())
            this.newLabel = ""
        } else if (this.newLabel.trim() && this.availableLabels.includes(this.newLabel.trim())) {
            this.toggleLabel(this.newLabel.trim())
            this.newLabel = ""
        }
    }

    toggleLabel(label: string): void {
        if (!this.task.labels) {
            this.task.labels = []
        }

        const index = this.task.labels.indexOf(label)
        if (index > -1) {
            this.task.labels.splice(index, 1)
        } else {
            this.task.labels.push(label)
        }
    }

    isLabelSelected(label: string): boolean {
        return this.task.labels?.includes(label) || false
    }

    addSubTask() {
        const sub = new SubTask("")
        this.task.subTasks.push(sub)
    }

    removeSubTask(index: number): void {
        this.task.subTasks.splice(index, 1)
    }

    hasSubTasks() {
        return this.task.subTasks.length > 0
    }

    getIconType(type: number): IconDefinition {
        switch (Number(type)) {
            case this.enumTaskType.bug:
                return this.faBug
                break
            default:
                return this.faCalendar
        }
    }

    getCheckedPercentage(): number {
        if (this.task.subTasks.length == 0) return 100
        const checkedTasks = this.task.subTasks.filter((task) => task.checked).length
        return (checkedTasks / this.task.subTasks.length) * 100
    }

    submitForm(): void {
        if (!this.task.title || this.task.title.trim() === "") {
            alert("Please enter a task name")
            return
        }

        this.task.ready = true
        this.saveTasks.emit()
        this.activeModal.close()
    }

    closeThisModal() {
        if (!this.task.ready) {
            this.removeTask.emit(this.task.id)
        }
        this.activeModal.dismiss()
    }

    removeTaksById() {
        this.removeTask.emit(this.task.id)
        this.activeModal.close()
    }
}
