import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { EDITOR_EVENT, editorEventBus } from "../utils/EditorEvents";
import { Dot, Minus, Square, SquarePen } from "lucide-react";
import { EDITING_TYPE, EDITOR_MODE } from "../utils/Types";
import { useEffect, useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

function ChangeModeDropdown() {
  const [currentMode, setCurrentMode] = useState<string>(EDITOR_MODE.ObjectMode);
  const [editingType, setEditingType] = useState<number>(EDITING_TYPE.Faces);

  const handleModeChange = (val: string) => {
    editorEventBus.emit(EDITOR_EVENT.ChangeEditorMode, val);
    setCurrentMode(val);
    setEditingType(0);
  };

  const handleEditingChange = (val: string) => {
    const type = Number(val);
    setEditingType(type);
  };

  useEffect(() => {
    const handleSwitchMode = () => {
      switch (currentMode) {
        case EDITOR_MODE.ObjectMode: {
          handleModeChange(EDITOR_MODE.EditMode);
          break;
        }
        case EDITOR_MODE.EditMode: {
          handleModeChange(EDITOR_MODE.ObjectMode);
          break;
        }
        default: {
          handleModeChange(EDITOR_MODE.ObjectMode);
          break;
        }
      }
    };

    editorEventBus.on(EDITOR_EVENT.SwtichEditorMode, handleSwitchMode);
    return (() => {
      editorEventBus.off(EDITOR_EVENT.SwtichEditorMode, handleSwitchMode);
    });
  }, [currentMode]);

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
      {
        currentMode === EDITOR_MODE.EditMode ?

          <ToggleGroup
            value={editingType.toString()}
            onValueChange={handleEditingChange}
            variant="outline"
            type="single">
            <ToggleGroupItem value={EDITING_TYPE.Vertices.toString()} aria-label="Toggle Vertices">
              <Dot />
            </ToggleGroupItem>
            <ToggleGroupItem value={EDITING_TYPE.Edges.toString()} aria-label="Toggle Edges">
              <Minus />
            </ToggleGroupItem>
            <ToggleGroupItem value={EDITING_TYPE.Faces.toString()} aria-label="Toggle Faces">
              <Square />
            </ToggleGroupItem>
          </ToggleGroup>
          :
          null
      }
    </DropdownMenu >

  );
}

export default ChangeModeDropdown;
