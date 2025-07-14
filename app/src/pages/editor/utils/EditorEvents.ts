import type { MaterialItem, TreeItem, Vec3 } from "@/pages/editor/utils/Types";

export const EDITOR_EVENT = {
  /**
   * Signal for adding a mesh to the scene.
   * @returns {string} meshType - The type of the mesh to add
   */
  AddMesh: "AddMesh",

  /**
   * Signal for removing an object from the scene
   * @returns {void}
   */
  RemoveMesh: "RemoveMesh",

  /**
   * Signal for refreshing the tree scene view
   * @returns {Array<TreeItem>} treeItems - array of TreeItems
   */
  RefreshTreeView: "RefreshTreeView",

  /**
   * Signal for refreshing the transformation panel
   * @returns {Array<Vec3>} transformations - array of position, scale, rotation
   */
  RefreshTransformationMenu: "RefreshTransformationMenu",

  /**
   * Signal for refreshing the selected name of the object in the ui
   * @returns {string} name - name of the object
   */
  RefreshNameMenu: "RefreshNameMenu",

  /**
   * Signal for selecting single object. It should clear all selections
   * @returns {number} id - id of the selected object
   */
  SelectObject: "SelectObject",

  /**
   * Signal for new object to add into selections
   * @returns {number} - object id to add
   */
  AddSelection: "AddSelection",

  /**
   * Signal for attaching one object to another
   * @returns {Array<number>} objectsId - first object is the parent, second is the object being attached
   */
  AttachToObject: "AttachToObject",

  /**
   * Signal for deselecting every object
   * @returns {void}
   */
  ClearSelections: "ClearSelections",

  /**
   * Signal for refreshing the object selections in the ui
   * @returns {Array<number>} - array of selected object id's 
   */
  RefreshSelections: "RefreshSelections",

  /**
   * Signal for moving the object. Unlike 'ChangePosition' it should emit every time object's 
   * position changes not only after releasing the mouse. It won't add a command.
   * @returns {Vec3} position - Vec3 position of currently selected object
   */
  MoveObject: "MoveObject",

  /**
   * Signal for changing the object's position
   * @returns {Array<Vec3>} positions - Array containing old and new position of currently selected object
   */
  ChangePosition: "ChangePosition",

  /**
   * Signal for scaling the object. Unlike 'ChangeScale' it should emit every time object's 
   * scale changes not only after releasing the mouse. It won't add a command.
   * @returns {Vec3} scale - Vec3 scale of currently selected object
   */
  ScaleObject: "ScaleObject",

  /**
   * Signal for changing the object's scale
   * @returns {Array<Vec3>} scales - Array of old and new scale of currently selected object
   */
  ChangeScale: "ChangeScale",

  /**
   * Signal for rotating the object. Unlike 'ChangeRotation' it should emit every time object's 
   * rotationchanges not only after releasing the mouse. It won't add a command.
   * @returns {Vec3} rotation - Vec3 rotation of currently selected object
   */
  RotateObject: "RotateObject",

  /**
   * Signal for changing the object's rotation 
   * @returns {Array<Vec3>} rotation - Array of old and new rotation of currently selected object
   */
  ChangeRotation: "ChangeRotation",

  /**
   * Signal for changing the object's name
   * @returns {string} name - name of currently selected object
   */
  ChangeObjectName: "ChangeObjectName",

  /**
   * Signal for changing the material of the object
   * @returns {MaterialItem} materialItem - data about the material
   */
  ChangeMeshMaterial: "ChangeMeshMaterial",

  /**
   * Signal for refreshing the material menu in the ui
   * @returns {MaterialItem} materialItem - data about the material
   */
  RefreshMeshMaterial: "RefreshMeshMaterial",

  /**
   * Signal for changing the scene's color 
   * @returns {number} color - hex color of the scene
   */
  ChangeSceneColor: "ChangeSceneColor",

  /**
   * Signal for setting a predefined viewport
   * @returns {string} viewType - type of predefined view
   */
  ChangeViewport: "ChangeViewport",

  /**
   * Signal for changing the transformsControl mode
   * @returns {string} mode - The transformation mode
   */
  SetControlMode: "SetControlMode",

  /**
   * Signal for sending scene information to show
   * @returns {Array<number>} sceneInfo - array of type SCENE_INFO
   */
  SendSceneInfo: "SendSceneInfo",

  /**
   * Signal for sending render time
   * @returns {number} renderTime - time of render
   */
  SendRenderTime: "SendRenderTime",

  /**
   * Signal for sending warning to the screen
   * @returns {string} warning - message to show
   */
  SendWarningLog: "SendWarningLog",


  /**
   * Signal for switching to next editor mode. Unlike ChangeEditorMode it doesn't have a parameter.
   * It's only a signal for key press.
   * @returns {void}
   */
  SwtichEditorMode: "SwitchEditorMode",

  /**
   * Signal for changing the editor mode
   * @returns {string} editorMode - current mode of the editor
   */
  ChangeEditorMode: "ChangeEditorMode",

  /**
   * Signal for changing the editing selection mode while the editor is in edit mode.
   * @returns {number} editingMode - mode for changing. Possible values: 0-faces, 1-edges, 2-vertices
   */
  ChangeEditingMode: "ChangeEditingMode",

  /**
   * Signal for changing the painting mode while the editor is in paint mode.
   * @returns {number} paintMode - mode for changing. Possible values: 0-vertex painting, 1-drawing lines
   */
  ChangePaintingMode: "ChangePaintingMode",

  /**
   * Signal for changing the setting of painting mode
   * @returns {Array<number>} settings - Possible values: 0-hex color, 1- line width, 2-line offset
   */
  ChangePaintingSettings: "ChangePaintingSettings",

  /**
   * Signal for user pressing the 1 on keyboard.
   * It should change editing mode while in edit mode.
   * @returns {number} nb - the number key that user pressed
   */
  NumberPressed: "NumberPressed",

  /**
   * Signal for copying object
   * @returns {void}
   */
  COPY: "Copy",

  /**
   * Signal for pasting the copied object
   * @returns {void}
   */
  PASTE: "Paste",

  /**
   * Signal for undo
   * @returns {void}
   */
  UNDO: "Undo",

  /**
   * Signal for redo
   * @returns {void}
   */
  REDO: "Redo",
} as const;

type ObjectValues<T> = T[keyof T]

export type EditorEvent = ObjectValues<typeof EDITOR_EVENT>

type eventData =
  | number
  | string
  | boolean
  | Vec3
  | MaterialItem
  | Array<number>
  | Array<Vec3>
  | Array<TreeItem>;

class EditorEventBus {
  private listeners: { [key: string]: CallableFunction[] };

  constructor() {
    this.listeners = {};
  }

  on(event: EditorEvent, callback: CallableFunction): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: EditorEvent, callback: CallableFunction): void {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(
        (listener) => listener !== callback
      );
    }
  }

  emit(event: EditorEvent, data?: eventData): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach((listener) => listener(data));
    }
  }

  showAllListeners() {
    console.log(this.listeners);
  }
}

export const editorEventBus = new EditorEventBus();
