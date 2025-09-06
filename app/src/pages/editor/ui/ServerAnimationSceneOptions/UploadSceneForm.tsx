import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, type ChangeEvent } from "react";
import type { UploadableAnimationSceneData } from "../../utils/Types";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { DataURLToBlob } from "@/lib/DataUrlToBlob";
import type { SuccessfullResponse } from "@/lib/types/ServerResponseTypes";
import { useTranslation } from "react-i18next";

type Props = {
    sendData: UploadableAnimationSceneData;
};

const UPLOAD_SCENE_URL = "/api/v1/animationScene/upload";

export default function UploadSceneForm({ sendData }: Props) {
    const { t } = useTranslation();
    const [name, setName] = useState(sendData.sceneName);
    const [isPublic, setIsPublic] = useState(false);
    const { makeRequest, error, response } = useAuthFetch<SuccessfullResponse>(UPLOAD_SCENE_URL);

    const changeIsPublic = (val: boolean) => {
        setIsPublic(val);
    };

    const sendRequest = () => {
        const formData = new FormData();
        const objectBlob = new Blob([sendData.sceneData], { type: "application/json" });

        formData.append("image", DataURLToBlob(sendData.imgData));
        formData.append("scene", objectBlob);
        formData.append("sceneData", JSON.stringify({ name: name, is_public: isPublic, duration: sendData.duration }));

        makeRequest("", "POST", formData);
    };

    return (<>

        <div className="justify-center w-full flex m-2">
            <img />
        </div>
        <div className="p-2 grid columns-1 gap-2">

            <span className="flex items-center font-bold space-x-10 gap-2">
                <label htmlFor="publicCheckBox">{t("Public")}</label>
                <Checkbox id="publicCheckBox" checked={isPublic} onCheckedChange={(val: boolean) => { changeIsPublic(val); }} />
            </span>

            <Input placeholder={t("Name")} className=""
                onChange={(val: ChangeEvent<HTMLInputElement>) => { setName(val.target.value); }} value={name} />


            <Button onClick={() => { sendRequest(); }} > {t("UploadToServer").toUpperCase()}</Button>
            {/* <Button onClick={() => { console.log("TODO"); }} > OVERRIDE EXISTING OBJECT</Button> */}

            {error ?
                <span className="text-center text-fail-primary">{error}</span>
                : null
            }
            {response ?
                <span className="text-center text-success-primary">{response.message}</span>
                : null
            }

        </div >

    </>);
}

