import DraggableInput from "@/components/DraggableInput";
import { useEffect, useState } from "react";
import { EDITOR_EVENT, editorEventBus } from "../../utils/EditorEvents";
import { compareVec3 } from "../../utils/utils";
import { TRANSFORMATION_ARR, type Vec3 } from "../../utils/Types";

export function PositionInput() {
  const [isChanging, setIsChanging] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [oldPos, setOldPos] = useState({ x: 0, y: 0, z: 0 });
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [posZ, setPosZ] = useState(0);

  const sendPosition = () => {
    const newPos: Vec3 = { x: posX, y: posY, z: posZ };
    if (!compareVec3(oldPos, newPos)) {
      editorEventBus.emit(EDITOR_EVENT.ChangePosition, newPos);
      setOldPos(newPos);
    }
  };

  useEffect(() => {
    const handleChangePosition = (pos: Vec3) => {
      setPosX(pos.x);
      setPosY(pos.y);
      setPosZ(pos.z);
      setOldPos(pos);
    };

    const handleRefresh = (transform: Array<Vec3>) => {
      const pos = transform[TRANSFORMATION_ARR.Position];
      setPosX(pos.x);
      setPosY(pos.y);
      setPosZ(pos.z);
      setOldPos(pos);
    };

    editorEventBus.on(EDITOR_EVENT.ChangePosition, handleChangePosition);
    editorEventBus.on(EDITOR_EVENT.RefreshTransformationMenu, handleRefresh);

    return (() => {
      editorEventBus.off(EDITOR_EVENT.ChangePosition, handleChangePosition);
      editorEventBus.off(EDITOR_EVENT.RefreshTransformationMenu, handleRefresh);
    });

  }, []);

  return (
    <>
      <div className="w-full p-2 flex justify-between gap-2 font-bold select-none ">
        <p>Position</p>
        <div className="flex gap-1 w-fit"
          onBlur={() => { sendPosition(); }}
          onMouseDown={() => { setIsDragging(true); }}
          onMouseMove={() => { if (isDragging) setIsChanging(true); }}
          onMouseUp={() => { if (isChanging) { sendPosition(); setIsChanging(false); } setIsDragging(false); }}>
          X:<DraggableInput minValue={-1000} maxValue={1000} value={posX} onValueChange={setPosX}
            inputWidth={8} className="h-fit rounded-none p-0.5 m-0" />

          Y:<DraggableInput minValue={-1000} maxValue={1000} value={posY} onValueChange={setPosY}
            inputWidth={8} className="h-fit rounded-none p-0.5 m-0" />

          Z:<DraggableInput minValue={-1000} maxValue={1000} value={posZ} onValueChange={setPosZ}
            inputWidth={8} className="h-fit rounded-none p-0.5 m-0" />
        </div >
      </div >
    </>);
}
