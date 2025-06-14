import { Button } from "@/components/ui/button";
import { EDITOR_EVENT, editorEventBus } from "../utils/EditorEvents";
import { Redo, Undo } from "lucide-react";

function EditorTopBar() {

  return (
    <>
      <div className="flex w-full h-full gap-4 p-2 ml-10">
        <Button onClick={() => { editorEventBus.emit(EDITOR_EVENT.UNDO) }}>
          <Undo />
        </Button>
        <Button onClick={() => { editorEventBus.emit(EDITOR_EVENT.REDO) }}>
          <Redo />
        </Button>
      </div>
    </>
  );
}

export default EditorTopBar;
