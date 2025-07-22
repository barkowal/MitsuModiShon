import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { useState } from "react";
import { EDITOR_EVENT, editorEventBus } from "../utils/EditorEvents";

export function RenderingButton() {
  const [isRendering, setIsRendering] = useState(false);

  const handleSwitchScene = () => {
    setIsRendering(!isRendering);
    editorEventBus.emit(EDITOR_EVENT.SwitchRendering, !isRendering);
  };

  return (<>

    <Button className="[&_svg]:size-6" onClick={handleSwitchScene} >
      <Camera className="size-1" />
      <p>
        {
          isRendering ? "Switch to Editing" : "Switch to Rendering"
        }
      </p>

    </Button>

  </>);

}
