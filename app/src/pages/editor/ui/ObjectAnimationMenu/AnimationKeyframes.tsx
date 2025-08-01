import { useEffect, useRef, useState } from "react";
import { EDITOR_EVENT, editorEventBus } from "../../utils/EditorEvents";
import { insertSort } from "@/lib/utils";
import { KeyframesItem } from "./KeyframesItem";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ANIMATION_PROPERTY, type KeyframeSequence } from "../../utils/Types";

type frame = {
  property: string,
  keyframes: Array<number>,
}

type Props = {
  sequenceData: Array<KeyframeSequence> | null
}

function getSharedKeyframes(data: Array<KeyframeSequence> | null): Array<number> {
  if (data === null) return [];

  const set1 = new Set(data[ANIMATION_PROPERTY.Position].keyframes);
  const set2 = new Set(data[ANIMATION_PROPERTY.Scale].keyframes);
  const set3 = new Set(data[ANIMATION_PROPERTY.Rotation].keyframes);

  const sharedKeyframes = [...set1].filter(num => set2.has(num) && set3.has(num));

  return sharedKeyframes;
}

export function AnimationKeyframes({ sequenceData }: Props) {
  const currentKeyframe = useRef(0);
  const [selectedProperty, setSelectedProperty] = useState("All");
  const [animationKeyframes, setAnimationKeyframes] = useState<Array<frame>>([
    { property: "All", keyframes: getSharedKeyframes(sequenceData) },
    { property: "Position", keyframes: sequenceData === null ? [] : sequenceData[ANIMATION_PROPERTY.Position].keyframes },
    { property: "Scale", keyframes: sequenceData === null ? [] : sequenceData[ANIMATION_PROPERTY.Scale].keyframes },
    { property: "Rotation", keyframes: sequenceData === null ? [] : sequenceData[ANIMATION_PROPERTY.Rotation].keyframes },
  ]);
  const animationProperties = new Map([
    ["Position", ANIMATION_PROPERTY.Position],
    ["Scale", ANIMATION_PROPERTY.Scale],
    ["Rotation", ANIMATION_PROPERTY.Rotation],
  ]);

  const removeKeyframe = (property: string, propertyValue: number, index: number) => {
    const arr = animationKeyframes.findIndex((val) => val.property === property);
    animationKeyframes[arr].keyframes = animationKeyframes[arr].keyframes.filter((_, i) => i != index);

    if (propertyValue != -1)
      editorEventBus.emit(EDITOR_EVENT.RemoveAnimationKeyframe, [index, propertyValue]);

    setAnimationKeyframes([...animationKeyframes]);
  };

  const handleRemovingKeyframe = (index: number) => {
    if (selectedProperty === "All") {
      animationProperties.forEach((value, key) => { removeKeyframe(key, value, index); });
      removeKeyframe(selectedProperty, -1, index);
      return;
    }

    const propertyValue = animationProperties.get(selectedProperty);

    if (propertyValue !== undefined) {
      removeKeyframe(selectedProperty, propertyValue, index);
    }
  };

  const handleCreatingKeyframe = () => {

    if (selectedProperty === "All") {
      animationProperties.forEach((value, key) => { addKeyframe(key, value); });
      addKeyframe("All", -1);
      return;
    }

    const propertyValue = animationProperties.get(selectedProperty);

    if (propertyValue !== undefined) {
      addKeyframe(selectedProperty, propertyValue);
    }

  };

  // This is ugly
  const addKeyframe = (property: string, propertyValue: number) => {
    const keyframe = currentKeyframe.current;

    const index = animationKeyframes.findIndex((val) => val.property === property);
    const kData = animationKeyframes[index].keyframes;

    if (kData.includes(keyframe)) return;

    if (propertyValue != -1)
      editorEventBus.emit(EDITOR_EVENT.AddAnimationKeyframe, [propertyValue, keyframe]);

    if (kData.length === 0) {
      kData.push(keyframe);
      setAnimationKeyframes([...animationKeyframes]);
      return;
    }

    insertSort(kData, keyframe);
    setAnimationKeyframes([...animationKeyframes]);
  };

  useEffect(() => {

    const handleRefreshKeyframe = (keyframe: number) => {
      currentKeyframe.current = keyframe;
    };

    editorEventBus.on(EDITOR_EVENT.RefreshAnimationPanel, handleRefreshKeyframe);
    editorEventBus.on(EDITOR_EVENT.SetKeyframe, handleRefreshKeyframe);

    return (() => {
      editorEventBus.off(EDITOR_EVENT.RefreshAnimationPanel, handleRefreshKeyframe);
      editorEventBus.off(EDITOR_EVENT.SetKeyframe, handleRefreshKeyframe);
    });

  }, []);

  return (
    <div>

      <div className=" select-none p-2 flex justify-between items-center" >
        <span className=" w-1/3 font-bold">
          KEYFRAMES
        </span>

        <div className="flex items-center my-2 justify-center gap-3 w-full ">
          <Select defaultValue="All" onValueChange={(val: string) => { setSelectedProperty(val); }}>
            <SelectTrigger className=" w-11/12 min-[30ch] m-auto">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent >
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Position">Position</SelectItem>
              <SelectItem value="Scale">Scale</SelectItem>
              <SelectItem value="Rotation">Rotation</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button className="w-1/3" onClick={() => { handleCreatingKeyframe(); }}>Add</Button>

      </div>

      <Separator orientation="horizontal" />

      <div>
        {animationKeyframes
          .filter((item) => item.property === selectedProperty)
          .map((item) => (

            item.keyframes.map((data, index) => (
              <KeyframesItem key={index} keyframe={data} onDelete={() => { handleRemovingKeyframe(index); }} />
            ))

          ))}
      </div>

    </div>
  );
}
