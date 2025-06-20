import DraggableInput from "@/components/DraggableInput";
import { useEffect, useState } from "react";
import { EDITOR_EVENT, editorEventBus } from "../../utils/EditorEvents";
import { compareVec3 } from "../../utils/utils";
import { TRANSFORMATION_ARR, type Vec3 } from "../../utils/Types";

export function ScaleInput() {
  const [isChanging, setIsChanging] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [oldScale, setOldScale] = useState({ x: 0, y: 0, z: 0 });
  const [scaleX, setScaleX] = useState(0);
  const [scaleY, setScaleY] = useState(0);
  const [scaleZ, setScaleZ] = useState(0);

  const sendScale = () => {
    const newScale: Vec3 = { x: scaleX, y: scaleY, z: scaleZ };
    if (!compareVec3(oldScale, newScale)) {
      editorEventBus.emit(EDITOR_EVENT.ChangeScale, newScale);
      setOldScale(newScale);
    }
  };

  useEffect(() => {
    const handleChangeScale = (scale: Vec3) => {
      setScaleX(scale.x);
      setScaleY(scale.y);
      setScaleZ(scale.z);
      setOldScale(scale);
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
    });

  }, []);

  return (
    <>
      <div className="w-full p-2 flex justify-between gap-2 font-bold select-none ">
        <p>Scale</p>
        <div className="flex gap-1 w-fit"
          onBlur={() => { sendScale(); }}
          onMouseDown={() => { setIsDragging(true); }}
          onMouseMove={() => { if (isDragging) setIsChanging(true); }}
          onMouseUp={() => { if (isChanging) { sendScale(); setIsChanging(false); } setIsDragging(false); }}>
          X:<DraggableInput minValue={-1000} maxValue={1000} value={scaleX} onValueChange={setScaleX}
            inputWidth={8} className="h-fit rounded-none p-0.5 m-0" />

          Y:<DraggableInput minValue={-1000} maxValue={1000} value={scaleY} onValueChange={setScaleY}
            inputWidth={8} className="h-fit rounded-none p-0.5 m-0" />

          Z:<DraggableInput minValue={-1000} maxValue={1000} value={scaleZ} onValueChange={setScaleZ}
            inputWidth={8} className="h-fit rounded-none p-0.5 m-0" />
        </div >
      </div >
    </>);
}
