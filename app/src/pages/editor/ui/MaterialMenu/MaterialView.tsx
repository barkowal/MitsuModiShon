import { Separator } from "@/components/ui/separator";
import { MaterialDropdown } from "./MaterialDropdown";
import { MeshColorMenu } from "./MeshColorMenu";
import { MATERIAL_TYPES, type MaterialItem } from "../../utils/Types";
import { useEffect, useState } from "react";
import { EDITOR_EVENT, editorEventBus } from "../../utils/EditorEvents";
import { useTranslation } from "react-i18next";

const defaultMaterial: MaterialItem = {
  id: -1,
  type: MATERIAL_TYPES.Basic,
  color: "#a5a5a5",
};

export function MaterialView() {
  const { t } = useTranslation();
  const [materialData, setMaterialData] = useState(defaultMaterial);

  const emiteMaterialChange = (newMaterial: MaterialItem) => {
    setMaterialData(newMaterial);
    editorEventBus.emit(EDITOR_EVENT.ChangeMeshMaterial, newMaterial);
  };

  useEffect(() => {

    const handleRefreshMaterial = (data: MaterialItem) => {
      if (materialData.id !== data.id) {
        setMaterialData(data);
      }
    };

    editorEventBus.on(EDITOR_EVENT.RefreshMeshMaterial, handleRefreshMaterial);
    return () => {
      editorEventBus.off(EDITOR_EVENT.RefreshMeshMaterial, handleRefreshMaterial);
    };

  }, [materialData]);


  return (<>

    <div className=" my-2 overflow-auto ">
      <div className="w-[calc(100%-10px)] h-[calc(100%-10px)]">
        <div className=" select-none p-2 flex justify-between" >
          <span className="w-full font-bold">
            {t("Material").toUpperCase()}
          </span>
        </div>
        <Separator orientation="horizontal" />
        <MaterialDropdown materialData={materialData} setMaterialData={emiteMaterialChange} />
        <MeshColorMenu materialData={materialData} setMaterialData={emiteMaterialChange} />
      </div>
    </div>
  </>);
}
