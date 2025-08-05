import { Button } from "@/components/ui/button";
import { EDITOR_EVENT, editorEventBus } from "../utils/EditorEvents";
import { Download, Redo, Undo } from "lucide-react";
import RemoveMeshButton from "./RemoveMeshButton";
import { RenderingButton } from "./RenderingButton";
import { AddObjectDialog } from "./AddObjectMenu/AddObjectDialog";
import { AnimationOptionsDropdown } from "./AnimationOptionsDropdown";

function AnimationTopBar() {

  return (
    <>
      <div className="flex w-full h-full gap-4 p-2 mx-10 justify-center">
        <AnimationOptionsDropdown />
        <Button className="[&_svg]:size-6" onClick={() => { editorEventBus.emit(EDITOR_EVENT.UNDO); }}>
          <Undo className="size-1" />
        </Button>
        <Button className="[&_svg]:size-6" onClick={() => { editorEventBus.emit(EDITOR_EVENT.REDO); }}>
          <Redo className="size-1" />
        </Button>
        <AddObjectDialog />
        <RemoveMeshButton />
        <RenderingButton />
      </div>
    </>
  );
}

export default AnimationTopBar;
