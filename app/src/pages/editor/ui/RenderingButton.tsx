import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { useState } from "react";
import { EDITOR_EVENT, editorEventBus } from "../utils/EditorEvents";
import { useTranslation } from "react-i18next";

export function RenderingButton() {
  const { t } = useTranslation();
  const [isRendering, setIsRendering] = useState(false);

  const handleSwitchScene = () => {
    setIsRendering(!isRendering);
    editorEventBus.emit(EDITOR_EVENT.SwitchRendering, !isRendering);
  };

  return (<>

    <Button variant="outline" className="[&_svg]:size-6" onClick={handleSwitchScene} >
      <Camera className="size-1" />
      <p>
        {
          isRendering ? t("EditingView") : t("RenderingView")
        }
      </p>

    </Button>

  </>);

}
