import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { DownloadJSON } from "@/lib/DownloadJSON";
import type { AnimationSceneData, MitsuShortObjectData, SuccessfullResponse } from "@/lib/types/ServerResponseTypes";
import { useEffect, useState } from "react";
import { UpdateObjectForm } from "./UpdateObjectForm";

type Props = {
  data: MitsuShortObjectData | AnimationSceneData,
  showDialog: boolean,
  setShowDialog: CallableFunction,
  dialogDescriptionTexts: Array<string>,
  downloadUrl: string,
  deleteUrl: string,
  patchUrl: string,
}

export function UserListDialog({ data, showDialog, setShowDialog, dialogDescriptionTexts, downloadUrl, deleteUrl, patchUrl }: Props) {
  const { response: downloadResponse, error: downloadError, makeRequest: makeDownloadRequest } = useAuthFetch(downloadUrl);
  const { response: deleteResponse, error: deleteError, makeRequest: makeDeleteRequest } = useAuthFetch<SuccessfullResponse>(deleteUrl);
  const imgUrl = "/api/v1/image" + data.imgPath;
  const [showUpdating, setShowUpdating] = useState(false);

  const handleDelete = () => {
    makeDeleteRequest(`/${data.id}`, "DELETE");
  };

  const handleUpdate = () => {
    setShowUpdating(prev => !prev);
  };

  const handleDownload = () => {
    makeDownloadRequest(`/${data.id}`, "GET");
  };

  useEffect(() => {
    if (downloadResponse) {
      DownloadJSON(downloadResponse);
    }
  }, [downloadResponse]);

  return (<>

    <Dialog open={showDialog} onOpenChange={() => { setShowDialog(false); }}>
      <DialogContent className="sm:max-w-[425px]">

        <DialogHeader>
          <DialogTitle className="text-2xl">{data.name}</DialogTitle>

          <DialogDescription className="w-100% p-0 m-auto ">
            <img src={imgUrl} className="rounded-2xl border-primary border" />
          </DialogDescription>

          <div className="my-2">

            {dialogDescriptionTexts?.map((description, index) => (
              <DialogDescription key={index} className="w-100% p-0 m-auto ">
                {description}
              </DialogDescription>
            ))}

          </div>

        </DialogHeader>
        <DialogFooter>
          <div className=" grid grid-cols-2 justify-center w-full items-center gap-2 gap-y-6 p-2 ">

            <a download href={imgUrl} className=" h-9 px-4 py-2 bg-primary hover:bg-primary/80 text-primary-foreground cursor-pointer font-bold rounded-md inline-flex items-center justify-center whitespace-nowrap text-sm "> DOWNLOAD IMAGE </a>

            <a onClick={handleDownload} className=" h-9 px-4 py-2 bg-primary hover:bg-primary/80 text-primary-foreground cursor-pointer  font-bold rounded-md inline-flex items-center justify-center whitespace-nowrap text-sm "> DOWNLOAD OBJECT </a>

            <Button className="font-bold"
              onClick={handleUpdate}>{showUpdating ? "CANCEL" : "CHANGE"}</Button>

            <Button className="bg-destructive hover:bg-destructive/80 font-bold"
              onClick={handleDelete}>DELETE</Button>

          </div>
        </DialogFooter>

        {showUpdating ?
          <UpdateObjectForm objectsID={data.id} publicVisibility={data.isPublic} objectsName={data.name} patchUrl={patchUrl} />
          : null
        }

        {downloadError ?
          <div className="w-[100%] text-center text-fail-primary">{downloadError}</div> : null
        }
        {downloadResponse ?
          <div className="w-[100%] text-center text-success-primary">DOWNLOADED SUCCESFULLY</div> : null
        }

        {deleteError ?
          <div className="w-[100%] text-center text-fail-primary">{deleteError}</div> : null
        }
        {deleteResponse ?
          <div className="w-[100%] text-center text-success-primary">{deleteResponse.message}</div> : null
        }
      </DialogContent >
    </Dialog >

  </>);

}

