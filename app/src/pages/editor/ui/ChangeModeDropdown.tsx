import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { EDITOR_EVENT, editorEventBus } from "../utils/EditorEvents";
import { Dot, Minus, Square, SquarePen } from "lucide-react";
import { EDITING_MODE, EDITOR_MODE } from "../utils/Types";
import { useEffect, useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

let EditorMode: string = EDITOR_MODE.ObjectMode;

function ChangeModeDropdown() {
  const [currentMode, setCurrentMode] = useState<string>(EditorMode);
  const [editingMode, setEditingMode] = useState<number>(EDITING_MODE.Faces);

  const handleModeChange = (val: string) => {
    editorEventBus.emit(EDITOR_EVENT.ChangeEditorMode, val);
    EditorMode = val;
    setCurrentMode(val);
    setEditingMode(0);
  };

  const handleEditingChange = (val: string) => {
    const mode = Number(val);
    editorEventBus.emit(EDITOR_EVENT.ChangeEditingMode, mode);
    setEditingMode(mode);
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


    const handleNumberPress = (nb: number) => {
      if (currentMode !== EDITOR_MODE.EditMode) return;
      switch (nb) {
        case 1: {
          handleEditingChange(EDITING_MODE.Vertices.toString());
          break;
        }
        case 2: {
          handleEditingChange(EDITING_MODE.Edges.toString());
          break;
        }
        case 3: {
          handleEditingChange(EDITING_MODE.Faces.toString());
          break;
        }
        default:
          handleEditingChange(EDITING_MODE.Faces.toString());
      }
    };

    editorEventBus.on(EDITOR_EVENT.SwtichEditorMode, handleSwitchMode);
    editorEventBus.on(EDITOR_EVENT.NumberPressed, handleNumberPress);
    return (() => {
      editorEventBus.off(EDITOR_EVENT.SwtichEditorMode, handleSwitchMode);
      editorEventBus.off(EDITOR_EVENT.NumberPressed, handleNumberPress);
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
            value={editingMode.toString()}
            onValueChange={handleEditingChange}
            variant="outline"
            type="single">
            <ToggleGroupItem value={EDITING_MODE.Vertices.toString()} aria-label="Toggle Vertices">
              <Dot />
            </ToggleGroupItem>
            <ToggleGroupItem value={EDITING_MODE.Edges.toString()} aria-label="Toggle Edges">
              <Minus />
            </ToggleGroupItem>
            <ToggleGroupItem value={EDITING_MODE.Faces.toString()} aria-label="Toggle Faces">
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

export function GetCurrentEditorMode() {
  return EditorMode;
}
