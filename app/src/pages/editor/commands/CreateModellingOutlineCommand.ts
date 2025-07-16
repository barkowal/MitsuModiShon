import type { ModellingOutline } from "../utils/objects/ModellingOutline";
import type { Command } from "./CommandInterface";

export class CreateModellingOutlineCommand implements Command {
    private modellingOutline: ModellingOutline;

    constructor(modellingOutline: ModellingOutline) {
        this.modellingOutline = modellingOutline;
        this.modellingOutline.createOutline();
    }

    execute() {
        this.modellingOutline.addOutline();
    }

    undo() {
        this.modellingOutline.removeOutline();
    }

    destroy(): void {
        if (this.modellingOutline.isOutlineInScene()) return;

        this.modellingOutline.disposeOutline();
    }

}
