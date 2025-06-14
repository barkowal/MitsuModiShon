import { Separator } from "@/components/ui/separator";
import { PositionInput } from "./PositionInput";
import { ScaleInput } from "./ScaleInput";
import { RotationInput } from "./RotationInput";

export function TransformationMenu() {

  return (<>
    <div className="bg-sidebar-accent my-2 overflow-scroll">
      <div className="w-full h-full select-none p-2 flex justify-between" >
        <span className="w-full font-bold">
          TRANSFORMATION
        </span>
      </div>
      <Separator orientation="horizontal" />
      <PositionInput />
      <Separator orientation="horizontal" />
      <ScaleInput />
      <Separator orientation="horizontal" />
      <RotationInput />
    </div >
  </>);

}
