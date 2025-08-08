import { useEffect, useState } from "react";
import { EDITOR_EVENT, editorEventBus } from "../utils/EditorEvents";

type Props = {
  bottomMargin?: number;
}

export default function WarningLogPanel({ bottomMargin = 0 }: Props) {
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let timeoutID: NodeJS.Timeout;

    const handleWarningLog = (warning: string) => {

      clearTimeout(timeoutID);
      setMsg(warning);

      timeoutID = setTimeout(() => {
        setMsg("");
      }, 3000);

    };

    editorEventBus.on(EDITOR_EVENT.SendWarningLog, handleWarningLog);

    return (() => {
      editorEventBus.off(EDITOR_EVENT.SendWarningLog, handleWarningLog);
      clearTimeout(timeoutID);
    });

  }, []);

  return (<>
    <div className="absolute z-[100] font-bold drop-shadow-[1px_1px_1px_rgba(0,0,0,1)]
      left-1/4 text-cente  m-4 text-md block select-none text-warning-log"
      style={{ bottom: bottomMargin }}
    >
      <p>{msg}</p>
    </div >
  </>);

}
