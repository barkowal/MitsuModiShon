import ColorPopover from "@/components/ColorPopover";
import { useState } from "react";
import { EDITOR_EVENT, editorEventBus } from "../utils/EditorEvents";

export function MeshColorMenu() {
  const [meshColor, setMeshColor] = useState("#000000");

  const changeMeshColor = (color: string) => {
    setMeshColor(color);
    const hex_col = Number("0x" + color.slice(1));
    editorEventBus.emit(EDITOR_EVENT.ChangeMeshColor, hex_col);
  };

  return (<>
    <div className="bg-sidebar-accent p-1 font-bold select-none">
      <span className=" flex items-center justify-between ">
        <span className="mx-2">
          Mesh Color
        </span>
        <ColorPopover onColorChange={(val: string) => { changeMeshColor(val); }} defaultValue={meshColor} />
      </span>
    </div>
  </>);

}
