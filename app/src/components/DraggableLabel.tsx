import { memo, useCallback, useEffect, useState } from "react";

type Props = {
  value: number;
  setValue: CallableFunction;
  labelText?: string;
  decimalPoints?: number
}

function DraggableLabel({ value, setValue, labelText = "label", decimalPoints = 2 }: Props) {
  const [snapshot, setSnapshot] = useState(value);
  const [startVal, setStartVal] = useState(0);

  const onStart = useCallback(
    (event: React.MouseEvent) => {
      setStartVal(event.clientX);
      setSnapshot(value);
    },
    [value]
  );

  useEffect(() => {
    const onChange = (event: MouseEvent) => {
      if (startVal) {
        setValue(snapshot + ((event.clientX - startVal) / 10 ** decimalPoints));
      }
    };

    const onStop = () => {
      setStartVal(0);
    };

    document.addEventListener("mousemove", onChange);
    document.addEventListener("mouseup", onStop);
    return () => {
      document.removeEventListener("mousemove", onChange);
      document.removeEventListener("mouseup", onStop);
    };
  }, [startVal, setValue, snapshot]);

  return (
    <span
      onMouseDown={onStart}
      className="px-1 text-foreground/80 cursor-ew-resize select-none">
      {labelText}
    </span>
  );
}
export default memo(DraggableLabel);
