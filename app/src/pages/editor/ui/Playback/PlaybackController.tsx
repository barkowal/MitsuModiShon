import { FastForward, Pause, Play, Rewind } from "lucide-react";

type Params = {
  isPlaying: boolean,
  onPlay: CallableFunction,
  onPause: CallableFunction
  onRewind: CallableFunction,
  onForward: CallableFunction,
}

export function PlaybackController({ onPlay, onPause, onRewind, onForward, isPlaying }: Params) {

  return (
    <>
      <div className="flex">
        <Rewind aria-label="Rewind button" className="cursor-pointer" onClick={() => { onRewind(); }} />
        <div className="mx-2 cursor-pointer">
          {isPlaying ?
            <Pause onClick={() => { onPause(); }} /> :
            <Play onClick={() => { onPlay(); }} />}
        </div>
        <FastForward aria-label="Forward button" className="cursor-pointer" onClick={() => { onForward(); }} />
      </div>
    </>
  );
}

