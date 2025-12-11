export class SubTask {
    id: number = 0;
    title: string = "";
    checked: boolean = false;

    constructor(title: string) {
        this.title = title;
    }
}
