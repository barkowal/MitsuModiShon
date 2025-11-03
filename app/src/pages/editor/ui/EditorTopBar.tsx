import { Button } from "@/components/ui/button";
import { EDITOR_EVENT, editorEventBus } from "../utils/EditorEvents";
import { Redo, Undo } from "lucide-react";
import RemoveMeshButton from "./RemoveMeshButton";
import ChangeModeDropdown from "./EditorModeMenu/ChangeModeDropdown";
import { RenderingButton } from "./RenderingButton";
import { AddObjectDialog } from "./AddObjectMenu/AddObjectDialog";
import { OptionsDropdown } from "./OptionsDropdown";
import { AddLightDialog } from "./AddLightDialog";

function EditorTopBar() {

  return (
    <>
      <div className="flex w-full h-full gap-4 p-2 mx-10 justify-center">
        <OptionsDropdown />
        <Button aria-label="UndoButton" variant="outline" className="[&_svg]:size-6" onClick={() => { editorEventBus.emit(EDITOR_EVENT.UNDO); }}>
          <Undo className="size-1" />
        </Button>
        <Button aria-label="RedoButton" variant="outline" className="[&_svg]:size-6" onClick={() => { editorEventBus.emit(EDITOR_EVENT.REDO); }}>
          <Redo className="size-1" />
        </Button>
        <AddObjectDialog />
        <RemoveMeshButton />
        <AddLightDialog />
        <ChangeModeDropdown />
        <RenderingButton />
      </div>
    </>
  );
}

export default EditorTopBar;
