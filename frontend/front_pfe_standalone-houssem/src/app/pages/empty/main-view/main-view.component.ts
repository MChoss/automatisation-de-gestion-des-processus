import { Component, inject, type OnInit, signal, type TemplateRef, type WritableSignal } from "@angular/core"
import { Board } from "../../../models/board.model"
import { Column } from "../../../models/column.model"
import { Task } from "../../../models/task.model"
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome"
import {
    faBars,
    faBug,
    faCalendar,
    faCoffee,
    faPencil,
    faPlus,
    faSave,
    faChartBar,
    faCog,
} from "@fortawesome/free-solid-svg-icons"
import { ModalDismissReasons, NgbModal, NgbModalModule } from "@ng-bootstrap/ng-bootstrap"
import { EditBoardComponent } from "../edit-board/edit-board.component"
import { AddTaskComponent } from "../add-task/add-task.component"
import { TaskTypeEnum } from "../../../models/enum/task.enum"
import { CommonModule } from "@angular/common"
import { KanbanViewComponent } from "../kanban-view/kanban-view.component"
import { TableViewComponent } from "../table-view/table-view.component"
import { AppTopbar } from "../../../layout/component/app.topbar"
import { AppSidebar } from "../../../layout/component/app.sidebar"


@Component({
    selector: "app-main-view",
    standalone: true,
    imports: [
    CommonModule,
    FontAwesomeModule,
    KanbanViewComponent,
    TableViewComponent,
    EditBoardComponent,
    AddTaskComponent,
    NgbModalModule,
    AppTopbar,
    AppSidebar
],
    templateUrl: "./main-view.component.html",
    styleUrls: ["./main-view.component.scss"],
})
export class MainViewComponent implements OnInit {
    private modalService = inject(NgbModal)
    closeResult: WritableSignal<string> = signal("")

    public faCoffee = faCoffee
    public faPencil = faPencil
    public faSave = faSave
    public faPlus = faPlus
    public faCalendar = faCalendar
    public faBug = faBug
    public faBars = faBars
    public faChartBar = faChartBar
    public faCog = faCog

    public enumTaskType = TaskTypeEnum
    public tableView = false
    public showEditBoard = false

    constructor() {}

    public board: Board = new Board(1, "My Board", [])
    public tasks: Task[] = []
    public selectedTask: Task = new Task(0, "")

    ngOnInit(): void {
        const board = JSON.parse(localStorage.getItem("board") || "null")
        const tasks = JSON.parse(localStorage.getItem("tasks") || "[]")
        this.tasks = tasks
        if (board != null) {
            this.board = board
        } else {
            this.board.columns.push(new Column("Idea"))
            this.board.columns.push(new Column("Research"))
            this.board.columns.push(new Column("Todo"))
            this.board.columns.push(new Column("Done"))
            localStorage.setItem("board", JSON.stringify(this.board))
        }
    }

    saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(this.tasks))
    }

    removeTask(id: number) {
        this.tasks = this.tasks.filter((x) => x.id != id)
        this.saveTasks()
    }

    openEditBoard() {
        this.showEditBoard = true
    }

    closeEditBoard() {
        this.showEditBoard = false
    }

    open(content: TemplateRef<any>, size = "xl") {
        this.modalService
            .open(content, {
                ariaLabelledBy: "modal-basic-title",
                size: size,
                centered: true,
            })
            .result.then(
            (result) => {
                this.closeResult.set(`Closed with: ${result}`)
            },
            (reason) => {
                this.closeResult.set(`Dismissed ${this.getDismissReason(reason)}`)
            },
        )
    }

    newTaskModal() {
        if (this.board.columns.length == 0) return

        const task = new Task(0, "")
        const maxId = this.tasks.reduce((max, task) => Math.max(max, task.id), 0)
        task.id = maxId + 1

        this.tasks.push(task)
        this.selectedTask = task

        const modalRef = this.modalService.open(AddTaskComponent, {
            size: "xl",
            centered: true,
        })

        modalRef.componentInstance.task = this.selectedTask
        modalRef.componentInstance.columns = this.board.columns

        modalRef.componentInstance.saveTasks.subscribe(() => {
            this.saveTasks()
            modalRef.close()
        })

        modalRef.componentInstance.close.subscribe(() => {
            modalRef.dismiss()
        })

        modalRef.componentInstance.removeTask.subscribe((taskId: number) => {
            this.removeTask(taskId)
            modalRef.close()
        })
    }

    openTaskModal(task: Task) {
        if (this.board.columns.length == 0) return

        this.selectedTask = task

        const modalRef = this.modalService.open(AddTaskComponent, {
            size: "xl",
            centered: true,
        })

        modalRef.componentInstance.task = this.selectedTask
        modalRef.componentInstance.columns = this.board.columns

        modalRef.componentInstance.saveTasks.subscribe(() => {
            this.saveTasks()
            modalRef.close()
        })

        modalRef.componentInstance.close.subscribe(() => {
            modalRef.dismiss()
        })

        modalRef.componentInstance.removeTask.subscribe((taskId: number) => {
            this.removeTask(taskId)
            modalRef.close()
        })
    }

    private getDismissReason(reason: any): string {
        switch (reason) {
            case ModalDismissReasons.ESC:
                return "by pressing ESC"
            case ModalDismissReasons.BACKDROP_CLICK:
                return "by clicking on a backdrop"
            default:
                return `with: ${reason}`
        }
    }
}
