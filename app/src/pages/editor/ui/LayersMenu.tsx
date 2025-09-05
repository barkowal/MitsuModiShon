import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { EDITOR_EVENT, editorEventBus } from "../utils/EditorEvents";
import { EDITOR_LAYER, INTERSECTION_LAYER, RENDER_LAYER } from "../utils/Global";
import { useTranslation } from "react-i18next";

export function LayersMenu() {
  const { t } = useTranslation();
  const [showInEditor, setShowInEditor] = useState(true);
  const [showInRender, setShowInRender] = useState(true);
  const [selectable, setSelectable] = useState(true);

  const handleEditorVisibility = (val: boolean) => {
    setShowInEditor(val);

    sendLayerMask(val, showInRender, selectable);
  };

  const handleRenderVisibility = (val: boolean) => {
    setShowInRender(val);

    sendLayerMask(showInEditor, val, selectable);
  };

  const handleSelectable = (val: boolean) => {
    setSelectable(val);

    sendLayerMask(showInEditor, showInRender, val);
  };

  const sendLayerMask = (editor: boolean, render: boolean, select: boolean) => {
    editorEventBus.emit(EDITOR_EVENT.SetObjectLayers,
      0
      | (Number(editor) << EDITOR_LAYER)
      | (Number(render) << RENDER_LAYER)
      | (Number(select) << INTERSECTION_LAYER)
    );
  };

  useEffect(() => {

    const handleRefreshObjectLayers = (layerMask: number) => {
      const showEditorMask = layerMask & (1 << EDITOR_LAYER);
      const showRenderMask = layerMask & (1 << RENDER_LAYER);
      const shouldSelect = layerMask & (1 << INTERSECTION_LAYER);
      setShowInEditor(Boolean(showEditorMask));
      setShowInRender(Boolean(showRenderMask));
      setSelectable(Boolean(shouldSelect));
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
            {t("Layers")}
          </span>
        </div>

        <Separator orientation="horizontal" />

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-center gap-3 w-full m-2">
              <label htmlFor="EditorVisibility" className="w-1/2 font-bold select-none">{t("EditorLayer")}</label>
              <Checkbox id="EditorVisibility" checked={showInEditor} onCheckedChange={(val: boolean) => { handleEditorVisibility(val); }} />
            </div>
          </TooltipTrigger>
          <TooltipContent className="w-fit" side="left">
            <p>{t("ShowObjectInEditorMsg")}</p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation="horizontal" />

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-center gap-3 w-full m-2">
              <label htmlFor="RenderVisibility" className="w-1/2 font-bold select-none">{t("RenderLayer")}</label>
              <Checkbox id="RenderVisibility" checked={showInRender} onCheckedChange={(val: boolean) => { handleRenderVisibility(val); }} />
            </div>
          </TooltipTrigger>
          <TooltipContent className="w-fit" side="left">
            <p>{t("ShowObjectInRenderMsg")}</p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation="horizontal" />

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-center gap-3 w-full m-2">
              <label htmlFor="Selectable" className="w-1/2 font-bold select-none">{t("Selectable")}</label>
              <Checkbox id="Selectable" checked={selectable} onCheckedChange={(val: boolean) => { handleSelectable(val); }} />
            </div>
          </TooltipTrigger>
          <TooltipContent className="w-fit" side="left">
            <p>{t("SelectableInfoMsg")}</p>
          </TooltipContent>
        </Tooltip>

      </div>
    </div>
  </>);
}
