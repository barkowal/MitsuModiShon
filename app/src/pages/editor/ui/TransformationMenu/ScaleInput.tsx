import { useEffect, useState } from "react";
import { EDITOR_EVENT, editorEventBus } from "../../utils/EditorEvents";
import { compareVec3 } from "../../utils/utils";
import { TRANSFORM_CHANGE, TRANSFORMATION_ARR, type Vec3 } from "../../utils/Types";
import DraggableInput from "@/components/DraggableInput";

export function ScaleInput() {
  const [oldScale, setOldScale] = useState({ x: 0, y: 0, z: 0 });
  const [scaleX, setScaleX] = useState(0);
  const [scaleY, setScaleY] = useState(0);
  const [scaleZ, setScaleZ] = useState(0);

  const sendScale = () => {
    const newScale: Vec3 = { x: scaleX, y: scaleY, z: scaleZ };
    if (!compareVec3(oldScale, newScale)) {
      editorEventBus.emit(EDITOR_EVENT.ChangeScale, [oldScale, newScale]);
      setOldScale(newScale);
    }
  };

  useEffect(() => {
    document.addEventListener("mouseup", sendScale);

    const handleChangeScale = (scales: Array<Vec3>) => {
      setScaleX(scales[TRANSFORM_CHANGE.New].x);
      setScaleY(scales[TRANSFORM_CHANGE.New].y);
      setScaleZ(scales[TRANSFORM_CHANGE.New].z);
      setOldScale(scales[TRANSFORM_CHANGE.New]);
    };

    const handleRefresh = (transform: Array<Vec3>) => {
      const scale = transform[TRANSFORMATION_ARR.Scale];
      setScaleX(scale.x);
      setScaleY(scale.y);
      setScaleZ(scale.z);
      setOldScale(scale);
    };

    editorEventBus.on(EDITOR_EVENT.ChangeScale, handleChangeScale);
    editorEventBus.on(EDITOR_EVENT.RefreshTransformationMenu, handleRefresh);

    return (() => {
      editorEventBus.off(EDITOR_EVENT.ChangeScale, handleChangeScale);
      editorEventBus.off(EDITOR_EVENT.RefreshTransformationMenu, handleRefresh);

      document.removeEventListener("mouseup", sendScale);
    });

  }, [scaleX, scaleY, scaleZ, oldScale]);

  return (
    <>
      <div className="w-full p-2 flex justify-between gap-2 font-bold select-none ">
        <p>Scale</p>
        <div className="flex gap-1 w-fit"
          onBlur={() => { sendScale(); }}>
          <DraggableInput labelText="X:" minValue={-1000} maxValue={1000}
            value={scaleX} onValueChange={setScaleX} step={0.01}
            inputWidth={8} className="h-fit rounded-none p-0.5 m-0" />

          <DraggableInput labelText="Y:" minValue={-1000} maxValue={1000}
            value={scaleY} onValueChange={setScaleY} step={0.01}
            inputWidth={8} className="h-fit rounded-none p-0.5 m-0" />

          <DraggableInput labelText="Z:" minValue={-1000} maxValue={1000}
            value={scaleZ} onValueChange={setScaleZ} step={0.01}
            inputWidth={8} className="h-fit rounded-none p-0.5 m-0" />
        </div >
      </div >
    </>);
}
