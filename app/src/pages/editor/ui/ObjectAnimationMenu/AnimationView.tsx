import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { EDITOR_EVENT, editorEventBus } from "../../utils/EditorEvents";
import { KeyframesItem } from "./KeyframesItem";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { AnimationProperties } from "./AnimationProperties";

export function AnimationView() {
  const [isAnimationObject, setIsAnimationObject] = useState(false);
  const [isLoopable, setIsLoopable] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const [keyframeData, setKeyframeData] = useState([{ start: 0, end: 22 }, { start: 22, end: 44 }]);

  const removeKeyframe = (index: number) => {
    setKeyframeData(keyframeData.filter((_, i) => i != index));
  };

  const addKeyframe = () => {
    const keyframe = { start: 0, end: 22 };
    setKeyframeData(prevData => [...prevData, keyframe]);
  };

  useEffect(() => {

    const handleRefresh = (data: number) => {

      setIsAnimationObject(data === 0 ? true : false);

    };

    editorEventBus.on(EDITOR_EVENT.RefreshAnimationView, handleRefresh);

    return (() => {
      editorEventBus.off(EDITOR_EVENT.RefreshAnimationView, handleRefresh);
    });

  }, []);



  return (<>

    <div className="bg-sidebar-accent my-2 overflow-auto ">
      <div className="w-[calc(100%-10px)] h-[calc(100%-10px)] mx-[5px]">
        {
          isAnimationObject ?
            <div className="grid-cols-1">

              <div className=" select-none p-2 flex justify-between" >
                <span className="w-full font-bold">
                  ANIMATION
                </span>
              </div>

              <Separator orientation="horizontal" />

              <div className="w-1/2">
                <div className="flex items-center justify-center gap-3 w-full m-2">
                  <label htmlFor="Enabled" className="w-1/2 font-bold select-none">Enable</label>
                  <Checkbox id="Enabled" checked={isEnabled} onCheckedChange={(val: boolean) => { setIsEnabled(val); }} />
                </div>

                <div className="flex items-center justify-center gap-3 w-full m-2">
                  <label htmlFor="Loopable" className="w-1/2 font-bold select-none">Loop</label>
                  <Checkbox id="Loopable" checked={isLoopable} onCheckedChange={(val: boolean) => { setIsLoopable(val); }} />
                </div>
              </div>

              <Separator orientation="horizontal" />

              <AnimationProperties />

              <Separator orientation="horizontal" />

              <div className=" select-none p-2 flex justify-between items-center" >
                <span className=" w-1/3 font-bold">
                  KEYFRAMES
                </span>
                <Button className="w-1/3" onClick={() => { addKeyframe(); }}>Add</Button>
              </div>

              <Separator orientation="horizontal" />

              {

                keyframeData.map((data, index) => (
                  <KeyframesItem key={index} start={data.start} end={data.end} onDelete={() => { removeKeyframe(index); }} />
                ))
              }

            </div>
            :
            <Button>Animate</Button>

        }
      </div>
    </div>


  </>);

}
