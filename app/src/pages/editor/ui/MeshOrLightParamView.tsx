import { useEffect, useState } from "react";
import { LightView } from "./LightView";
import { MaterialView } from "./MaterialMenu/MaterialView";
import { EDITOR_EVENT, editorEventBus } from "../utils/EditorEvents";

export function MeshOrLightParamView() {
    const [showMaterial, setShowMaterial] = useState(true);

    useEffect(() => {

        const handleShowMaterial = (isMaterialSelected: boolean) => {
            setShowMaterial(isMaterialSelected);
        };

        editorEventBus.on(EDITOR_EVENT.ShowMaterialView, handleShowMaterial);

        return (() => {
            editorEventBus.off(EDITOR_EVENT.ShowMaterialView, handleShowMaterial);
        });

    }, []);

    return (<>
        <div style={{ display: showMaterial ? "block" : "none" }}>
            <MaterialView />
        </div>
        <div style={{ display: showMaterial ? "none" : "block" }}>
            <LightView />
        </div>
    </>);

}
