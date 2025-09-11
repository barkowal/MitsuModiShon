import ColorPopover from "@/components/ColorPopover";
import { useState } from "react";
import { EDITOR_EVENT, editorEventBus } from "../utils/EditorEvents";
import { DEFAULT_SCENE_COLOR } from "../utils/Global";
import { useTranslation } from "react-i18next";

export function SceneBackgroundMenu() {
  const { t } = useTranslation();
  const [sceneColor, setSceneColor] = useState(DEFAULT_SCENE_COLOR);

  const changeSceneColor = (color: string) => {
    setSceneColor(color);
    const hex_col = Number("0x" + color.slice(1));
    editorEventBus.emit(EDITOR_EVENT.ChangeSceneColor, hex_col);
  };

  return (<>
    <div className=" p-1 font-bold select-none">
      <span className=" flex items-center justify-between ">
        <span className="mx-2">
          {t("SceneColor")}
        </span>
        <ColorPopover onColorChange={(val: string) => { changeSceneColor(val); }} colorValue={sceneColor} />
      </span>
    </div>
  </>);

}
