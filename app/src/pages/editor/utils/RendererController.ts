import * as THREE from "three/webgpu";
import { BACKGROUND_LAYER, DEFAULT_SCENE_COLOR, EDITOR_LAYER, INTERSECTION_LAYER, MAIN_MESH_RENDER_ORDER, RENDER_LAYER } from "./Global";
import { ViewHelper } from "./objects/ViewHelper";
import { AddListener } from "./AddListener";
import { OrbitControls, TransformControls } from "three/examples/jsm/Addons.js";
import { type Vec3 } from "./Types";
import { compareVec3, convertEulerToVec3Degrees, convertTVector3ToVec3 } from "./utils";
import { EDITOR_EVENT, editorEventBus } from "./EditorEvents";
import { CreateOutlineMaterial } from "./objects/Custom/OutlineMaterial";

export class RendererController {
  private renderer: THREE.WebGPURenderer;
  private editorCamera: THREE.PerspectiveCamera;
  private renderCamera: THREE.PerspectiveCamera;
  private cameraBox: THREE.Object3D;
  private scene: THREE.Scene;
  private renderRequested: boolean;
  private isRenderingView: boolean;

  private orbitControls: OrbitControls;
  private control: TransformControls;

  private viewHelper: ViewHelper;

  private outlinedObjects: Array<THREE.Mesh>;
  private outlines: Array<THREE.Mesh>;


  constructor() {

    this.renderer = new THREE.WebGPURenderer({ antialias: true });
    this.renderer.autoClear = false;

    this.scene = this.initScene();
    this.editorCamera = this.createEditorCamera();
    this.renderCamera = this.createRenderCamera();
    this.cameraBox = this.createCameraBox();

    this.viewHelper = new ViewHelper(this.editorCamera, this.renderer.domElement);
    AddListener(window, "click", (event: Event) => {
      if (event instanceof MouseEvent)
        this.viewHelper.handleClick(event);
    });

    this.outlinedObjects = [];
    this.outlines = [];

    this.isRenderingView = false;
    this.renderRequested = false;


    this.orbitControls = this.initOrbitControls();
    this.control = this.initControls();

  }

  getRenderer() {
    return this.renderer;
  }

  getScene() {
    return this.scene;
  }

  getEditorCamera() {
    return this.editorCamera;
  }

  getRenderCamera() {
    return this.renderCamera;
  }

  getCameraBox() {
    return this.cameraBox;
  }

  getControl() {
    return this.control;
  }

  getOrbitControls() {
    return this.orbitControls;
  }

  appendRenderer(divElement: HTMLDivElement) {
    divElement.appendChild(this.renderer.domElement);
    this.renderer.setSize(divElement.clientWidth, divElement.clientHeight);

    this.renderer.clearAsync();
  }

  setIsRenderingView(isRendering: boolean) {
    this.isRenderingView = isRendering;
  }

  getRenderImageData() {
    this.renderer.clear();
    this.renderer.render(this.scene, this.renderCamera);
    const imgData = this.renderer.domElement.toDataURL("image/png");
    return imgData;
  }

  setRendererSize(width: number, height: number) {
    this.renderer.setSize(width, height);
  }

  getRendererSize() {
    const size = new THREE.Vector2();
    this.renderer.getSize(size);
    return { width: size.width, height: size.height };
  }

  // The main object has a higher render order than other objects
  // Outline has a lower order than this object, but higher than others
  // This way outline is visible even when other objects are in the way
  outlineObject(object: THREE.Object3D) {
    if (object instanceof THREE.Mesh) {
      object.renderOrder = 4;
      this.outlinedObjects.push(object);

      const clone = object.clone(false);
      if (clone instanceof THREE.Mesh) {
        clone.renderOrder = 3;
        clone.material = CreateOutlineMaterial();
        clone.matrixWorld = object.matrixWorld;
        clone.matrixWorldAutoUpdate = false;

        // Don't show outline in treeview, render and selection
        clone.layers.enable(BACKGROUND_LAYER);
        clone.layers.disable(RENDER_LAYER);
        clone.layers.disable(INTERSECTION_LAYER);

        this.scene.add(clone);
        this.outlines.push(clone);

      }

    }

  }

