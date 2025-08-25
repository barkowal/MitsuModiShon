import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { DownloadJSON } from "@/lib/DownloadJSON";
import type { MitsuShortObjectData, SuccessfullResponse } from "@/lib/types/ServerResponseTypes";
import { formatDateString } from "@/lib/utils";
import { useEffect, useState } from "react";
import { MitsuUpdateObjectForm } from "./MitsuUpdateObjectForm";

type Props = {
  objectData: MitsuShortObjectData,
  showDialog: boolean,
  setShowDialog: CallableFunction,
}

const USERS_OBJECTS3D_DOWNLOAD = "/api/v1/objects3D/download/users";
const USERS_OBJECTS3D_DELETE = "/api/v1/objects3D";

export function MitsuUserObjectDialog({ objectData, showDialog, setShowDialog }: Props) {
  const { response: downloadResponse, error: downloadError, makeRequest: makeDownloadRequest } = useAuthFetch(USERS_OBJECTS3D_DOWNLOAD);
  const { response: deleteResponse, error: deleteError, makeRequest: makeDeleteRequest } = useAuthFetch<SuccessfullResponse>(USERS_OBJECTS3D_DELETE);
  const imgUrl = "/api/v1/image" + objectData.imgPath;
  const creationDate = formatDateString(objectData.createdAt.toString());
  const [showUpdating, setShowUpdating] = useState(false);

  const handleDelete = () => {
    makeDeleteRequest(`/${objectData.id}`, "DELETE");
  };

  const handleUpdate = () => {
    setShowUpdating(prev => !prev);
  };

  const handleDownload = () => {
    makeDownloadRequest(`/${objectData.id}`, "GET");
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
          <DialogTitle className="text-2xl">{objectData.name}</DialogTitle>

          <DialogDescription className="w-100% p-0 m-auto ">
            <img src={imgUrl} className="rounded-2xl border-primary border" />
          </DialogDescription>

          <div className="my-2">
            <DialogDescription className="w-100% p-0 m-auto font-bold ">
              {objectData.isAnimated ? "Animation" : "Static"} Object
            </DialogDescription >
            <DialogDescription className="w-100% p-0 m-auto ">
              Published By: {objectData.username}
            </DialogDescription>
            <DialogDescription className="w-100% p-0 m-auto ">
              Created At: {creationDate}
            </DialogDescription>
            <DialogDescription className="w-100% p-0 m-auto ">
              Visibility: {objectData.isPublic ? "Public" : "Private"}
            </DialogDescription >
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
          <MitsuUpdateObjectForm objectsID={objectData.id} publicVisibility={objectData.isPublic} objectsName={objectData.name} />
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

