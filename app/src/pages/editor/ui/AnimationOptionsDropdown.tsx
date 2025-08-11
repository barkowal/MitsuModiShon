import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Download, ImageDown, Menu, Upload, Camera, Save } from "lucide-react";
import { EDITOR_EVENT, editorEventBus } from "../utils/EditorEvents";
import { Input } from "@/components/ui/input";
import { useRef, useState, type ChangeEvent } from "react";
import { RenderAnimationDialog } from "./RenderAnimationDialog";
import { SceneLoadDialog } from "./SceneLoadDialog";

export function AnimationOptionsDropdown() {
    const [sendObject, setSendObject] = useState(true);
    const inputRef = useRef<null | HTMLInputElement>(null);

    const signalDownload = () => {
        editorEventBus.emit(EDITOR_EVENT.SaveAnimationObject);
    };

    const signalSaveScene = () => {
        editorEventBus.emit(EDITOR_EVENT.SaveAnimationScene);
    };

    const signalRenderImage = () => {
        editorEventBus.emit(EDITOR_EVENT.RenderImage);
    };

    const triggerInputClick = () => {
        if (inputRef.current !== null)
            inputRef.current.click();
    };

    const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files === null) return;
        if (event.target.files.length <= 0) return;

        const file = event.target.files[0];
        if (file === null) return;

        let fileExtension = file.name.split(".").pop();
        if (!fileExtension) return;
        fileExtension = fileExtension.toLowerCase();

        if (!["json"].includes(fileExtension)) {
            editorEventBus.emit(EDITOR_EVENT.SendWarningLog, "Invalid file type. Please upload a JSON file.");
            return;
        }

        sendFile(file);
    };

    const sendFile = (file: File) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            if (e.target === null) return;

            const fileData = e.target.result;

            if (typeof fileData === "string")
                if (sendObject)
                    editorEventBus.emit(EDITOR_EVENT.UploadAnimationObject, fileData);
                else
                    editorEventBus.emit(EDITOR_EVENT.LoadAnimationScene, fileData);

        };

        reader.readAsText(file);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild >
                <Button className="[&_svg]:size-6" >
                    <Menu /> Options
                </Button>
            </DropdownMenuTrigger>
            < DropdownMenuContent >
                <DropdownMenuLabel>Options</DropdownMenuLabel>
                < DropdownMenuSeparator />

                <DropdownMenuItem onClick={signalDownload}>
                    <Download /><p>Export Object</p >
                </DropdownMenuItem>

                <DropdownMenuItem onClick={signalSaveScene}>
                    <Save /><p>Save Scene</p >
                </DropdownMenuItem>

                < DropdownMenuItem className="p-0" onClick={() => { setSendObject(true); }} >
                    <label htmlFor="fileUpload" className="[&_svg]:size-6 p-2 w-full flex gap-2" >
                        <Upload /><p>Upload Animation</p >
                    </label>
                </DropdownMenuItem>


                < DropdownMenuItem className="p-0"  >
                    <label htmlFor="sceneLoadDialog" className="[&_svg]:size-6 p-2 w-full flex gap-2" >
                        <Upload /><p>Load Scene</p >
                    </label>
                </DropdownMenuItem>

                < DropdownMenuItem onClick={signalRenderImage} >
                    <ImageDown /><p>Render Image</p >
                </DropdownMenuItem>

                < DropdownMenuItem className="p-0" >
                    <label htmlFor="renderDialog" className="[&_svg]:size-6 p-2 w-full flex gap-2 " >
                        <Camera /><p>Render Animation</p>
                    </label>
                </DropdownMenuItem>

            </DropdownMenuContent>

            < Input ref={inputRef} id="fileUpload" type="file" accept=".json" onChange={handleFileUpload} onClick={(e) => (e.currentTarget.value = "")
            } className="hidden" />
            <RenderAnimationDialog />
            <SceneLoadDialog onConfirm={() => { setSendObject(false); triggerInputClick(); }} />

        </DropdownMenu>);

}

