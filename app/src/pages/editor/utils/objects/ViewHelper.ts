import { texture, uv, vec2 } from "three/tsl";
import * as THREE from "three/webgpu";

type optionsType = {
  font: string,
  color: string,
  radius: number,
  labelX: string,
  labelY: string,
  labelZ: string,
}

const AXIS_HELPERS = {
  "posX": 0,
  "posY": 1,
  "posZ": 2,
  "negX": 3,
  "negY": 4,
  "negZ": 5,

} as const;

export class ViewHelper extends THREE.Object3D {

  private viewSize = 128;

  private center: THREE.Vector3;
  private orthoCamera: THREE.Camera;
  private camera: THREE.Camera;
  private domElement: HTMLElement;
  private options: optionsType;
  private interactiveObjects: Array<THREE.Sprite>;
  private xAxis: THREE.Mesh | null;
  private yAxis: THREE.Mesh | null;
  private zAxis: THREE.Mesh | null;
  private colors: Array<THREE.Color>;
  private scene: THREE.Scene;
  private geometry: THREE.CylinderGeometry | null;
  private mouse: THREE.Vector2;
  private raycaster: THREE.Raycaster;
  private point: THREE.Vector3;

  private renderTarget: THREE.RenderTarget | null;

  private targetPosition: THREE.Vector3;
  private targetQuaternion: THREE.Quaternion;

  private q1: THREE.Quaternion;
  private q2: THREE.Quaternion;
  private radius: number;
  private dummy: THREE.Object3D;

  constructor(camera: THREE.Camera, domElement: HTMLElement) {
    super();
    this.center = new THREE.Vector3();
    this.camera = camera;
    this.domElement = domElement;
    this.scene = new THREE.Scene();

    this.interactiveObjects = [];
    this.colors = [];
    this.geometry = null;

    this.xAxis = null;
    this.yAxis = null;
    this.zAxis = null;

    this.point = new THREE.Vector3();

    this.options = {
      font: "24px Arial", color: "#ffffff", radius: 16,
      labelX: "X", labelY: "Y", labelZ: "Z"
    };

    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();

    this.orthoCamera = new THREE.OrthographicCamera(- 2, 2, 2, - 2, 0, 4);
    this.orthoCamera.position.set(0, 0, 2);

    this.renderTarget = null;

    this.targetPosition = new THREE.Vector3();
    this.targetQuaternion = new THREE.Quaternion();

    this.q1 = new THREE.Quaternion();
    this.q2 = new THREE.Quaternion();
    this.radius = 0;

    this.dummy = new THREE.Object3D();

    this.init();
    this.initRenderTarget();
  }

  init() {

    const color1 = new THREE.Color("#ff4466");
    const color2 = new THREE.Color("#7bb022");
    const color3 = new THREE.Color("#4488ff");
    const color4 = new THREE.Color("#ababab");

    this.colors.push(color1, color2, color3, color4);

    this.geometry = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 5).rotateZ(- Math.PI / 2).translate(0.4, 0, 0);

    this.xAxis = new THREE.Mesh(this.geometry, this.getAxisMaterial(color1));
    this.yAxis = new THREE.Mesh(this.geometry, this.getAxisMaterial(color2));
    this.zAxis = new THREE.Mesh(this.geometry, this.getAxisMaterial(color3));

    this.yAxis.rotation.z = Math.PI / 2;
    this.zAxis.rotation.y = - Math.PI / 2;

    this.add(this.xAxis);
    this.add(this.zAxis);
    this.add(this.yAxis);

    const spriteMaterial1 = this.getSpriteMaterial(color1, "X");
    const spriteMaterial2 = this.getSpriteMaterial(color2, "Y");
    const spriteMaterial3 = this.getSpriteMaterial(color3, "Z");
    const spriteMaterial4 = this.getSpriteMaterial(color4);

    const posXAxisHelper = new THREE.Sprite(spriteMaterial1);
    const posYAxisHelper = new THREE.Sprite(spriteMaterial2);
    const posZAxisHelper = new THREE.Sprite(spriteMaterial3);
    const negXAxisHelper = new THREE.Sprite(spriteMaterial4);
    const negYAxisHelper = new THREE.Sprite(spriteMaterial4);
    const negZAxisHelper = new THREE.Sprite(spriteMaterial4);

