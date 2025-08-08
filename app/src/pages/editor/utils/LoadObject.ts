import { EDITOR_EVENT, editorEventBus } from "./EditorEvents";
import { ModellingObjectLoader } from "./objects/Custom/ModellingObjectLoader";
import { Object3D, ObjectLoader } from "three/webgpu";

export function LoadObject(file: string): Object3D | null {

  const loader = new ObjectLoader();
  const jsonData = JSON.parse(file);
  let object;

  if (!("object" in jsonData)) {
    editorEventBus.emit(EDITOR_EVENT.SendWarningLog, "Error uploading a file. Please upload json of type Object3d.");
    return null;
  }

  if (jsonData.object.type === "ModellingMesh") {
    const modellingLoader = new ModellingObjectLoader(loader);
    object = modellingLoader.parse(jsonData);
  } else {
    object = loader.parse(jsonData);
  }
  return object;
}
