import * as THREE from "three/webgpu";
import { BACKGROUND_LAYER, DEFAULT_SCENE_COLOR, EDITOR_LAYER, RENDER_LAYER } from "./Global";
import { ViewHelper } from "./objects/ViewHelper";
import { mix, pass, step, uniform } from "three/tsl";
import OutlineNode, { outline } from "three/examples/jsm/tsl/display/OutlineNode.js";
import { AddListener } from "./AddListener";
import { OrbitControls, TransformControls } from "three/examples/jsm/Addons.js";
import { type Vec3 } from "./Types";
import { compareVec3, convertEulerToVec3Degrees, convertTVector3ToVec3 } from "./utils";
import { EDITOR_EVENT, editorEventBus } from "./EditorEvents";

export class RendererController {
  private renderer: THREE.WebGPURenderer;
  private editorCamera: THREE.PerspectiveCamera;
  private renderCamera: THREE.Camera;
  private cameraBox: THREE.Object3D;
  private scene: THREE.Scene;
  private renderRequested: boolean;
  private isRenderingView: boolean;

  private orbitControls: OrbitControls;
  private control: TransformControls;

  private postProcessing: THREE.PostProcessing;
  private viewHelper: ViewHelper;

  private outlinePass: THREE.TSL.ShaderNodeObject<OutlineNode>;
  private outlineColor;


  constructor() {

    this.renderer = new THREE.WebGPURenderer({ antialias: true });

    this.scene = this.initScene();
    this.editorCamera = this.createEditorCamera();
    this.renderCamera = this.createRenderCamera();
    this.cameraBox = this.createCameraBox();

    this.viewHelper = new ViewHelper(this.editorCamera, this.renderer.domElement);
    AddListener(window, "click", (event: Event) => {
      this.viewHelper.handleClick(event);
    });

    this.outlinePass = this.createOutlinePass();
    this.outlineColor = this.createOutlineColor();
    this.postProcessing = this.createPostProcessing();
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
    this.recalculatePostProcessing();
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

  recalculatePostProcessing() {
    const gizmoNode = this.viewHelper.getTexture();
    this.postProcessing.outputNode = mix(this.outlineColor, gizmoNode, step(0.000001, gizmoNode));
  }

  outlineObject(object: THREE.Object3D) {
    this.outlinePass.selectedObjects.push(object);
  }

  clearOutlines() {
    this.outlinePass.selectedObjects = [];
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
    this.viewHelper.dispose();
    this.renderer.dispose();
  }

  getRenderInfo() {
    return this.renderer.info.memory;
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

        this.viewHelper.render(this.renderer);

        this.postProcessing.render();

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

    //TODO temporary light, make adding light in the editor
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.AmbientLight(color, intensity);
    light.layers.enable(BACKGROUND_LAYER);
    scene.add(light);

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
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
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

  private createPostProcessing() {
    const postProcessing = new THREE.PostProcessing(this.renderer);
    const gizmoNode = this.viewHelper.getTexture();

    postProcessing.outputNode = mix(this.outlineColor, gizmoNode, step(0.000001, gizmoNode));

    AddListener(window, "click", (event: Event) => {
      this.viewHelper.handleClick(event);
    });

    return postProcessing;
  }

  private createOutlinePass() {
    const edgeGlow = uniform(0);
    const edgeThickness = uniform(2.0);
    const outlinePass = outline(this.scene, this.editorCamera, {
      edgeGlow,
      edgeThickness
    });

    outlinePass.selectedObjects = [];

    return outlinePass;
  }

  private createOutlineColor() {
    const edgeStrength = uniform(4.0);
    const visibleEdgeColor = uniform(new THREE.Color(0xffffff));
    const hiddenEdgeColor = uniform(new THREE.Color(0x4e3636));

    const { visibleEdge, hiddenEdge } = this.outlinePass;

    const outlineColor = visibleEdge.mul(visibleEdgeColor).add(hiddenEdge.mul(hiddenEdgeColor)).mul(edgeStrength);

    const scenePass = pass(this.scene, this.editorCamera);

    return outlineColor.add(scenePass);
  }

}

