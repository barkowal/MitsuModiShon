import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Trash2 } from "lucide-react";
import { INTERPOLATION } from "../../utils/Types";

type Props = {
  keyframe: number,
  selectedInterpolation: number,
  allowChangingInterpolation: boolean,
  onInterpolationChange: CallableFunction,
  onDelete: CallableFunction,
};

export function KeyframesItem({ keyframe, selectedInterpolation, allowChangingInterpolation = false, onInterpolationChange, onDelete }: Props) {

  return (<>
    <Collapsible>

      <Separator orientation="horizontal" />
      <div className=" w-[calc(100%)] p-1 flex justify-evenly items-center hover:bg-card/20 ">

        <CollapsibleTrigger className="w-full h-8 cursor-pointer ">
          <p>Keyframe {keyframe}</p>
        </CollapsibleTrigger>

        <Button className="bg-destructive h-8" onClick={() => { onDelete(); }}>
          <Trash2 />
        </Button>

      </div>

      <Separator orientation="horizontal" />

      <CollapsibleContent>

        <Separator orientation="horizontal" />

        {allowChangingInterpolation ?
          <div className="flex items-center my-2 justify-center gap-3 w-full ">
            <label htmlFor="interpolation" className="w-1/2 font-bold select-none">Interpolation</label>
            <Select defaultValue="0" value={selectedInterpolation.toString()} onValueChange={(val: string) => { onInterpolationChange(Number(val)); }} >
              <SelectTrigger className=" w-11/12 min-[30ch] m-auto">
                <SelectValue placeholder="Interpolation" />
              </SelectTrigger>
              <SelectContent >
                <SelectItem value={INTERPOLATION.Linear.toString()}>Linear</SelectItem>
                <SelectItem value={INTERPOLATION.EaseInCirc.toString()}>EaseInCirc</SelectItem>
                <SelectItem value={INTERPOLATION.EaseOutCirc.toString()}>EaseOutCirc</SelectItem>
                <SelectItem value={INTERPOLATION.EaseInBack.toString()}>EaseInBack</SelectItem>
                <SelectItem value={INTERPOLATION.EaseOutElastic.toString()}>EaseOutElastic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          : null
        }


        <Separator orientation="horizontal" />

      </CollapsibleContent>
    </Collapsible >
  </>);
}


