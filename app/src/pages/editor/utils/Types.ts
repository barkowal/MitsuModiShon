export type TreeItem = {
    id: number,
    name: string,
    children?: Array<TreeItem>
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

export type ListenerHandler = {
    node: Node | Window,
    event: string,
    handler: EventListenerOrEventListenerObject,
    capture: boolean
}

