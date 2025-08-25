import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { DownloadJSON } from "@/lib/DownloadJSON";
import type { MitsuShortObjectData } from "@/lib/types/ServerResponseTypes";
import { formatDateString } from "@/lib/utils";
import { useEffect } from "react";

type Props = {
  objectData: MitsuShortObjectData,
  showDialog: boolean,
  setShowDialog: CallableFunction,
}

const PUBLIC_OBJECTS3D_DOWNLOAD = "/api/v1/objects3D/download/public";

export function MitsuObjectDialog({ objectData, showDialog, setShowDialog }: Props) {
  const { response, error, makeRequest } = useAuthFetch(PUBLIC_OBJECTS3D_DOWNLOAD);
  const imgUrl = "/api/v1/image" + objectData.imgPath;
  const creationDate = formatDateString(objectData.createdAt.toString());

  const downloadObject = () => {
    makeRequest(`/${objectData.id}`, "GET");
  };

  useEffect(() => {
    if (response) {
      DownloadJSON(response);
    }
  }, [response]);

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
          </div>

        </DialogHeader>
        <DialogFooter>
          <div className=" grid grid-cols-2 justify-center w-full items-center gap-2 gap-y-6 p-2 ">

            <a download href={imgUrl} className=" h-9 px-4 py-2 bg-primary hover:bg-primary/80 text-primary-foreground cursor-pointer font-bold rounded-md inline-flex items-center justify-center whitespace-nowrap text-sm "> DOWNLOAD IMAGE </a>

            <a onClick={downloadObject} className=" h-9 px-4 py-2 bg-primary hover:bg-primary/80 text-primary-foreground cursor-pointer  font-bold rounded-md inline-flex items-center justify-center whitespace-nowrap text-sm "> DOWNLOAD OBJECT </a>

          </div>
        </DialogFooter>
        {error ?
          <div className="w-[100%] text-center text-fail-primary">{error}</div> : null
        }
      </DialogContent >
    </Dialog >


  </>);

}

