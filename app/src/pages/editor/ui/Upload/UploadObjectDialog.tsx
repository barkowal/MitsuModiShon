import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import UploadObject3DForm from "./UploadObject3DForm";
import { Button } from "@/components/ui/button";
import { EDITOR_EVENT, editorEventBus } from "../../utils/EditorEvents";
import type { UploadableObjectData } from "../../utils/Types";

export default function UploadObjectDialog() {
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
                        <span> Do you want to upload the object?</span>
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        Name the object and upload it.
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
