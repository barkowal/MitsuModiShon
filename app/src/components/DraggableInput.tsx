import { useState } from "react";
import type { MouseEvent } from "react";
import { Input } from "@/components/ui/input";

type Params = {
  minValue: number
  maxValue: number
  value?: number
  inputWidth?: number
  onValueChange?: CallableFunction
  className?: string
  decimalPoints?: number
}

// TODO there are still problems with this e.g putting zeroes after last decimal point
// Think of something better or search it somewhere
function DraggableInput({ minValue, maxValue, value = 0, inputWidth = 4, onValueChange, className, decimalPoints = 3 }: Params) {
  const [isDragging, setIsDragging] = useState(false);
  const [inputNb, setInputNb] = useState(value.toString());
  const [isSelected, setIsSelected] = useState(false);

  const dragMouse = (e: MouseEvent) => {
    if (isDragging) {
      const newValue = value + (e.movementY / (10 * decimalPoints)); // dividing for smaller increases
      changeInput(newValue.toFixed(decimalPoints));
    }
  };

  const changeValue = (newValue: number) => {
    newValue = newValue < minValue ? minValue : newValue;
    newValue = newValue > maxValue ? maxValue : newValue;
    setInputNb(newValue.toString());
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  function isValidNumber(str: string) {
    const regex = /^-?\d+(\.\d+)?$/;
    return regex.test(str);
  }

  const changeInput = (val: string) => {
    if (val === "") {
      setInputNb("");
      return;
    }
    if (val === "-") {
      setInputNb("-");
      return;
    }
    if (val.charAt(val.length - 1) === ".") {
      setInputNb(val);
      return;
    }
    if (!isValidNumber(val)) {
      changeValue(0);
      return;
    }
    changeValue(Number(val));
  }

  return (
    <>
      <div>
        <Input
          type="text"
          value={isSelected ? inputNb : value.toFixed(decimalPoints)}
          onChange={(e) => { changeInput(e.target.value); }}
          onFocus={() => { setInputNb(value.toFixed(decimalPoints)); }}
          onSelect={() => { setIsSelected(true); }}
          onBlur={() => { setIsSelected(false); }}
          onMouseDown={() => { setIsDragging(true); }}
          onMouseMove={(e: MouseEvent) => { dragMouse(e); }}
          onMouseUp={() => { setIsDragging(false); }}
          className={className + " selection:bg-transparent selection:text-white text-left"}
          style={{ width: `${inputWidth}ch`, cursor: "row-resize" }}
        />

      </div>
    </>
  );
}

export default DraggableInput;
