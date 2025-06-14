export interface Command {
    execute(): void;
    undo(): void;
    destroy(): void;
}
