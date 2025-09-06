import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import type { SuccessfullResponse } from "@/lib/types/ServerResponseTypes";
import { useState, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";

type Props = {
  objectsID: number,
  publicVisibility: boolean,
  objectsName: string,
  patchUrl: string,
}

export function UpdateObjectForm({ objectsID, publicVisibility, objectsName, patchUrl }: Props) {
  const { t } = useTranslation();
  const { response, error, makeRequest } = useAuthFetch<SuccessfullResponse>(patchUrl);
  const [isPublic, setIsPublic] = useState(publicVisibility);
  const [name, setName] = useState(objectsName);

  const changeIsPublic = (val: boolean) => {
    setIsPublic(val);
  };

  const sendRequest = () => {

    const requestBody = {
      name: name,
      isPublic: isPublic,
    };

    makeRequest(`/${objectsID}`, "PATCH", JSON.stringify(requestBody), { "content-type": "application/json" });

  };

  return (<>

    <div className="p-2 grid columns-1 gap-2">

      <span className="flex items-center font-bold space-x-10 gap-2">
        <label htmlFor="publicCheckBox">{t("Public")}</label>
        <Checkbox id="publicCheckBox" checked={isPublic} onCheckedChange={(val: boolean) => { changeIsPublic(val); }} />
      </span>

      <Input placeholder={t("Name")} className=""
        onChange={(val: ChangeEvent<HTMLInputElement>) => { setName(val.target.value); }} value={name} />


      <Button onClick={() => { sendRequest(); }} > {t("UpdateObject")} </Button>

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
