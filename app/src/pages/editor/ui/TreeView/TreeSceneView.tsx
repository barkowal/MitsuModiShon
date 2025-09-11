import { useEffect, useState } from "react";
import type { TreeItem } from "../../utils/Types";
import { ObjectList } from "./ObjectList";
import { EDITOR_EVENT, editorEventBus } from "../../utils/EditorEvents";

export function TreeSceneView() {
  const [sceneObjects, setSceneObjects] = useState<Array<TreeItem> | null>(null);

  useEffect(() => {
    const handleRefreshView = (items: Array<TreeItem>) => {
      setSceneObjects(items);
    };

    editorEventBus.on(EDITOR_EVENT.RefreshTreeView, handleRefreshView);

    return () => {
      editorEventBus.off(EDITOR_EVENT.RefreshTreeView, handleRefreshView);
    };

  }, []);

  return (<>
    <div className="overflow-auto bg-tree-background border border-bg-primary resize-y w-full min-h-[10ch] max-h-1/2">
      {sceneObjects != null && <ObjectList treeList={sceneObjects} level={0} />}
    </div>
  </>);
}
