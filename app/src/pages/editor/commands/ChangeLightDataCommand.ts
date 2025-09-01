import { LIGHT_ARRAY_DATA } from "../utils/Types";
import type { Command } from "./CommandInterface";
import { Mesh, Light, Object3D } from "three/webgpu";

export class ChangeLightDataCommand implements Command {
    private light: Light | null;
    private oldData: Array<number>;
    private newData: Array<number>;

    constructor(obj: Object3D, newData: Array<number>) {
        this.light = this.getLight(obj);
        this.newData = newData;
        this.oldData = this.getOldData(this.light);
    }

    execute() {
        if (!this.light) return;

        this.light.color.setHex(this.newData[LIGHT_ARRAY_DATA.color]);
        this.light.intensity = this.newData[LIGHT_ARRAY_DATA.intensity];

    }

    undo() {
        if (!this.light) return;

        this.light.color.setHex(this.oldData[LIGHT_ARRAY_DATA.color]);
        this.light.intensity = this.oldData[LIGHT_ARRAY_DATA.intensity];
    }

    destroy(): void {
    }

    private getLight(obj: Object3D): Light | null {

        if (obj instanceof Light) {
            return obj;
        }

        if (obj instanceof Mesh) {
            const light = obj.children[0];
            if (light instanceof Light) {
                return light;
            }
        }
        return null;
    }

    private getOldData(obj: Light | null): Array<number> {
        if (!obj) return [-1, -1, -1];

        return [obj.id, obj.color.getHex(), obj.intensity];
    }
}
