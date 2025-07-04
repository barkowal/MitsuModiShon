import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { EDITOR_EVENT, editorEventBus } from "../utils/EditorEvents";
import { SquarePen } from "lucide-react";
import { EDITOR_MODE } from "../utils/Types";
import { useState } from "react";

function ChangeModeDropdown() {
  const [currentMode, setCurrentMode] = useState<string>(EDITOR_MODE.ObjectMode);

  const handleModeChange = (val: string) => {
    editorEventBus.emit(EDITOR_EVENT.ChangeEditorMode, val);
    setCurrentMode(val);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="[&_svg]:size-6" >
          <SquarePen className="size-1" /> {currentMode}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel> Select Editor Mode </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {
            Object.values(EDITOR_MODE).map((val, i) => (
              <DropdownMenuItem onClick={() => { handleModeChange(val); }}
                key={i}>{val}</DropdownMenuItem>
            ))
          }
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu >
  );
}

export default ChangeModeDropdown;
