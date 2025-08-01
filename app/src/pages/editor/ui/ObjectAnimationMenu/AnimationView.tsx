import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { EDITOR_EVENT, editorEventBus } from "../../utils/EditorEvents";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { AnimationKeyframes } from "./AnimationKeyframes";
import type { AnimationObjectData, KeyframeSequence } from "../../utils/Types";

export function AnimationView() {
  const [isAnimationObject, setIsAnimationObject] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [isEnabled, setIsEnabled] = useState(true);
  const [sequenceData, setSequenceData] = useState<Array<KeyframeSequence> | null>(null);

  const changeObjectsPlaying = (enabled: boolean) => {
    setIsEnabled(enabled);
    editorEventBus.emit(EDITOR_EVENT.SetAnimationObjectPlaying, enabled);
  };

  const changeObjectsLooping = (loop: boolean) => {
    setIsLooping(loop);
    editorEventBus.emit(EDITOR_EVENT.SetAnimationObjectLooping, loop);
  };

  useEffect(() => {

    const handleRefresh = (data: AnimationObjectData | number) => {

      if (typeof data === "number") {
        setIsAnimationObject(false);
        setSequenceData(null);
        return;
      }

      setIsAnimationObject(true);
      setIsEnabled(data.enabled);
      setIsLooping(data.loop);
      setSequenceData(data.animationKeyframes);
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
                  <Checkbox id="Enabled" checked={isEnabled} onCheckedChange={(val: boolean) => { changeObjectsPlaying(val); }} />
                </div>

                <div className="flex items-center justify-center gap-3 w-full m-2">
                  <label htmlFor="Loopable" className="w-1/2 font-bold select-none">Loop</label>
                  <Checkbox id="Loopable" checked={isLooping} onCheckedChange={(val: boolean) => { changeObjectsLooping(val); }} />
                </div>
              </div>

              <Separator orientation="horizontal" />

              <AnimationKeyframes sequenceData={sequenceData} />

            </div>
            :
            <Button>Animate</Button>

        }
      </div >
    </div >


  </>);

}
