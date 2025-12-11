import { Component, Input, output, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome"
import { faPlus, faEllipsisH, faCalendar, faComment, faHeart } from "@fortawesome/free-solid-svg-icons"
import {
    CdkDrag,
    CdkDropList,
    CdkDropListGroup,
    type CdkDragDrop,
    moveItemInArray,
    transferArrayItem,
} from "@angular/cdk/drag-drop"
import type { Column } from "../../../models/column.model"
import type { Task } from "../../../models/task.model"
import { PriorityEnum } from "../../../models/enum/priority.enum"

@Component({
    selector: "app-kanban-view",
    standalone: true,
    imports: [CommonModule, CdkDrag, CdkDropList, CdkDropListGroup, FontAwesomeModule],
    templateUrl: "./kanban-view.component.html",
    styleUrl: "./kanban-view.component.scss",
})
export class KanbanViewComponent implements OnInit {
    @Input() public columns: Column[] = []
    @Input() public tasks: Task[] = []

    public newTask = output<void>()
    public openTask = output<Task>()
    public updateTasks = output<Task[]>()

    public faPlus = faPlus
    public faEllipsisH = faEllipsisH
    public faCalendar = faCalendar
    public faComment = faComment
    public faHeart = faHeart

    constructor() {}

    ngOnInit(): void {}

    getTasks(columnIndex: number): Task[] {
        return this.tasks.filter((task) => task.column === columnIndex && task.ready)
    }

    trackByTaskId(index: number, task: Task): number {
        return task.id
    }

    drop(event: CdkDragDrop<Task[]>, columnIndex: number): void {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex)
        } else {
            const task = event.previousContainer.data[event.previousIndex]
            task.column = columnIndex

            transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex)
        }

        this.updateTasks.emit(this.tasks)
    }

    getCurrentDate(): string {
        const today = new Date()
        return today.toLocaleDateString("en-GB")
    }

    getPriorityName(priority: number): string {
        switch (priority) {
            case PriorityEnum.high:
                return "high"
            case PriorityEnum.medium:
                return "medium"
            case PriorityEnum.low:
                return "low"
            default:
                return "medium"
        }
    }
}
