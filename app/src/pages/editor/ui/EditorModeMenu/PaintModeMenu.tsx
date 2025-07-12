import ColorPopover from "@/components/ColorPopover";
import { Brush } from "lucide-react";
import { useState } from "react";
import { EDITOR_EVENT, editorEventBus } from "../../utils/EditorEvents";


export function PaintModeMenu() {
  const [brushColor, setBrushColor] = useState("#000000");

  const changeBrushColor = (color: string) => {
    const hexColor = Number("0x" + color.slice(1));
    editorEventBus.emit(EDITOR_EVENT.ChangeBrushColor, hexColor);
    setBrushColor(color);
  };

  return (<>
    <span className=" flex items-center justify-between ">
      <span className="mx-2">
        <Brush />
      </span>
      <ColorPopover onColorChange={changeBrushColor} colorValue={brushColor} />
    </span>
  </>);
}
