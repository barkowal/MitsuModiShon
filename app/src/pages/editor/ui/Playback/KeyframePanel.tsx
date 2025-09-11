import { useRef, useState, type MouseEvent } from "react";

type Props = {
  playHeadKeyframe: number,
  setPlayHeadKeyframe: CallableFunction,
  duration: number,
}

export function KeyframePanel({ playHeadKeyframe, setPlayHeadKeyframe, duration }: Props) {
  const holder = useRef<HTMLDivElement | null>(null);
  const [isDraggging, setIsDragging] = useState(false);

  const handleMousePosition = (e: MouseEvent) => {
    if (!isDraggging) return;

    if (holder.current) {
      const rect = holder.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const gapSize = Math.floor(rect.width) / (duration);

      const pos = Math.floor(x / gapSize);
      setPlayHeadKeyframe(pos);
    }

  };

  const changePos = (e: MouseEvent) => {
    if (holder.current) {
      const rect = holder.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const gapSize = Math.floor(rect.width) / (duration);

      const pos = Math.floor(x / gapSize);
      setPlayHeadKeyframe(pos);
    }

  };

  return (

    <>
      <div ref={holder} className="flex flex-col items-center p-2 mx-2  "
        onMouseDown={() => { setIsDragging(true); }}
        onMouseMove={(e) => { handleMousePosition(e); }}
        onClick={(e) => { changePos(e); }}
        onMouseUp={() => { setIsDragging(false); }}
      >
        <div className="relative w-full h-10 bg-sidebar border-card-foreground/20 border-1">
          <div
            className="absolute top-0 left-0 h-full bg-sidebar-accent"
            style={{ width: `${(playHeadKeyframe / (duration)) * 100}%` }}
          />
          {Array.from({ length: Math.floor(duration / 10) + 1 }, (_, i) => (
            <div key={i} className="absolute top-0 bg-foreground w-[1px] h-5" style={{ left: `${(i * 10 / duration) * 100}%` }}>
            </div>
          ))}

          <div
            className="absolute top-0 left-0 h-full w-1 bg-card-foreground"
            style={{ left: `${(playHeadKeyframe / (duration)) * 100}%` }}
          />
        </div>
      </div>
    </>
  );
};
