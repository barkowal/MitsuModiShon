import ColorPopover from "@/components/ColorPopover";
import { useEffect, useState } from "react";
import { EDITOR_EVENT, editorEventBus } from "../utils/EditorEvents";

export function MeshColorMenu() {
  const [meshColor, setMeshColor] = useState("#000000");

  const changeMeshColor = (color: string) => {
    setMeshColor(color);
    const hex_col = Number("0x" + color.slice(1));
    editorEventBus.emit(EDITOR_EVENT.ChangeMeshColor, hex_col);
  };

  useEffect(() => {

    const handleRefreshColor = (color: string) => {
      setMeshColor(color);
    };

    editorEventBus.on(EDITOR_EVENT.RefreshColorMenu, handleRefreshColor);
    return () => {
      editorEventBus.off(EDITOR_EVENT.RefreshColorMenu, handleRefreshColor);
    };

  }, []);

  return (<>
    <div className="bg-sidebar-accent p-1 font-bold select-none">
      <span className=" flex items-center justify-between ">
        <span className="mx-2">
          Mesh Color
        </span>
        <ColorPopover onColorChange={(val: string) => { changeMeshColor(val); }} colorValue={meshColor} />
      </span>
    </div>
  </>);

}
