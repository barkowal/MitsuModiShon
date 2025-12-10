import { Button } from "@/components/ui/button";
import { Move, Rotate3D, Scaling, SquareStack } from "lucide-react";
import { EDITOR_EVENT, editorEventBus } from "../utils/EditorEvents";
import { useState } from "react";

export default function ToolbarPanel() {
  const [multiSelect, setMultiSelect] = useState(false);

  return (<>
    <div className="absolute gap-1 bg-card rounded-md flex-col flex z-[100] top-1/12 m-4 ">
      <Button variant="ghost" className="[&_svg]:size-5 w-fit h-fit rounded-b-none"
        onClick={() => { editorEventBus.emit(EDITOR_EVENT.SetControlMode, "translate"); }}>
        <Move className="size-1" />
      </Button>
      <Button variant="ghost" className="[&_svg]:size-5 w-fit h-fit rounded-none"
        onClick={() => { editorEventBus.emit(EDITOR_EVENT.SetControlMode, "scale"); }}>
        <Scaling className="size-1" />
      </Button>
      <Button variant="ghost" className="[&_svg]:size-5 w-fit h-fit rounded-none"
        onClick={() => { editorEventBus.emit(EDITOR_EVENT.SetControlMode, "rotate"); }}>
        <Rotate3D className="size-1" />
      </Button>
      <Button variant="ghost" style={{backgroundColor:multiSelect?"var(--chart-1)":""}} className="[&_svg]:size-5 w-fit h-fit rounded-t-none"
        onClick={() => { editorEventBus.emit(EDITOR_EVENT.SetMultiSelect, !multiSelect);setMultiSelect(!multiSelect); }}>
        <SquareStack className="size-1" />
      </Button>
    </div >
  </>);
}
