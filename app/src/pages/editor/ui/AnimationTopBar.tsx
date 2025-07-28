import { Button } from "@/components/ui/button";
import { EDITOR_EVENT, editorEventBus } from "../utils/EditorEvents";
import { Redo, Undo } from "lucide-react";
import RemoveMeshButton from "./RemoveMeshButton";
import { SaveLoadDropdown } from "./SaveLoadDropdown";
import { RenderingButton } from "./RenderingButton";
import { AddObjectDialog } from "./AddObjectMenu/AddObjectDialog";

function AnimationTopBar() {

  return (
    <>
      <div className="flex w-full h-full gap-4 p-2 mx-10 justify-center">
        <SaveLoadDropdown />
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
