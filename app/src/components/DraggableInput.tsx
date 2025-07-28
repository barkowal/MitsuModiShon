import { useCallback, useState } from "react";
import DraggableLabel from "./DraggableLabel";
import { Input } from "./ui/input";

type Props = {
  labelText?: string
  minValue?: number
  maxValue?: number
  value?: number
  inputWidth?: number
  onValueChange?: CallableFunction
  className?: string
  decimalPoints?: number
  step?: number
};

export default function DraggableInput({ labelText = "label", value = 0, onValueChange, inputWidth, minValue = 0, maxValue = 100, className = "", decimalPoints = 3, step = 1 }: Props) {
  const [inputNb, setInputNb] = useState(value.toString());
  const [isSelected, setIsSelected] = useState(false);

  const changeValue = useCallback((newValue: number) => {
    newValue = newValue < minValue ? minValue : newValue;
    newValue = newValue > maxValue ? maxValue : newValue;
    setInputNb(newValue.toString());
    if (onValueChange) {
      onValueChange(newValue);
    }
  }, [minValue, maxValue, onValueChange]);

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
  };

  return (
    <div className="flex items-center ">
      <DraggableLabel value={value} setValue={(val: number) => { changeValue(val); }}
        step={step} labelText={labelText} />
      <Input
        type="text"
        value={isSelected ? inputNb : value.toFixed(decimalPoints)}
        onFocus={() => { setInputNb(value.toFixed(decimalPoints)); }}
        onSelect={() => { setIsSelected(true); }}
        onBlur={() => { setIsSelected(false); }}
        onChange={(e) => { changeInput(e.target.value); }}
        className={className + " selection:bg-background selection:text-foreground text-left"}
        style={{ width: `${inputWidth}ch` }}
      />
    </div>
  );
}
