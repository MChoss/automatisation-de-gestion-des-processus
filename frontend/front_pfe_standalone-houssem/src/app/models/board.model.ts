import { Column } from "./column.model";

export class Board {
    id: number = 0;
    name: string = "";
    description: string = "";
    columns: Column[] = [];
    constructor(id: number, name: string, columns: Column[]) {
        this.id = id;
        this.name = name;
        this.columns = columns;
    }
}
