import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, type ChangeEvent } from "react";
import type { UploadableObjectData } from "../../utils/Types";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { DataURLToBlob } from "@/lib/DataUrlToBlob";
import type { SuccessfullResponse } from "@/lib/types/ServerResponseTypes";

type Props = {
    sendData: UploadableObjectData;
};

export default function UploadObject3DForm({ sendData }: Props) {
    const [name, setName] = useState(sendData.objectName);
    const [isPublic, setIsPublic] = useState(false);
    const { makeRequest, error, response } = useAuthFetch<SuccessfullResponse>("/api/v1/objects3D/upload");

    const changeIsPublic = (val: boolean) => {
        setIsPublic(val);
    };

    const sendRequest = () => {
        const formData = new FormData();
        const objectBlob = new Blob([sendData.objectData], { type: "application/json" });

        formData.append("image", DataURLToBlob(sendData.imgData));
        formData.append("object3D", objectBlob);
        formData.append("objectData", JSON.stringify({ name: name, is_public: isPublic, is_animated: sendData.animationObject }));

        makeRequest("", "POST", formData);
    };

    return (<>

        <div className="justify-center w-full flex m-2">
            <img />
        </div>
        <div className="p-2 grid columns-1 gap-2">

            <span className="flex items-center font-bold space-x-10 gap-2">
                <label htmlFor="publicCheckBox">Public</label>
                <Checkbox id="publicCheckBox" checked={isPublic} onCheckedChange={(val: boolean) => { changeIsPublic(val); }} />
            </span>

            <Input placeholder={"Name"} className=""
                onChange={(val: ChangeEvent<HTMLInputElement>) => { setName(val.target.value); }} value={name} />


            <Button onClick={() => { sendRequest(); }} > CREATE NEW </Button>
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

