import { TreeSceneView } from "./TreeView/TreeSceneView";
import { TransformationMenu } from "./TransformationMenu/TransformationMenu";
import { SceneBackgroundMenu } from "./SceneBackgroundMenu";
import { ObjectNameMenu } from "./ObjectNameMenu";
import { Separator } from "@/components/ui/separator";
import { MaterialView } from "./MaterialMenu/MaterialView";
import { LayersMenu } from "./LayersMenu";
import { AnimationView } from "./ObjectAnimationMenu/AnimationView";

function AnimationPanel() {

  return (
    <>
      <div className="w-full h-full p-4 overflow-auto">
        <TreeSceneView />
        <TransformationMenu />
        <ObjectNameMenu />
        <SceneBackgroundMenu />
        <Separator orientation="horizontal" />
        <MaterialView />
        <LayersMenu />
        <AnimationView />
      </div>
    </>
  );

}

export default AnimationPanel;