    posXAxisHelper.position.x = 1;
    posYAxisHelper.position.y = 1;
    posZAxisHelper.position.z = 1;
    negXAxisHelper.position.x = - 1;
    negYAxisHelper.position.y = - 1;
    negZAxisHelper.position.z = - 1;

    negXAxisHelper.material.opacity = 0.2;
    negYAxisHelper.material.opacity = 0.2;
    negZAxisHelper.material.opacity = 0.2;

    posXAxisHelper.userData.type = "posX";
    posYAxisHelper.userData.type = "posY";
    posZAxisHelper.userData.type = "posZ";
    negXAxisHelper.userData.type = "negX";
    negYAxisHelper.userData.type = "negY";
    negZAxisHelper.userData.type = "negZ";

    this.add(posXAxisHelper);
    this.add(posYAxisHelper);
    this.add(posZAxisHelper);
    this.add(negXAxisHelper);
    this.add(negYAxisHelper);
    this.add(negZAxisHelper);

    this.interactiveObjects.push(posXAxisHelper);
    this.interactiveObjects.push(posYAxisHelper);
    this.interactiveObjects.push(posZAxisHelper);
    this.interactiveObjects.push(negXAxisHelper);
    this.interactiveObjects.push(negYAxisHelper);
    this.interactiveObjects.push(negZAxisHelper);