  clearOutlines() {
    this.outlinedObjects.forEach((obj) => {
      obj.renderOrder = MAIN_MESH_RENDER_ORDER;
    });

    this.outlines.forEach((obj) => {

      this.scene.remove(obj);

      if ("dispose" in obj.material)
        obj.material.dispose();
      obj.geometry.dispose();

    });
  }

  render() {
    if (!this.renderer.hasInitialized()) return;
    if (!this.renderRequested) {
      this.renderRequested = true;
      requestAnimationFrame(() => { this.renderScene(); });
    }
    return true;
  }

  dispose() {

    this.disposeHierarchy(this.scene, this.disposeNode);

    this.scene.remove();
    this.viewHelper.dispose();
    this.renderer._textures?.dispose();
    this.renderer._renderLists?.dispose();
    this.renderer.dispose();

  }

  getRenderInfo() {
    return this.renderer.info.memory;
  }

  private disposeNode(parentObject: THREE.Object3D) {

    parentObject.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.geometry) {
          child.geometry.dispose();
        }

        if (child.material) {

          if ("materials" in child.material) {

            //@ts-expect-error different material types
            child.material.materials.forEach((mtrl) => {
              if (mtrl.map) mtrl.map.dispose();
              if (mtrl.lightMap) mtrl.lightMap.dispose();
              if (mtrl.bumpMap) mtrl.bumpMap.dispose();
              if (mtrl.normalMap) mtrl.normalMap.dispose();
              if (mtrl.specularMap) mtrl.specularMap.dispose();
              if (mtrl.envMap) mtrl.envMap.dispose();

              mtrl.dispose();
            });
          }
          else {
            if (child.material.map) child.material.map.dispose();
            if (child.material.lightMap) child.material.lightMap.dispose();
            if (child.material.bumpMap) child.material.bumpMap.dispose();
            if (child.material.normalMap) child.material.normalMap.dispose();
            if (child.material.specularMap) child.material.specularMap.dispose();
            if (child.material.envMap) child.material.envMap.dispose();

            child.material.dispose();
          }
        }
      }
    });
  }

  private disposeHierarchy(node: THREE.Object3D, callback: CallableFunction) {
    for (let i = node.children.length - 1; i >= 0; i--) {
      const child = node.children[i];
      this.disposeHierarchy(child, callback);
      callback(child);
    }
  }


  private renderScene() {
    this.renderRequested = false;
    const startTime = performance.now();
    if (this.renderer) {

      if (this.isRenderingView) {

        this.renderer.clear();
        this.renderer.render(this.scene, this.renderCamera);

      } else {

        this.renderer.clear();
        this.renderer.render(this.scene, this.editorCamera);

        this.viewHelper.render(this.renderer);


      }
    }
    const renderTime = performance.now() - startTime;
    editorEventBus.emit(EDITOR_EVENT.SendRenderTime, renderTime);
  }

  private initScene(): THREE.Scene {
    const scene = new THREE.Scene();

    const defaultBg = Number("0x" + DEFAULT_SCENE_COLOR.slice(1));
    scene.background = new THREE.Color(defaultBg);

    const axesHelper = new THREE.AxesHelper(10);
    axesHelper.layers.enable(BACKGROUND_LAYER);
    scene.add(axesHelper);

    const gridHelper = this.createGridHelper();
    scene.add(gridHelper);

    return scene;
  }

  private createGridHelper() {
    const size = 20;
    const divisions = 40;
    const gridHelper = new THREE.GridHelper(size, divisions);
    gridHelper.layers.enable(BACKGROUND_LAYER);
    return gridHelper;
  }

  private createEditorCamera() {
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.setZ(5);
    camera.layers.enable(BACKGROUND_LAYER);
    return camera;
  }

  private createRenderCamera() {
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.name = "Renderer";
    camera.layers.disable(EDITOR_LAYER);
    camera.layers.enable(RENDER_LAYER);
    camera.userData.removable = false;
    camera.userData.attachable = false;
    camera.userData.changeableLayers = false;
    return camera;
  }

  private createCameraBox(): THREE.Object3D {
    const cameraHelper = new THREE.CameraHelper(this.renderCamera);
    cameraHelper.userData.removable = false;
    cameraHelper.userData.attachable = false;
    cameraHelper.name = "Visualizer";
    cameraHelper.matrix = new THREE.Matrix4();
    cameraHelper.layers.disable(EDITOR_LAYER);

    const cameraBox = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial({ color: 0x44aa44, wireframe: true }));
    cameraBox.layers.disable(EDITOR_LAYER);
    cameraBox.name = "Camera";
    cameraBox.scale.setScalar(0.4);
    this.renderCamera.scale.setScalar(1/0.4);
    cameraBox.userData.removable = false;
    cameraBox.userData.attachable = false;

    cameraBox.add(this.renderCamera);
    cameraBox.add(cameraHelper);

    this.scene.add(cameraBox);

    return cameraBox;
  }

  private initControls() {
    const control = this.createTransformControl(this.editorCamera, this.renderer, this.orbitControls);
    control.addEventListener("change", () => { this.render(); });

    const gizmo = control.getHelper();
    gizmo.layers.enable(BACKGROUND_LAYER);
    this.scene.add(gizmo);

    return control;
  }

  private initOrbitControls() {
    const orbitControls = new OrbitControls(this.editorCamera, this.renderer.domElement);
    orbitControls.addEventListener("change", () => { this.render(); });
    return orbitControls;
  }

  private createTransformControl(camera: THREE.Camera, renderer: THREE.Renderer, controls: OrbitControls): TransformControls {
    const control = new TransformControls(camera, renderer.domElement);
    control.setTranslationSnap(0.001);
    control.setScaleSnap(0.001);
    control.setRotationSnap(0.001);

    let oldPos: Vec3;
    let movePos: Vec3;
    let oldScale: Vec3;
    let moveScale: Vec3;
    let oldRotation: Vec3;
    let moveRotation: Vec3;
    control.addEventListener("mouseDown", (e) => {
      if (e.mode === "translate") {
        oldPos = convertTVector3ToVec3(control.object.position);
      }
      if (e.mode === "scale") {
        oldScale = convertTVector3ToVec3(control.object.scale);
      }
      if (e.mode === "rotate") {
        oldRotation = convertEulerToVec3Degrees(control.object.rotation);
      }
    });
    control.addEventListener("axis-changed", () => {
      if (control.object) {
        movePos = convertTVector3ToVec3(control.object.position);
        moveScale = convertTVector3ToVec3(control.object.scale);
        moveRotation = convertEulerToVec3Degrees(control.object.rotation);
      }
    });
    control.addEventListener("object-changed", () => {
      if (control.object) {
        movePos = convertTVector3ToVec3(control.object.position);
        moveScale = convertTVector3ToVec3(control.object.scale);
        moveRotation = convertEulerToVec3Degrees(control.object.rotation);
      }
    });
    control.addEventListener("change", () => {
      if (!control.object)
        return;

      if (!control.dragging)
        return;

      const objectPosition = control.object.position;
      const objectScale = control.object.scale;
      const objectRotation = convertEulerToVec3Degrees(control.object.rotation);

      if (movePos && (!compareVec3(objectPosition, movePos))) {
        editorEventBus.emit(EDITOR_EVENT.MoveObject, movePos);
        movePos = convertTVector3ToVec3(control.object.position);
      }

      if (moveScale && (!compareVec3(objectScale, moveScale))) {
        editorEventBus.emit(EDITOR_EVENT.ScaleObject, moveScale);
        moveScale = convertTVector3ToVec3(control.object.scale);
      }

      if (moveRotation && (!compareVec3(objectRotation, moveRotation))) {
        editorEventBus.emit(EDITOR_EVENT.RotateObject, moveRotation);
        moveRotation = convertEulerToVec3Degrees(control.object.rotation);
      }
    });
    control.addEventListener("mouseUp", (e) => {
      if (e.mode === "translate") {
        const pos = convertTVector3ToVec3(control.object.position);
        editorEventBus.emit(EDITOR_EVENT.ChangePosition, [oldPos, pos]);
      }
      if (e.mode === "scale") {
        const scale = convertTVector3ToVec3(control.object.scale);
        editorEventBus.emit(EDITOR_EVENT.ChangeScale, [oldScale, scale]);
      }
      if (e.mode === "rotate") {
        const rotation = convertEulerToVec3Degrees(control.object.rotation);
        editorEventBus.emit(EDITOR_EVENT.ChangeRotation, [oldRotation, rotation]);
      }
    });

    control.addEventListener("dragging-changed", function(event) {
      controls.enabled = !event.value;
    });

    return control;
  }

}

