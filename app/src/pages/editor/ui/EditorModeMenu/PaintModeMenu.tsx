import ColorPopover from "@/components/ColorPopover";
import { Brush, PenLine, Settings2 } from "lucide-react";
import { useState } from "react";
import { EDITOR_EVENT, editorEventBus } from "../../utils/EditorEvents";
import { Popover } from "@/components/ui/popover";
import { PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PAINTING_MODE } from "../../utils/Types";
import { Button } from "@/components/ui/button";
import { DEFAULT_LINE_OFFSET, DEFAULT_LINE_WIDTH } from "../../utils/Global";


export function PaintModeMenu() {
  const [paintingMode, setPaintingMode] = useState<number>(PAINTING_MODE.VertexColor);
  const [brushColor, setBrushColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(DEFAULT_LINE_WIDTH);
  const [lineOffset, setLineOffset] = useState(DEFAULT_LINE_OFFSET);

  const handlePaintingModeChange = (val: string) => {
    const mode = Number(val);
    editorEventBus.emit(EDITOR_EVENT.ChangePaintingMode, mode);
    setPaintingMode(mode);
  };

  const changeBrushColor = (color: string) => {
    const hexColor = Number("0x" + color.slice(1));
    editorEventBus.emit(EDITOR_EVENT.ChangePaintingSettings, [hexColor, lineWidth, lineOffset]);
    setBrushColor(color);
  };

  const changeLineWidth = (width: number) => {
    const hexColor = Number("0x" + brushColor.slice(1));
    editorEventBus.emit(EDITOR_EVENT.ChangePaintingSettings, [hexColor, width, lineOffset]);
    setLineWidth(width);
  };

  const changeLineOffset = (offset: number) => {
    const hexColor = Number("0x" + brushColor.slice(1));
    editorEventBus.emit(EDITOR_EVENT.ChangePaintingSettings, [hexColor, lineWidth, offset]);
    setLineOffset(offset);
  };

  return (<>
    <div className="flex items-center justify-center" >

      <ToggleGroup
        value={paintingMode.toString()}
        onValueChange={handlePaintingModeChange}
        variant="outline"
        type="single">
        <ToggleGroupItem value={PAINTING_MODE.VertexColor.toString()} aria-label="Toggle Vertices">
          <Brush />
        </ToggleGroupItem>
        <ToggleGroupItem value={PAINTING_MODE.DrawLine.toString()} aria-label="Toggle Edges">
          <PenLine />
        </ToggleGroupItem>
      </ToggleGroup>

      <Popover>
        <PopoverTrigger className="mx-2" asChild><Button variant="outline"><Settings2 /></Button></PopoverTrigger>
        <PopoverContent className="my-5 p-2 bg-card">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="leading-none font-medium">SETTINGS</h4>
              <p className="text-muted-foreground text-sm">
                Paint Mode Settings
              </p>
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-2 items-center gap-2 ">
                <p>Brush Color</p>
                <ColorPopover onColorChange={changeBrushColor} colorValue={brushColor} />
              </div>

              {
                paintingMode === PAINTING_MODE.DrawLine ?

                  <div>
                    <div className="grid grid-cols-2 items-center gap-2 ">
                      <p>Line Width: {lineWidth}</p>
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
                      <p>Offset: {lineOffset}</p>
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

            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div >
  </>);
}
