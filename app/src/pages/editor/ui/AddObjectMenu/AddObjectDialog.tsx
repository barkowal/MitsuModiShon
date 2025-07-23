import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LucidePackagePlus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { EDITOR_EVENT, editorEventBus } from "../../utils/EditorEvents";

const AvailableObjects = [
  {
    name: "ModellingPlane",
    params: ["Width", "Height", "Width Segments", "Height Segments"],
    minValues: [1, 1, 1, 1],
    maxValues: [20, 20, 10, 10],
    defaultValues: [1, 1, 1, 1],
  },
  {
    name: "ModellingBox",
    params: ["Width", "Height", "Depth", "Width Segments", "Height Segments", "Depth Segments"],
    minValues: [1, 1, 1, 1, 1, 1],
    maxValues: [20, 20, 20, 10, 10, 10],
    defaultValues: [1, 1, 1, 1, 1, 1],
  },
  {
    name: "ModellingCircle",
    params: ["Radius", "Segments", "ThetaStart", "ThetaLength"],
    minValues: [1, 1, 0, 0],
    maxValues: [20, 64, 100, 100],
    defaultValues: [1, 16, 0, 100],
  },
];


export function AddObjectDialog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentObject, setCurrentObject] = useState(0);
  const [currentParams, setCurrentParams] = useState<Array<number>>([1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);

  const changeParams = (newVal: number, index: number) => {
    setCurrentParams(currentParams.map((val, i) => i === index ? newVal : val));
  };

  const resetCurrentParams = (index: number) => {
    const defaultValues = AvailableObjects[index].defaultValues;
    setCurrentParams(currentParams.map((_, i) => defaultValues[i]));
  };

  const handleAddMesh = () => {
    const meshData = [currentObject].concat(currentParams);
    editorEventBus.emit(EDITOR_EVENT.AddMesh, meshData);
    setIsDialogOpen(false);
  };

  const handleOpenChange = () => {
    setCurrentObject(0);
    resetCurrentParams(0);
    setIsDialogOpen(!isDialogOpen);
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={isDialogOpen}>
      <DialogTrigger asChild onClick={() => { setIsDialogOpen(true); }}>
        <Button className="[&_svg]:size-6" >
          <LucidePackagePlus className="size-1" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader >
          <DialogTitle className="text-center">Create Object</DialogTitle>
          <DialogDescription className="text-center">
            Select object with preferred settings and add it to the scene.
          </DialogDescription>
        </DialogHeader>

        <Select
          defaultValue={"0"}
          onValueChange={(val: string) => { setCurrentObject(Number(val)); resetCurrentParams(Number(val)); }}>
          <SelectTrigger className="w-full min-[20ch]: m-auto">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent >
            {
              AvailableObjects.map((obj, index) => (
                <SelectItem value={index.toString()} key={index}>{obj.name}</SelectItem>
              ))
            }
          </SelectContent>
        </Select>

        <span className="select-none">
          {
            AvailableObjects[currentObject].params.map((param, index) => (
              <span key={index} className="grid grid-cols-2 gap-1 font-bold m-2">

                <span>
                  {param}:
                </span>

                <span className="flex gap-2">
                  {currentParams[index]}
                  <Slider
                    value={[currentParams[index]]}
                    defaultValue={[AvailableObjects[currentObject].defaultValues[index]]}
                    onValueChange={(val: Array<number>) => { changeParams(val[0], index); }}
                    min={AvailableObjects[currentObject].minValues[index]}
                    max={AvailableObjects[currentObject].maxValues[index]}
                  />
                </span>

              </span>
            ))
          }
        </span>


        <DialogFooter>
          <div className="w-full text-center" onClick={handleAddMesh}>
            <Button>CREATE</Button>
          </div>
        </DialogFooter>

      </DialogContent>
    </Dialog>


  );
}

