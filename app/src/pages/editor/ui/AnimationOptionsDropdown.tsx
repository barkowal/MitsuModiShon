import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Download, ImageDown, Menu, Upload, Camera, Save, CloudDownload } from "lucide-react";
import { EDITOR_EVENT, editorEventBus } from "../utils/EditorEvents";
import { Input } from "@/components/ui/input";
import { useRef, useState, type ChangeEvent } from "react";
import { RenderAnimationDialog } from "./RenderAnimationDialog";
import { SceneLoadDialog } from "./SceneLoadDialog";
import { ServerDownloadDialog } from "./ServerObjectDownload/ServerDownloadDialog";
import { useAuth } from "@/hooks/auth/useAuth";
import UploadObjectDialog from "./Upload/UploadObjectDialog";
import { SceneDownloadDialog } from "./ServerAnimationSceneOptions/SceneDownloadDialog";
import UploadSceneDialog from "./ServerAnimationSceneOptions/UploadSceneDialog";
import { useTranslation } from "react-i18next";

export function AnimationOptionsDropdown() {
    const { t } = useTranslation();
    const auth = useAuth();
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
            editorEventBus.emit(EDITOR_EVENT.SendWarningLog, "WarningLogInvalidFileType");
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
                <Button variant="outline" className="[&_svg]:size-6" >
                    <Menu /> {t("Options")}
                </Button>
            </DropdownMenuTrigger>
            < DropdownMenuContent >
                <DropdownMenuLabel>{t("Options")}</DropdownMenuLabel>
                < DropdownMenuSeparator />

                <DropdownMenuItem onClick={signalDownload}>
                    <Download /><p>{t("Download")}</p >
                </DropdownMenuItem>

                <DropdownMenuItem onClick={signalSaveScene}>
                    <Save /><p>{t("SaveScene")}</p >
                </DropdownMenuItem>

                < DropdownMenuItem className="p-0" onClick={() => { setSendObject(true); }} >
                    <label htmlFor="fileUpload" className="[&_svg]:size-6 p-2 w-full flex gap-2" >
                        <Upload /><p>{t("Import")}</p >
                    </label>
                </DropdownMenuItem>


                < DropdownMenuItem className="p-0"  >
                    <label htmlFor="sceneLoadDialog" className="[&_svg]:size-6 p-2 w-full flex gap-2" >
                        <Upload /><p>{t("LoadScene")}</p >
                    </label>
                </DropdownMenuItem>

                < DropdownMenuItem onClick={signalRenderImage} >
                    <ImageDown /><p>{t("RenderImage")}</p >
                </DropdownMenuItem>

                < DropdownMenuItem className="p-0" >
                    <label htmlFor="renderDialog" className="[&_svg]:size-6 p-2 w-full flex gap-2 " >
                        <Camera /><p>{t("RenderAnimation")}</p>
                    </label>
                </DropdownMenuItem>

                {
                    auth?.userName ?
                        <>
                            <DropdownMenuItem>
                                <label htmlFor="uploadObjectDialog" className="[&_svg]:size-6 w-full flex gap-2">
                                    <Upload /><p>{t("UploadToServer")}</p>
                                </label>
                            </DropdownMenuItem>

                            <DropdownMenuItem>
                                <label htmlFor="uploadAnimationSceneDialog" className="[&_svg]:size-6 w-full flex gap-2">
                                    <Upload /><p>{t("UploadSceneToServer")}</p>
                                </label>
                            </DropdownMenuItem>
                        </>
                        : null
                }

                <DropdownMenuItem>
                    <label htmlFor="ServerDownloadObjectDialog" className="[&_svg]:size-6 w-full flex gap-2">
                        <CloudDownload /><p>{t("AddFromServer")}</p>
                    </label>
                </DropdownMenuItem>

                <DropdownMenuItem>
                    <label htmlFor="ServerDownloadSceneDialog" className="[&_svg]:size-6 w-full flex gap-2">
                        <CloudDownload /><p>{t("LoadSceneFromServer")}</p>
                    </label>
                </DropdownMenuItem>

            </DropdownMenuContent>

            < Input ref={inputRef} id="fileUpload" type="file" accept=".json" onChange={handleFileUpload} onClick={(e) => (e.currentTarget.value = "")
            } className="hidden" />
            <RenderAnimationDialog />
            <SceneLoadDialog onConfirm={() => { setSendObject(false); triggerInputClick(); }} />

            {
                auth?.userName ?
                    <>
                        <UploadObjectDialog />
                        <UploadSceneDialog />
                    </> : null
            }

            <ServerDownloadDialog showPublic={auth?.userName ? true : false} addAnimation={true} />
            <SceneDownloadDialog showPublic={auth?.userName ? true : false} />

        </DropdownMenu>);

}

