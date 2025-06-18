import { useState } from "react";
import { HexColorPicker, HexColorInput } from "react-colorful";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

type Props = {
  onColorChange: CallableFunction
  colorValue?: string
}

function ColorPopover({ onColorChange, colorValue = "#abcdef" }: Props) {
  const [color, setColor] = useState(colorValue);
  const [oldColor, setOldColor] = useState(colorValue);

  const changeColor = (hexColor: string) => {
    setOldColor(color);
    setColor(hexColor);
  };

  const colorChanged = () => {
    if (oldColor != color) {
      onColorChange(color);
    }
  };

  return (
    <>
      <span>
        <Popover>
          <PopoverTrigger asChild>
            <Button className="border-2 hover:border-secondary-foreground cursor-pointer" style={{ backgroundColor: colorValue }} />
          </PopoverTrigger>
          <PopoverContent>
            <HexColorPicker color={colorValue} onChange={(val: string) => { changeColor(val); }}
              onMouseUp={() => { colorChanged(); }} />
          </PopoverContent>
        </Popover>
        <div className="w-[10ch] border-2 inline text-center mx-2" >
          #<HexColorInput color={colorValue} onChange={(val: string) => { changeColor(val); }} onBlur={() => { colorChanged(); }}
            className="w-[7ch] focus:border-none focus-within:border-none" />
        </div>
      </span>
    </>
  );
}

export default ColorPopover;
