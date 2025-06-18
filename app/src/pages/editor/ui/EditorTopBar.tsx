import { Button } from "@/components/ui/button";
import { EDITOR_EVENT, editorEventBus } from "../utils/EditorEvents";
import { Redo, Undo } from "lucide-react";
import AddMeshDropdown from "./AddMeshDropdown";
import RemoveMeshButton from "./RemoveMeshButton";

function EditorTopBar() {

  return (
    <>
      <div className="flex w-full h-full gap-4 p-2 mx-10 justify-center">
        <Button className="[&_svg]:size-6" onClick={() => { editorEventBus.emit(EDITOR_EVENT.UNDO); }}>
          <Undo className="size-1" />
        </Button>
        <Button className="[&_svg]:size-6" onClick={() => { editorEventBus.emit(EDITOR_EVENT.REDO); }}>
          <Redo className="size-1" />
        </Button>
        <AddMeshDropdown />
        <RemoveMeshButton />
      </div>
    </>
  );
}

export default EditorTopBar;
