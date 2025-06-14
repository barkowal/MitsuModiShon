import AddMeshDropdown from "./AddMeshDropdown";
import { TreeSceneView } from "./TreeView/TreeSceneView";
import { TransformationMenu } from "./TransformationMenu/TransformationMenu";
import { SceneBackgroundMenu } from "./SceneBackgroundMenu";

function EditorPanel() {

  return (
    <>
      <div className="w-full h-full p-4">
        <AddMeshDropdown />
        <TreeSceneView />
        <TransformationMenu />
        <SceneBackgroundMenu />
      </div>
    </>
  );

}

export default EditorPanel;
