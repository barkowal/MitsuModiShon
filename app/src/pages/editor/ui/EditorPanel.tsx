import { TreeSceneView } from "./TreeView/TreeSceneView";
import { TransformationMenu } from "./TransformationMenu/TransformationMenu";
import { SceneBackgroundMenu } from "./SceneBackgroundMenu";
import { ObjectNameMenu } from "./ObjectNameMenu";
import { Separator } from "@/components/ui/separator";
import { MaterialView } from "./MaterialMenu/MaterialView";
import { LayersMenu } from "./LayersMenu";

function EditorPanel() {

  return (
    <>
      <div className="w-full h-full p-4 ">
        <TreeSceneView />
        <TransformationMenu />
        <ObjectNameMenu />
        <SceneBackgroundMenu />
        <Separator orientation="horizontal" />
        <MaterialView />
        <LayersMenu />
      </div>
    </>
  );

}

export default EditorPanel;
