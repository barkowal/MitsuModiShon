import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { EDITOR_EVENT, editorEventBus } from "../utils/EditorEvents";
import { EDITOR_LAYER, INTERSECTION_LAYER, RENDER_LAYER } from "../utils/Global";

export function LayersMenu() {
  const [showInEditor, setShowInEditor] = useState(true);
  const [showInRender, setShowInRender] = useState(true);

  const handleEditorVisibility = (val: boolean) => {
    setShowInEditor(val);
    editorEventBus.emit(EDITOR_EVENT.SetObjectLayers,
      0
      | (Number(val) << EDITOR_LAYER)
      | (Number(showInRender) << RENDER_LAYER)
      | (Number(val) << INTERSECTION_LAYER)
    );
  };

  const handleRenderVisibility = (val: boolean) => {
    setShowInRender(val);

    editorEventBus.emit(EDITOR_EVENT.SetObjectLayers,
      0
      | (Number(showInEditor) << EDITOR_LAYER)
      | (Number(val) << RENDER_LAYER)
      | (Number(showInEditor) << INTERSECTION_LAYER)
    );
  };

  useEffect(() => {

    const handleRefreshObjectLayers = (layerMask: number) => {
      const showEditorMask = layerMask & (1 << EDITOR_LAYER);
      const showRenderMask = layerMask & (1 << RENDER_LAYER);
      setShowInEditor(Boolean(showEditorMask));
      setShowInRender(Boolean(showRenderMask));
    };

    editorEventBus.on(EDITOR_EVENT.RefreshObjectLayers, handleRefreshObjectLayers);

    return (() => {
      editorEventBus.off(EDITOR_EVENT.RefreshObjectLayers, handleRefreshObjectLayers);
    });

  }, []);


  return (<>
    <div className="bg-sidebar-accent my-2 overflow-auto ">
      <div className="w-[calc(100%-10px)] h-[calc(100%-10px)]">
        <div className=" select-none p-2 flex justify-between" >
          <span className="w-full font-bold">
            VISIBILITY
          </span>
        </div>

        <Separator orientation="horizontal" />

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-center gap-3 w-full m-2">
              <label htmlFor="EditorVisibility" className="w-1/2 font-bold select-none">Editor</label>
              <Checkbox id="EditorVisibility" checked={showInEditor} onCheckedChange={(val: boolean) => { handleEditorVisibility(val); }} />
            </div>
          </TooltipTrigger>
          <TooltipContent className="w-fit" side="left">
            <p>Show object in editor view.</p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation="horizontal" />

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-center gap-3 w-full m-2">
              <label htmlFor="RenderVisibility" className="w-1/2 font-bold select-none">Render</label>
              <Checkbox id="RenderVisibility" checked={showInRender} onCheckedChange={(val: boolean) => { handleRenderVisibility(val); }} />
            </div>
          </TooltipTrigger>
          <TooltipContent className="w-fit" side="left">
            <p>Show object in render view.</p>
          </TooltipContent>
        </Tooltip>

      </div>
    </div>
  </>);
}
