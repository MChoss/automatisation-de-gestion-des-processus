import type { SubTask } from "./sub-task.model"

export class Task {
    id = 0
    title = ""
    description = ""
    user = ""
    status = ""
    column = 0
    type = 1
    priority = 3
    subTasks: SubTask[] = []
    ready = false
    assignee = ""
    dueDate = ""
    labels: string[] = []

    constructor(id: number, title: string, ready = false) {
        this.id = id
        this.title = title
        this.ready = ready
        this.assignee = ""
        this.dueDate = ""
        this.labels = []
    }
}
