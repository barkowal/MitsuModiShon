import { Button } from "@/components/ui/button";
import { EDITOR_EVENT, editorEventBus } from "../utils/EditorEvents";
import { LucidePackageMinus } from "lucide-react";

function RemoveMeshButton() {
  return (
    <>
      <Button className="[&_svg]:size-6"
        onClick={() => { editorEventBus.emit(EDITOR_EVENT.RemoveMesh); }}><LucidePackageMinus className="size-1" /></Button>
    </>
  );
}

export default RemoveMeshButton;
