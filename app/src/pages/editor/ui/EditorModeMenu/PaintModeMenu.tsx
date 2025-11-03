import ColorPopover from "@/components/ColorPopover";
import { Brush, Eraser, PenLine, Pyramid, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";
import { EDITOR_EVENT, editorEventBus } from "../../utils/EditorEvents";
import { Popover } from "@/components/ui/popover";
import { PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PAINTING_MODE, PAINTING_SETTINGS } from "../../utils/Types";
import { Button } from "@/components/ui/button";
import { DEFAULT_LINE_OFFSET, DEFAULT_LINE_WIDTH } from "../../utils/Global";
import { Toggle } from "@/components/ui/toggle";
import { useTranslation } from "react-i18next";


export function PaintModeMenu() {
  const { t } = useTranslation();
  const [paintingMode, setPaintingMode] = useState<number>(PAINTING_MODE.VertexColor);
  const [brushColor, setBrushColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(DEFAULT_LINE_WIDTH);
  const [lineOffset, setLineOffset] = useState(DEFAULT_LINE_OFFSET);
  const [clearLine, setClearLine] = useState(0);

  const handlePaintingModeChange = (val: string) => {
    const mode = Number(val);
    editorEventBus.emit(EDITOR_EVENT.ChangePaintingMode, mode);
    setPaintingMode(mode);
  };

  const changeBrushColor = (color: string) => {
    const hexColor = Number("0x" + color.slice(1));
    editorEventBus.emit(EDITOR_EVENT.ChangePaintingSettings, [hexColor, lineWidth, lineOffset, clearLine]);
    setBrushColor(color);
  };

  const changeLineWidth = (width: number) => {
    editorEventBus.emit(EDITOR_EVENT.ChangePaintingSettings, [getHexBrushColor(), width, lineOffset, clearLine]);
    setLineWidth(width);
  };

  const changeClearLine = (shouldClear: boolean) => {
    const nbClear = shouldClear ? 1 : 0;
    editorEventBus.emit(EDITOR_EVENT.ChangePaintingSettings, [getHexBrushColor(), lineWidth, lineOffset, nbClear]);
    setClearLine(nbClear);
  };

  const changeLineOffset = (offset: number) => {
    editorEventBus.emit(EDITOR_EVENT.ChangePaintingSettings, [getHexBrushColor(), lineWidth, offset, clearLine]);
    setLineOffset(offset);
  };

  const getHexBrushColor = () => {
    return Number("0x" + brushColor.slice(1));
  };

  useEffect(() => {
    const handleRefreshPaintingSettings = (settings: Array<number>) => {
      const color = settings[PAINTING_SETTINGS.HexColor];
      setBrushColor("#" + color.toString(16).padStart(6, "0"));
      setLineWidth(settings[PAINTING_SETTINGS.LineWidth]);
      setLineOffset(settings[PAINTING_SETTINGS.LineOffset]);
      setClearLine(settings[PAINTING_SETTINGS.ClearLine]);
    };

    editorEventBus.on(EDITOR_EVENT.RefreshPaintingSettings, handleRefreshPaintingSettings);

    return (() => {
      editorEventBus.off(EDITOR_EVENT.RefreshPaintingSettings, handleRefreshPaintingSettings);
    });

  });

  return (<>
    <div className="flex items-center justify-center" >

      <ToggleGroup
        value={paintingMode.toString()}
        onValueChange={handlePaintingModeChange}
        variant="outline"
        type="single">
        <ToggleGroupItem value={PAINTING_MODE.VertexColor.toString()} aria-label="Toggle VertexColor">
          <Brush />
        </ToggleGroupItem>
        <ToggleGroupItem value={PAINTING_MODE.DrawLine.toString()} aria-label="Toggle DrawLine">
          <PenLine />
        </ToggleGroupItem>
        <ToggleGroupItem value={PAINTING_MODE.DrawOutline.toString()} aria-label="Toggle DrawOutline">
          <Pyramid />
        </ToggleGroupItem>
      </ToggleGroup>

      <Popover>
        <PopoverTrigger className="mx-2" asChild><Button variant="outline"><Settings2 /></Button></PopoverTrigger>
        <PopoverContent className="my-5 p-2 bg-card">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="leading-none font-medium">{t("Settings").toUpperCase()}</h4>
              <p className="text-muted-foreground text-sm">
                {t("PaintModeSettings")}
              </p>
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-2 items-center gap-2 ">
                <p>{paintingMode === PAINTING_MODE.VertexColor ? t("BrushColor") : t("LineColor")}:</p>
                <ColorPopover onColorChange={changeBrushColor} colorValue={brushColor} />
              </div>

              {
                paintingMode === PAINTING_MODE.DrawLine ?

                  <div>
                    <div className="grid grid-cols-2 items-center gap-2 ">
                      <p>{t("LineWidth")}: {lineWidth}</p>
                      <div className="items-center justify-center text-center">
                        <Slider
                          defaultValue={[lineWidth]}
                          onValueChange={(val: Array<number>) => { changeLineWidth(val[0]); }}
                          value={[lineWidth]}
                          min={1}
                          max={25}
                          step={1}
                          className={("w-[100%] h-4 my-2")} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 items-center gap-2 ">
                      <p>{t("Offset")}: {lineOffset}</p>
                      <div className="items-center justify-center text-center">
                        <Slider
                          defaultValue={[lineOffset]}
                          onValueChange={(val: Array<number>) => { changeLineOffset(val[0]); }}
                          value={[lineOffset]}
                          min={0.01}
                          max={1}
                          step={0.01}
                          className={("w-[100%] h-4 my-2")} />
                      </div>
                    </div>
                  </div>

                  : null
              }

              {
                paintingMode === PAINTING_MODE.DrawOutline ?
                  <div>

                    <div className="grid grid-cols-2 items-center gap-2 ">
                      <p>{t("Eraser")}:</p>
                      <div className="items-center justify-center text-center">
                        <Toggle pressed={clearLine === 0 ? false : true} onPressedChange={changeClearLine}>
                          <Eraser />
                        </Toggle>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 items-center gap-2 ">
                      <p>{t("LineWidth")}: {lineWidth}</p>
                      <div className="items-center justify-center text-center">
                        <Slider
                          defaultValue={[lineWidth]}
                          onValueChange={(val: Array<number>) => { changeLineWidth(val[0]); }}
                          value={[lineWidth]}
                          min={1}
                          max={25}
                          step={1}
                          className={("w-[100%] h-4 my-2")} />
                      </div>
                    </div>

                  </div>
                  : null
              }

            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div >
  </>);
}
