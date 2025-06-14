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
  defaultValue?: string
}

function ColorPopover({ onColorChange, defaultValue = "#abcdef" }: Props) {
  const [color, setColor] = useState(defaultValue);

  const changeColor = (hexColor: string) => {
    onColorChange(hexColor);
    setColor(hexColor);
  };

  return (
    <>
      <span>
        <Popover>
          <PopoverTrigger asChild>
            <Button className="border-2 hover:border-secondary-foreground cursor-pointer" style={{ backgroundColor: color }} />
          </PopoverTrigger>
          <PopoverContent>
            <HexColorPicker color={color} onChange={(val: string) => { changeColor(val); }} />
          </PopoverContent>
        </Popover>
        <div className="w-[10ch] border-2 inline text-center mx-2" >
          #<HexColorInput color={color} onChange={(val: string) => { changeColor(val); }} className="w-[7ch] focus:border-none focus-within:border-none" />
        </div>
      </span>
    </>
  );
}

export default ColorPopover;