    this.scene.add(this);

  }

  render(renderer: THREE.Renderer) {

    this.quaternion.copy(this.camera.quaternion).invert();
    this.updateMatrixWorld();

    this.point.set(0, 0, 1);
    this.point.applyQuaternion(this.camera.quaternion);

    renderer.setRenderTarget(this.renderTarget);
    renderer.clearAsync();

    renderer.renderAsync(this.scene, this.orthoCamera);
    renderer.setRenderTarget(null);

  };

  private calculateDimension() {
    const rect = this.domElement.getBoundingClientRect();
    const offsetX = rect.left + this.domElement.offsetWidth;
    const offsetY = rect.top + this.domElement.offsetHeight;

    const x = offsetX / (offsetX + this.viewSize);
    const y = offsetY / (offsetY + this.viewSize);

    const width = (offsetX + this.viewSize);
    const height = (offsetY + this.viewSize);

    return { x: x, y: y, width: width, height: height };

  }

  private initRenderTarget() {
    const dimension = this.calculateDimension();
    const x = dimension.width;
    const y = dimension.height;
    this.renderTarget = new THREE.RenderTarget(x, y);
  }

  getTexture() {
    if (this.renderTarget === null) return texture(undefined, 1);

    const dimension = this.calculateDimension();
    const scale = uv()
      .sub(vec2(dimension.x, dimension.y))
      .mul(vec2((dimension.width / this.viewSize), (dimension.height / this.viewSize))).toVar();

    return texture(this.renderTarget.texture, scale);
  }

  handleClick(event: Event) {
    if (!(event instanceof MouseEvent)) {
      return;
    }

    if (this.center === undefined) {
      this.center = new THREE.Vector3();
    }

    const rect = this.domElement.getBoundingClientRect();
    const offsetX = rect.left + (this.domElement.offsetWidth - this.viewSize);
    const offsetY = rect.top + (this.domElement.offsetHeight - this.viewSize);
    this.mouse.x = ((event.clientX - offsetX) / (rect.right - offsetX)) * 2 - 1;
    this.mouse.y = - ((event.clientY - offsetY) / (rect.bottom - offsetY)) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.orthoCamera);

    const intersects = this.raycaster.intersectObjects(this.interactiveObjects);

    if (intersects.length > 0) {

      const intersection = intersects[0];
      const object = intersection.object;
      if (object instanceof THREE.Sprite)
        this.changeView(object, this.center);

      return true;

    } else {
      return false;
    }

  };

  dispose() {

    this.geometry?.dispose();

    if (this.xAxis && "dispose" in this.xAxis.material)
      this.xAxis.material.dispose();
    if (this.yAxis && "dispose" in this.yAxis.material)
      this.yAxis.material.dispose();
    if (this.zAxis && "dispose" in this.zAxis.material)
      this.zAxis.material.dispose();


    this.interactiveObjects.forEach((obj) => {
      obj.material.map?.dispose();
      obj.material.dispose();
    });

    this.renderTarget?.dispose();

  };

  changeView(object: THREE.Sprite, focusPoint: THREE.Vector3) {

    switch (object.userData.type) {

      case "posX":
        this.targetPosition.set(1, 0, 0);
        this.targetQuaternion.setFromEuler(new THREE.Euler(0, Math.PI * 0.5, 0));
        break;

      case "posY":
        this.targetPosition.set(0, 1, 0);
        this.targetQuaternion.setFromEuler(new THREE.Euler(- Math.PI * 0.5, 0, 0));
        break;

      case "posZ":
        this.targetPosition.set(0, 0, 1);
        this.targetQuaternion.setFromEuler(new THREE.Euler());
        break;

      case "negX":
        this.targetPosition.set(-1, 0, 0);
        this.targetQuaternion.setFromEuler(new THREE.Euler(0, - Math.PI * 0.5, 0));
        break;

      case "negY":
        this.targetPosition.set(0, -1, 0);
        this.targetQuaternion.setFromEuler(new THREE.Euler(Math.PI * 0.5, 0, 0));
        break;

      case "negZ":
        this.targetPosition.set(0, 0, -1);
        this.targetQuaternion.setFromEuler(new THREE.Euler(0, Math.PI, 0));
        break;

      default:
        console.error("ViewHelper: Invalid axis.");

    }


    this.radius = this.camera.position.distanceTo(focusPoint);
    this.targetPosition.multiplyScalar(this.radius).add(focusPoint);
    this.dummy.position.copy(focusPoint);
    this.dummy.lookAt(this.camera.position);
    this.q1.copy(this.dummy.quaternion);
    this.dummy.lookAt(this.targetPosition);
    this.q2.copy(this.dummy.quaternion);


    const radian = Math.PI;
    this.q1.rotateTowards(this.q2, radian);
    this.camera.position.set(0, 0, 1).applyQuaternion(this.q1).multiplyScalar(this.radius).add(this.center);
    this.camera.quaternion.rotateTowards(this.targetQuaternion, radian);

  }

  setLabelStyle(font: string, color: string, radius: number) {
    this.options.font = font;
    this.options.color = color;
    this.options.radius = radius;
  }

  updateLabels() {

    this.interactiveObjects[AXIS_HELPERS.posX].material.map?.dispose();
    this.interactiveObjects[AXIS_HELPERS.posY].material.map?.dispose();
    this.interactiveObjects[AXIS_HELPERS.posZ].material.map?.dispose();

    this.interactiveObjects[AXIS_HELPERS.posX].material.dispose();
    this.interactiveObjects[AXIS_HELPERS.posY].material.dispose();
    this.interactiveObjects[AXIS_HELPERS.posZ].material.dispose();

    this.interactiveObjects[AXIS_HELPERS.posX].material = this.getSpriteMaterial(this.colors[0], this.options.labelX);
    this.interactiveObjects[AXIS_HELPERS.posY].material = this.getSpriteMaterial(this.colors[1], this.options.labelY);
    this.interactiveObjects[AXIS_HELPERS.posZ].material = this.getSpriteMaterial(this.colors[2], this.options.labelZ);

  }

  private getSpriteMaterial(color: THREE.Color, text?: string): THREE.SpriteMaterial {

    const { font = "24px Consolas", color: labelColor = "#ababab", radius = 16 } = this.options;

    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;

    const context = canvas.getContext("2d");

    if (!context) {
      const texture = new THREE.CanvasTexture(canvas);
      return new THREE.SpriteMaterial({ map: texture, toneMapped: false });
    }

    context.beginPath();
    context.arc(32, 32, radius, 0, 2 * Math.PI);
    context.closePath();
    context.fillStyle = color.getStyle();
    context.fill();

    if (text) {

      context.font = font;
      context.textAlign = "center";
      context.fillStyle = labelColor;
      context.fillText(text, 32, 41);

    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    return new THREE.SpriteMaterial({ map: texture, toneMapped: false });
  }

  private getAxisMaterial(color: THREE.Color) {

    return new THREE.MeshBasicMaterial({ color: color, toneMapped: false });

  }

}

