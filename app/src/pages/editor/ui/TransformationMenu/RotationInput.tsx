import { useEffect, useState } from "react";
import { EDITOR_EVENT, editorEventBus } from "../../utils/EditorEvents";
import { compareVec3 } from "../../utils/utils";
import { TRANSFORM_CHANGE, TRANSFORMATION_ARR, type Vec3 } from "../../utils/Types";
import DraggableInput from "@/components/DraggableInput";

export function RotationInput() {
  const [oldRotation, setOldRotation] = useState({ x: 0, y: 0, z: 0 });
  const [rotationX, setRotationX] = useState(0);
  const [rotationY, setRotationY] = useState(0);
  const [rotationZ, setRotationZ] = useState(0);

  const sendRotation = () => {
    const newRotation: Vec3 = { x: rotationX, y: rotationY, z: rotationZ };
    if (!compareVec3(oldRotation, newRotation)) {
      editorEventBus.emit(EDITOR_EVENT.ChangeRotation, [oldRotation, newRotation]);
      setOldRotation(newRotation);
    }
  };

  useEffect(() => {
    document.addEventListener("mouseup", sendRotation);

    const handleChangeRotation = (rotation: Array<Vec3>) => {
      setRotationX(rotation[TRANSFORM_CHANGE.New].x);
      setRotationY(rotation[TRANSFORM_CHANGE.New].y);
      setRotationZ(rotation[TRANSFORM_CHANGE.New].z);
      setOldRotation(rotation[TRANSFORM_CHANGE.New]);
    };

    const handleRefresh = (transform: Array<Vec3>) => {
      const rotation = transform[TRANSFORMATION_ARR.Rotation];
      setRotationX(rotation.x);
      setRotationY(rotation.y);
      setRotationZ(rotation.z);
      setOldRotation(rotation);
    };

    editorEventBus.on(EDITOR_EVENT.ChangeRotation, handleChangeRotation);
    editorEventBus.on(EDITOR_EVENT.RefreshTransformationMenu, handleRefresh);

    return (() => {
      editorEventBus.off(EDITOR_EVENT.ChangeRotation, handleChangeRotation);
      editorEventBus.off(EDITOR_EVENT.RefreshTransformationMenu, handleRefresh);

      document.removeEventListener("mouseup", sendRotation);
    });
  }, [rotationX, rotationY, rotationZ, oldRotation]);


  return (
    <>
      <div className="w-full p-2 flex justify-between gap-2 font-bold select-none ">
        <p>Rotation</p>
        <div className="flex gap-1 w-fit"
          onBlur={() => { sendRotation(); }}>
          <DraggableInput labelText="X:" minValue={-1000} maxValue={1000} decimalPoints={2}
            value={rotationX} onValueChange={setRotationX}
            inputWidth={8} className="h-fit rounded-none p-0.5 m-0" />

          <DraggableInput labelText="Y:" minValue={-1000} maxValue={1000} decimalPoints={2}
            value={rotationY} onValueChange={setRotationY}
            inputWidth={8} className="h-fit rounded-none p-0.5 m-0" />

          <DraggableInput labelText="Z:" minValue={-1000} maxValue={1000} decimalPoints={2}
            value={rotationZ} onValueChange={setRotationZ}
            inputWidth={8} className="h-fit rounded-none p-0.5 m-0" />
        </div >
      </div >
    </>);
}
