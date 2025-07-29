import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";


export function AnimationProperties() {
  const [animatePosition, setAnimatePosition] = useState(true);
  const [animateScale, setAnimateScale] = useState(true);
  const [animateRotation, setAnimateRotation] = useState(true);

  return (
    <>
      <div className=" w-11/12 select-none p-2 text-center font-bold" >
        <p>ANIMATE</p>
      </div>

      <div className="w-11/12 mb-2 flex justify-evenly items-center ">

        <div className="flex flex-col items-center text-center">
          <label htmlFor="PositionFrame" className=" font-bold select-none">Position</label>
          <Checkbox id="PositionFrame" checked={animatePosition} onCheckedChange={(val: boolean) => { setAnimatePosition(val); }} />
        </div>

        <Separator orientation="vertical" />

        <div className="flex flex-col items-center text-center">
          <label htmlFor="ScaleFrame" className=" font-bold select-none">Scale</label>
          <Checkbox id="ScaleFrame" checked={animateScale} onCheckedChange={(val: boolean) => { setAnimateScale(val); }} />
        </div>

        <Separator orientation="vertical" />

        <div className="flex flex-col items-center text-center">
          <label htmlFor="RotationFrame" className=" font-bold select-none">Rotation</label>
          <Checkbox id="RotationFrame" checked={animateRotation} onCheckedChange={(val: boolean) => { setAnimateRotation(val); }} />
        </div>

      </div>
    </>

  );

}
