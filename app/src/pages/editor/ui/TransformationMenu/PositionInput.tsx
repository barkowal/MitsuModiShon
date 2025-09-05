import DraggableInput from "@/components/DraggableInput";
import { useEffect, useState } from "react";
import { EDITOR_EVENT, editorEventBus } from "../../utils/EditorEvents";
import { compareVec3 } from "../../utils/utils";
import { TRANSFORM_CHANGE, TRANSFORMATION_ARR, type Vec3 } from "../../utils/Types";
import { useTranslation } from "react-i18next";

export function PositionInput() {
  const { t } = useTranslation();
  const [oldPos, setOldPos] = useState({ x: 0, y: 0, z: 0 });
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [posZ, setPosZ] = useState(0);

  // TODO send position, rotation... listens on all document, change it
  const sendPosition = () => {
    const newPos: Vec3 = { x: posX, y: posY, z: posZ };
    if (!compareVec3(oldPos, newPos)) {
      editorEventBus.emit(EDITOR_EVENT.ChangePosition, [oldPos, newPos]);
      setOldPos(newPos);
    }
  };

  useEffect(() => {
    document.addEventListener("mouseup", sendPosition);

    const handleChangePosition = (pos: Array<Vec3>) => {
      setPosX(pos[TRANSFORM_CHANGE.New].x);
      setPosY(pos[TRANSFORM_CHANGE.New].y);
      setPosZ(pos[TRANSFORM_CHANGE.New].z);
      setOldPos(pos[TRANSFORM_CHANGE.New]);
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

      document.removeEventListener("mouseup", sendPosition);
    });

  }, [posX, posY, posZ, oldPos]);

  return (
    <>
      <div
        className="w-full p-2 flex justify-between gap-2 font-bold select-none ">
        <p>{t("Position")}</p>
        <div onBlur={() => { sendPosition(); }} className="flex gap-1 w-fit">
          <DraggableInput labelText="X:" minValue={-1000} maxValue={1000} value={posX} step={0.01} onValueChange={setPosX}
            inputWidth={8} className="h-fit rounded-none p-0.5 m-0" />

          <DraggableInput labelText="Y:" minValue={-1000} maxValue={1000} value={posY} step={0.01} onValueChange={setPosY}
            inputWidth={8} className="h-fit rounded-none p-0.5 m-0" />

          <DraggableInput labelText="Z:" minValue={-1000} maxValue={1000} value={posZ} step={0.01} onValueChange={setPosZ}
            inputWidth={8} className="h-fit rounded-none p-0.5 m-0" />
        </div >
      </div >
    </>);
}
