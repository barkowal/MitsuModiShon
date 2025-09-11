import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MATERIAL_TYPES, type MaterialItem } from "../../utils/Types";
import { useTranslation } from "react-i18next";

type Props = {
  materialData: MaterialItem,
  setMaterialData: CallableFunction;
};

export function MaterialDropdown({ materialData, setMaterialData }: Props) {
  const { t } = useTranslation();

  const changeMaterial = (val: string) => {
    if (materialData.type === val)
      return;

    const newMaterial: MaterialItem = { id: materialData.id, type: val, color: materialData.color };
    setMaterialData(newMaterial);
  };

  return (<>
    <div className=" p-1 font-bold select-none">
      <span className="flex gap-2 items-center justify-between">
        <span className="mx-2">
          {t("Type")}
        </span>
        <span className="mx-2 flex-3/5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="text-center border border-primary w-full min-w-[20ch] rounded-none">
                <p>{t(materialData.type)}</p>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel> {t("ChangeMaterial")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {
                  Object.values(MATERIAL_TYPES).map((val, i) => (
                    <DropdownMenuItem onClick={() => { changeMaterial(val); }}
                      key={i}>{t(val)}</DropdownMenuItem>
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
