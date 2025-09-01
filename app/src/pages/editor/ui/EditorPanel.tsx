import { TreeSceneView } from "./TreeView/TreeSceneView";
import { TransformationMenu } from "./TransformationMenu/TransformationMenu";
import { SceneBackgroundMenu } from "./SceneBackgroundMenu";
import { ObjectNameMenu } from "./ObjectNameMenu";
import { Separator } from "@/components/ui/separator";
import { LayersMenu } from "./LayersMenu";
import { MeshOrLightParamView } from "./MeshOrLightParamView";

function EditorPanel() {

  return (
    <>
      <div className="w-full h-full p-4 overflow-auto">
        <TreeSceneView />
        <TransformationMenu />
        <ObjectNameMenu />
        <SceneBackgroundMenu />
        <Separator orientation="horizontal" />
        <MeshOrLightParamView />
        <LayersMenu />
      </div >
    </>
  );

}

export default EditorPanel;
