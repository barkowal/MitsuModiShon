import ColorPopover from "@/components/ColorPopover";
import type { MaterialItem } from "../../utils/Types";

type Props = {
  materialData: MaterialItem,
  setMaterialData: CallableFunction;
};

export function MeshColorMenu({ materialData, setMaterialData }: Props) {

  const changeMeshColor = (color: string) => {
    if (materialData.color === color)
      return;

    const newMaterial: MaterialItem = { id: materialData.id, type: materialData.type, color: color };
    setMaterialData(newMaterial);
  };


  return (<>
    <div className="bg-sidebar-accent p-1 font-bold select-none">
      <span className=" flex items-center justify-between ">
        <span className="mx-2">
          Mesh Color
        </span>
        <ColorPopover onColorChange={(val: string) => { changeMeshColor(val); }} colorValue={materialData.color} />
      </span>
    </div>
  </>);

}
