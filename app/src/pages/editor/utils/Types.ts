import type { Quaternion, Vector3 } from "three/webgpu";
import type { EditorEvent } from "./EditorEvents";

export type TreeItem = {
    id: number,
    name: string,
    children?: Array<TreeItem>
}

export type MaterialItem = {
    id: number,
    type: string,
    color: string,
}

export type Point2d = {
    x: number,
    y: number,
}

export type Vec3 = {
    x: number,
    y: number,
    z: number,
}

export const TRANSFORMATION_ARR = {
    Position: 0,
    Scale: 1,
    Rotation: 2,
} as const;

export const TRANSFORM_CHANGE = {
    Old: 0,
    New: 1,
} as const;

export const EDITOR_MODE = {
    ObjectMode: "Object Mode",
    EditMode: "Edit Mode",
    PaintMode: "Paint Mode",
} as const;

export const ORBITCONTROLS_MODE = {
    DEFAULT: 0,
    DISABLED: 1,
    SELECTION: 2,
} as const;

export const EDITING_MODE = {
    Faces: 0,
    Edges: 1,
    Vertices: 2,
} as const;

export const PAINTING_MODE = {
    VertexColor: 0,
    DrawLine: 1,
    DrawOutline: 2,
} as const;

export const PAINTING_SETTINGS = {
    HexColor: 0,
    LineWidth: 1,
    LineOffset: 2,
    ClearLine: 3,
} as const;

export type ListenerHandler = {
    node: Node | Window,
    event: string,
    handler: EventListenerOrEventListenerObject,
    capture: boolean
}

export type EventHandlerType = {
    event: EditorEvent,
    callback: CallableFunction
}

export type RendererMemoryInfo = {
    geometries: number,
    textures: number
}

export const SCENE_INFO = {
    Objects: 0,
    Triangles: 1,
    Vertices: 2,
    RendererGeometries: 3,
    RendererTextures: 4,
} as const;

export const MATERIAL_TYPES = {
    Basic: "MeshBasicMaterial",
    Standard: "MeshStandardMaterial",
    Toon: "MeshToonMaterial",
    Drawing: "MeshBasicNodeMaterial",
} as const;

export const ANIMATION_PROPERTY = {
    Position: 0,
    Scale: 1,
    Rotation: 2,
} as const;

export const INTERPOLATION = {
    0: "Linear",
} as const;

export type KeyframeSequence = {
    keyframes: Array<number>,
    values: Array<Vector3 | Quaternion>,
    interpolations: Array<number>,
}

export type AnimationObjectData = {
    enabled: boolean,
    loop: boolean,
    animationKeyframes: Array<KeyframeSequence>,
}

export const SetKeyframeArrayData = {
    Property: 0,
    Data: 1,
};

