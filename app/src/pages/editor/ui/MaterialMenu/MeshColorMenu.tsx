import ColorPopover from "@/components/ColorPopover";
import type { MaterialItem } from "../../utils/Types";
import { useTranslation } from "react-i18next";

type Props = {
  materialData: MaterialItem,
  setMaterialData: CallableFunction;
};

export function MeshColorMenu({ materialData, setMaterialData }: Props) {
  const { t } = useTranslation();

  const changeMeshColor = (color: string) => {
    if (materialData.color === color)
      return;

    const newMaterial: MaterialItem = { id: materialData.id, type: materialData.type, color: color };
    setMaterialData(newMaterial);
  };


  return (<>
    <div className=" p-1 font-bold select-none">
      <span className=" flex items-center justify-between ">
        <span className="mx-2">
          {t("Color")}
        </span>
        <ColorPopover onColorChange={(val: string) => { changeMeshColor(val); }} colorValue={materialData.color} />
      </span>
    </div>
  </>);

}
