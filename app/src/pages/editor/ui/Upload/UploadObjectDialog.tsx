import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import UploadObject3DForm from "./UploadObject3DForm";
import { Button } from "@/components/ui/button";
import { EDITOR_EVENT, editorEventBus } from "../../utils/EditorEvents";
import type { UploadableObjectData } from "../../utils/Types";
import { useTranslation } from "react-i18next";

export default function UploadObjectDialog() {
    const { t } = useTranslation();
    const [showExport, setShowExport] = useState(false);
    const [uploadableData, setUploadableData] = useState<UploadableObjectData>({ imgData: "", objectData: "", objectName: "" });

    useEffect(() => {

        const handleUploadObject = (data: UploadableObjectData) => {
            setUploadableData(data);
        };

        editorEventBus.on(EDITOR_EVENT.UploadObjectToServer, handleUploadObject);

        return () => {
            editorEventBus.off(EDITOR_EVENT.UploadObjectToServer, handleUploadObject);
        };

    }, []);


    return (<>
        <Dialog open={showExport} onOpenChange={setShowExport}>

            <DialogTrigger asChild onClick={() => { setShowExport(true); }}>
                <Button id="uploadObjectDialog" onClick={() => { editorEventBus.emit(EDITOR_EVENT.PrepareObjectDataForUpload); }}
                    className="hidden w-full" />
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-center">
                        <span> {t("WantToUploadMSG")} </span>
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {t("NameTheObjectAndUpload")}
                    </DialogDescription>

                    <div className="flex justify-center text-center">
                        <img src={uploadableData.imgData} className=" w-2/3 border border-card-foreground" />
                    </div>
                    <UploadObject3DForm sendData={uploadableData} />

                </DialogHeader>
            </DialogContent>

        </Dialog>
    </>);
}
