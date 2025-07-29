import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Trash2 } from "lucide-react";

type Props = {
  start: number,
  end: number,
  onDelete: CallableFunction,
};

export function KeyframesItem({ start, end, onDelete }: Props) {

  return (<>
    <Collapsible>

      <Separator orientation="horizontal" />
      <div className=" w-[calc(100%)] p-1 flex justify-evenly items-center hover:bg-card/20 ">

        <CollapsibleTrigger className="w-full h-8 cursor-pointer ">
          <p>Keyframe {start} - {end}</p>
        </CollapsibleTrigger>

        <Button className="bg-destructive h-8" onClick={() => { onDelete(); }}>
          <Trash2 />
        </Button>

      </div>

      <Separator orientation="horizontal" />

      <CollapsibleContent>

        <Separator orientation="horizontal" />

        <div className="flex items-center my-2 justify-center gap-3 w-full ">
          <label htmlFor="interpolation" className="w-1/2 font-bold select-none">Interpolation</label>
          <Select defaultValue="Linear">
            <SelectTrigger className=" w-11/12 min-[30ch] m-auto">
              <SelectValue placeholder="Interpolation" />
            </SelectTrigger>
            <SelectContent >
              <SelectItem value="Linear">Linear</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator orientation="horizontal" />

      </CollapsibleContent>
    </Collapsible>
  </>);
}


