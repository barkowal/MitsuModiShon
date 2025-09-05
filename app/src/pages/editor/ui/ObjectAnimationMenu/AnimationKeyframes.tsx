import { useEffect, useRef, useState } from "react";
import { EDITOR_EVENT, editorEventBus } from "../../utils/EditorEvents";
import { insertSort } from "@/lib/utils";
import { KeyframesItem } from "./KeyframesItem";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ANIMATION_PROPERTY, type KeyframeSequence } from "../../utils/Types";
import { useTranslation } from "react-i18next";

type frame = {
  property: string,
  keyframes: Array<number>,
  interpolations: Array<number>,
}

type Props = {
  sequenceData: Array<KeyframeSequence> | null
}

export function AnimationKeyframes({ sequenceData }: Props) {
  const { t } = useTranslation();
  const currentKeyframe = useRef(0);
  const [selectedProperty, setSelectedProperty] = useState("All");
  const [animationKeyframes, setAnimationKeyframes] = useState<Array<frame>>(getDataFromSequence(sequenceData));
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

  const handleInterpolationChange = (interpolation: number, keyframeIndex: number) => {
    const property = animationProperties.get(selectedProperty);

    if (property === undefined) return;
    editorEventBus.emit(EDITOR_EVENT.ChangeKeyframeInterpolation, [keyframeIndex, property, interpolation]);

    const arr = animationKeyframes.findIndex((val) => val.property === selectedProperty);
    animationKeyframes[arr].interpolations[keyframeIndex] = interpolation;

    setAnimationKeyframes([...animationKeyframes]);
  };

  const getItemProperty = (): number => {
    const property = animationProperties.get(selectedProperty);
    if (property === undefined) return 0;
    return property + 1; // including "All"
  };

  // TODO make interpolation for other properties
  const isInterpolationPossible = (): boolean => {
    if (selectedProperty === "Position") return true;
    if (selectedProperty === "Scale") return true;

    return false;
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

    setAnimationKeyframes(getDataFromSequence(sequenceData));

    const handleRefreshKeyframe = (keyframe: number) => {
      currentKeyframe.current = keyframe;
    };

    editorEventBus.on(EDITOR_EVENT.RefreshAnimationPanel, handleRefreshKeyframe);
    editorEventBus.on(EDITOR_EVENT.SetKeyframe, handleRefreshKeyframe);

    return (() => {
      editorEventBus.off(EDITOR_EVENT.RefreshAnimationPanel, handleRefreshKeyframe);
      editorEventBus.off(EDITOR_EVENT.SetKeyframe, handleRefreshKeyframe);
    });

  }, [sequenceData]);

  return (
    <div>

      <div className=" select-none p-2 flex justify-between items-center" >
        <span className=" w-1/3 font-bold">
          {t("Keyframes").toUpperCase()}
        </span>

        <div className="flex items-center my-2 justify-center gap-3 w-full ">
          <Select defaultValue="All" onValueChange={(val: string) => { setSelectedProperty(val); }}>
            <SelectTrigger className=" w-11/12 min-[30ch] m-auto">
              <SelectValue placeholder={t("All")} />
            </SelectTrigger>
            <SelectContent >
              <SelectItem value="All">{t("All")}</SelectItem>
              <SelectItem value="Position">{t("Position")}</SelectItem>
              <SelectItem value="Scale">{t("Scale")}</SelectItem>
              <SelectItem value="Rotation">{t("Rotation")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button className="w-1/3" onClick={() => { handleCreatingKeyframe(); }}>{t("Add")}</Button>

      </div>

      <Separator orientation="horizontal" />

      <div>
        {animationKeyframes
          .filter((item) => item.property === selectedProperty)
          .map((item) => (

            item.keyframes.map((data, index) => (
              <KeyframesItem key={index} keyframe={data}
                selectedInterpolation={animationKeyframes[getItemProperty()].interpolations[index]}
                allowChangingInterpolation={isInterpolationPossible()}
                onInterpolationChange={(val: number) => { handleInterpolationChange(val, index); }}
                onDelete={() => { handleRemovingKeyframe(index); }} />
            ))

          ))}
      </div>

    </div>
  );
}

function getSharedKeyframes(data: Array<KeyframeSequence> | null): Array<number> {
  if (data === null) return [];

  const set1 = new Set(data[ANIMATION_PROPERTY.Position].keyframes);
  const set2 = new Set(data[ANIMATION_PROPERTY.Scale].keyframes);
  const set3 = new Set(data[ANIMATION_PROPERTY.Rotation].keyframes);

  const sharedKeyframes = [...set1].filter(num => set2.has(num) && set3.has(num));

  return sharedKeyframes;
}

function getSharedInterpolations(data: Array<KeyframeSequence> | null): Array<number> {
  if (data === null) return [];

  const set1 = new Set(data[ANIMATION_PROPERTY.Position].interpolations);
  const set2 = new Set(data[ANIMATION_PROPERTY.Scale].interpolations);
  const set3 = new Set(data[ANIMATION_PROPERTY.Rotation].interpolations);

  const sharedKeyframes = [...set1].filter(num => set2.has(num) && set3.has(num));

  return sharedKeyframes;
}

function getDataFromSequence(sequenceData: Array<KeyframeSequence> | null): Array<frame> {

  return [
    { property: "All", keyframes: getSharedKeyframes(sequenceData), interpolations: getSharedInterpolations(sequenceData) },
    {
      property: "Position",
      keyframes: sequenceData === null ? [] : sequenceData[ANIMATION_PROPERTY.Position].keyframes,
      interpolations: sequenceData === null ? [] : sequenceData[ANIMATION_PROPERTY.Position].interpolations,
    },
    {
      property: "Scale",
      keyframes: sequenceData === null ? [] : sequenceData[ANIMATION_PROPERTY.Scale].keyframes,
      interpolations: sequenceData === null ? [] : sequenceData[ANIMATION_PROPERTY.Scale].interpolations,
    },
    {
      property: "Rotation",
      keyframes: sequenceData === null ? [] : sequenceData[ANIMATION_PROPERTY.Rotation].keyframes,
      interpolations: sequenceData === null ? [] : sequenceData[ANIMATION_PROPERTY.Rotation].interpolations,
    },
  ];
}

