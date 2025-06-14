import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { EDITOR_EVENT, editorEventBus } from "../utils/EditorEvents";
import { MESH_TYPE } from "../utils/GetMesh";

function AddMeshDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Add Mesh</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Add new mesh</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {
            Object.values(MESH_TYPE).map((val, i) => (
              <DropdownMenuItem onClick={() => { editorEventBus.emit(EDITOR_EVENT.AddMesh, val); }}
                key={i}>{val}</DropdownMenuItem>
            ))
          }
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu >
  )
}

export default AddMeshDropdown;
