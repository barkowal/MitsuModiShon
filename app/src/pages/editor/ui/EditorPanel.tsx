import { TreeSceneView } from "./TreeView/TreeSceneView";
import { TransformationMenu } from "./TransformationMenu/TransformationMenu";
import { SceneBackgroundMenu } from "./SceneBackgroundMenu";
import { MeshColorMenu } from "./MeshColorMenu";
import { ObjectNameMenu } from "./ObjectNameMenu";
import { Separator } from "@/components/ui/separator";

function EditorPanel() {

  return (
    <>
      <div className="w-full h-full p-4 ">
        <TreeSceneView />
        <TransformationMenu />
        <ObjectNameMenu />
        <Separator orientation="horizontal" />
        <MeshColorMenu />
        <Separator orientation="horizontal" />
        <SceneBackgroundMenu />
      </div>
    </>
  );

}

export default EditorPanel;
