import { Task } from "./task.model";

export class Column {
    id: number = 0;
    name: string = "";

    constructor(name: string) {
        this.name = name;
    }
}
