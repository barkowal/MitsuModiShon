import { useEffect, useState } from "react";
import { EDITOR_EVENT, editorEventBus } from "../utils/EditorEvents";
import { SCENE_INFO } from "../utils/Types";
import { useTranslation } from "react-i18next";

export default function RenderInfoPanel() {
  const { t } = useTranslation();
  const [shouldShow, setShouldShow] = useState(true);
  const [objectCount, setObjectCount] = useState(0);
  const [verticesCount, setVerticesCount] = useState(0);
  const [trianglesCount, setTrianglesCount] = useState(0);
  const [geometries, setGeometries] = useState(0);
  const [textures, setTextures] = useState(0);
  const [renderTime, setRenderTime] = useState("");

  useEffect(() => {

    const handleSendSceneInfo = (info: Array<number>) => {
      setObjectCount(info[SCENE_INFO.Objects]);
      setVerticesCount(info[SCENE_INFO.Vertices]);
      setTrianglesCount(info[SCENE_INFO.Triangles]);
      if (info.length > 3) {
        setGeometries(info[SCENE_INFO.RendererGeometries]);
        setTextures(info[SCENE_INFO.RendererTextures]);
      }
    };

    const handleRenderTime = (time: number) => {
      setRenderTime(Number(time).toFixed(2));
    };

    // TODO maybe later there should be event for turning on/off debug info
    const handleSwitchRendering = (isRendering: boolean) => {
      setShouldShow(!isRendering);
    };

    editorEventBus.on(EDITOR_EVENT.SendSceneInfo, handleSendSceneInfo);
    editorEventBus.on(EDITOR_EVENT.SendRenderTime, handleRenderTime);
    editorEventBus.on(EDITOR_EVENT.SwitchRendering, handleSwitchRendering);

    return (() => {
      editorEventBus.off(EDITOR_EVENT.SendSceneInfo, handleSendSceneInfo);
      editorEventBus.off(EDITOR_EVENT.SendRenderTime, handleRenderTime);
      editorEventBus.off(EDITOR_EVENT.SwitchRendering, handleSwitchRendering);
    });

  }, []);

  return (<>
    {shouldShow ?
      <div className="absolute z-[100] bottom-0 m-4 text-sm block select-none">
        <p>{t("Objects")}: {objectCount}</p>
        <p>{t("Vertices")}: {verticesCount}</p>
        <p>{t("Triangles")}: {trianglesCount}</p>
        <p>{t("RendererGeometries")}: {geometries}</p>
        <p>{t("RendererTextures")}: {textures}</p>
        <p>{t("RenderTime")}: {renderTime}</p>
      </div > : null
    }
  </>);

}
