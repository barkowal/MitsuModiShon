import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EDITOR_EVENT, editorEventBus } from "../../utils/EditorEvents";
import type { UploadableAnimationSceneData } from "../../utils/Types";
import UploadSceneForm from "./UploadSceneForm";
import { useTranslation } from "react-i18next";

export default function UploadSceneDialog() {
    const { t } = useTranslation();
    const [showExport, setShowExport] = useState(false);
    const [uploadableData, setUploadableData] = useState<UploadableAnimationSceneData>(
        { imgData: "", sceneName: "", sceneData: "", duration: 250 });

    useEffect(() => {

        const handleUploadScene = (data: UploadableAnimationSceneData) => {
            setUploadableData(data);
        };

        editorEventBus.on(EDITOR_EVENT.UploadAnimationSceneToServer, handleUploadScene);

        return () => {
            editorEventBus.off(EDITOR_EVENT.UploadAnimationSceneToServer, handleUploadScene);
        };

    }, []);


    return (<>
        <Dialog open={showExport} onOpenChange={setShowExport}>

            <DialogTrigger asChild onClick={() => { setShowExport(true); }}>
                <Button id="uploadAnimationSceneDialog" onClick={() => { editorEventBus.emit(EDITOR_EVENT.PrepareSceneDataForUpload); }}
                    className="hidden w-full" />
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-center">
                        <span> {t("WantToUploadSceneMSG")} </span>
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {t("NameTheSceneAndUpload")}
                    </DialogDescription>

                    <div className="flex justify-center text-center">
                        <img src={uploadableData.imgData} className=" w-2/3 border border-card-foreground" />
                    </div>
                    <UploadSceneForm sendData={uploadableData} />

                </DialogHeader>
            </DialogContent>

        </Dialog>
    </>);
}
