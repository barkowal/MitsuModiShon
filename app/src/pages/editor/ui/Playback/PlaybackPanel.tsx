import { useEffect, useState } from "react";
import { KeyframePanel } from "./KeyframePanel";
import { PlaybackController } from "./PlaybackController";
import { EDITOR_EVENT, editorEventBus } from "../../utils/EditorEvents";
import { DEFAULT_FPS, DEFAULT_KEYFRAME_DURATION, DEFAULT_LOOP_SETTING } from "../../utils/Global";
import { Checkbox } from "@/components/ui/checkbox";
import { Film } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import DraggableInput from "@/components/DraggableInput";
import type { AnimationLoopSettings } from "../../utils/Types";
import { useTranslation } from "react-i18next";


export function PlaybackPanel() {
  const { t } = useTranslation();
  const [duration, setDuration] = useState(DEFAULT_KEYFRAME_DURATION);
  const [fps, setFps] = useState(DEFAULT_FPS);
  const [isLooping, setIsLooping] = useState(DEFAULT_LOOP_SETTING);
  const [currentKeyframe, setCurrentKeyframe] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const changeKeyframe = (val: number) => {

    if (val > duration) val = duration;
    if (val < 0) val = 0;

    setCurrentKeyframe(val);
    editorEventBus.emit(EDITOR_EVENT.SetKeyframe, val);
  };

  const setKeyframeDuration = (val: number) => {

    setDuration(val);
    editorEventBus.emit(EDITOR_EVENT.SetKeyframeDuration, val);

  };

  const changeFPS = (val: number) => {

    setFps(val);
    editorEventBus.emit(EDITOR_EVENT.SetAnimationFps, val);

  };

  const changeLooping = (val: boolean) => {

    setIsLooping(val);
    editorEventBus.emit(EDITOR_EVENT.SetAnimationLooping, val);

  };

  useEffect(
    () => {

      const handleRefreshAnimationPanel = (animationKeyframe: number) => {

        if (currentKeyframe !== animationKeyframe) {
          setCurrentKeyframe(animationKeyframe);
        }

      };

      const handleStopPlayback = () => {

        setIsPlaying(false);

      };

      const handleRefreshPlayback = (settings: AnimationLoopSettings) => {
        setDuration(settings.duration);
        setIsLooping(settings.loop);
        setFps(settings.fps);
      };

      editorEventBus.on(EDITOR_EVENT.RefreshAnimationPanel, handleRefreshAnimationPanel);
      editorEventBus.on(EDITOR_EVENT.StopPlayback, handleStopPlayback);
      editorEventBus.on(EDITOR_EVENT.RefreshAnimationPlayback, handleRefreshPlayback);

      return (() => {
        editorEventBus.off(EDITOR_EVENT.RefreshAnimationPanel, handleRefreshAnimationPanel);
        editorEventBus.off(EDITOR_EVENT.StopPlayback, handleStopPlayback);
        editorEventBus.off(EDITOR_EVENT.RefreshAnimationPlayback, handleRefreshPlayback);
      });

    }, [currentKeyframe, duration]);

  const playAnimation = () => {
    if (currentKeyframe >= duration) return;
    setIsPlaying(true);
    editorEventBus.emit(EDITOR_EVENT.PlayAnimation, currentKeyframe);
  };
  const stopAnimation = () => {
    setIsPlaying(false);
    editorEventBus.emit(EDITOR_EVENT.StopAnimation);
  };

  return (<>

    <div className="w-full h-fit p-0 m-0 bg-primary-foreground border-t border-white select-none">


      <div className="w-full h-fit gap-2 p-2 flex justify-between">

        <div className="flex space-x-2">
          <Film />
          <p>
            {currentKeyframe}
          </p>
        </div>

        <PlaybackController
          isPlaying={isPlaying}
          onPlay={() => { playAnimation(); }}
          onPause={() => { stopAnimation(); }}
          onRewind={() => { changeKeyframe(currentKeyframe - 10); }}
          onForward={() => { changeKeyframe(currentKeyframe + 10); }} />

        <div className="flex gap-2 items-center font-bold">

          <span className="flex">
            <DraggableInput labelText={t("Duration") + ":"} minValue={0} maxValue={1000} decimalPoints={0}
              value={duration} onValueChange={(val: number) => { setKeyframeDuration(val); }}
              inputWidth={8} className="h-fit rounded-none p-0.5 m-0" />
          </span>

          <Separator orientation="vertical" />

          <span className="flex">
            <DraggableInput labelText={t("FPS") + ":"} minValue={1} maxValue={144} decimalPoints={0} step={1}
              value={fps} onValueChange={(val: number) => { changeFPS(val); }}
              inputWidth={5} className="h-fit rounded-none p-0.5 m-0" />
          </span>

          <Separator orientation="vertical" />

          <span className="flex items-center gap-2">
            <label htmlFor="animation-loop">{t("Loop")}</label>
            <Checkbox id="animation-loop" checked={isLooping} onCheckedChange={(val: boolean) => { changeLooping(val); }} />
          </span>
        </div>

      </div>

      <KeyframePanel playHeadKeyframe={currentKeyframe} setPlayHeadKeyframe={changeKeyframe} duration={duration} />

    </div>
  </>);
}
