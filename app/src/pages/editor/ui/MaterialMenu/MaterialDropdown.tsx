import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MATERIAL_TYPES, type MaterialItem } from "../../utils/Types";

type Props = {
  materialData: MaterialItem,
  setMaterialData: CallableFunction;
};

export function MaterialDropdown({ materialData, setMaterialData }: Props) {

  const changeMaterial = (val: string) => {
    if (materialData.type === val)
      return;

    const newMaterial: MaterialItem = { id: materialData.id, type: val, color: materialData.color };
    setMaterialData(newMaterial);
  };

  return (<>
    <div className="bg-sidebar-accent p-1 font-bold select-none">
      <span className="flex gap-2 items-center justify-between">
        <span className="mx-2">
          Type
        </span>
        <span className="mx-2 flex-3/5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="text-center border border-primary w-full min-w-[20ch] rounded-none">
                <p>{materialData.type}</p>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel> Change Material </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {
                  Object.values(MATERIAL_TYPES).map((val, i) => (
                    <DropdownMenuItem onClick={() => { changeMaterial(val); }}
                      key={i}>{val}</DropdownMenuItem>
                  ))
                }
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu >
        </span>
      </span>
    </div>
  </>);
}
