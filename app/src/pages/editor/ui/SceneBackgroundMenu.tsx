import ColorPopover from "@/components/ColorPopover";
import { useState } from "react";
import { EDITOR_EVENT, editorEventBus } from "../utils/EditorEvents";
import { DEFAULT_SCENE_COLOR } from "../utils/Global";

export function SceneBackgroundMenu() {
  const [sceneColor, setSceneColor] = useState(DEFAULT_SCENE_COLOR);

  const changeSceneColor = (color: string) => {
    setSceneColor(color);
    const hex_col = Number("0x" + color.slice(1));
    editorEventBus.emit(EDITOR_EVENT.ChangeSceneColor, hex_col);
  };

  return (<>
    <div className="bg-sidebar-accent p-1 font-bold select-none">
      <span className=" flex items-center justify-between ">
        <span className="mx-2">
          Scene Color
        </span>
        <ColorPopover onColorChange={(val: string) => { changeSceneColor(val); }} colorValue={sceneColor} />
      </span>
    </div>
  </>);

}
