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
        <Rewind className="cursor-pointer" onClick={() => { onRewind(); }} />
        <div className="mx-2 cursor-pointer">
          {isPlaying ?
            <Pause onClick={() => { onPause(); }} /> :
            <Play onClick={() => { onPlay(); }} />}
        </div>
        <FastForward className="cursor-pointer" onClick={() => { onForward(); }} />
      </div>
    </>
  );
}

