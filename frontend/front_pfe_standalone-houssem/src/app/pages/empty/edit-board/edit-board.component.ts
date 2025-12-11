import { Component, Input, type OnInit, Output, EventEmitter } from "@angular/core"
import { Board } from "../../../models/board.model"
import { Column } from "../../../models/column.model"
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome"
import { faPlus, faSave, faTrash, faTimes } from "@fortawesome/free-solid-svg-icons"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"

@Component({
    selector: "app-edit-board",
    standalone: true,
    imports: [FontAwesomeModule, ReactiveFormsModule, FormsModule],
    templateUrl: "./edit-board.component.html",
    styleUrl: "./edit-board.component.scss",
})
export class EditBoardComponent implements OnInit {
    @Input() public board: Board = new Board(1, "", [])
    @Output() public close = new EventEmitter<any>()

    public faTrash = faTrash
    public faPlus = faPlus
    public faSave = faSave
    public faTimes = faTimes

    constructor() {}

    ngOnInit(): void {
        // Ensure board has at least one column
        if (this.board.columns.length === 0) {
            this.addColumn()
        }
    }

    addColumn(): void {
        this.board.columns.push(new Column("New Column"))
    }

    removeColumn(index: number): void {
        if (this.board.columns.length > 1) {
            this.board.columns.splice(index, 1)
        }
    }

    submitForm(): void {
        // Validate board name
        if (!this.board.name.trim()) {
            alert("Please enter a board name")
            return
        }

        // Validate columns
        const validColumns = this.board.columns.filter((col) => col.name.trim())
        if (validColumns.length === 0) {
            alert("Please add at least one column")
            return
        }

        // Update board with valid columns only
        this.board.columns = validColumns

        localStorage.setItem("board", JSON.stringify(this.board))
        this.close.emit()
    }
}
